import { Notify } from 'quasar';
import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';
import { computeScore, isValidWord, normalizeWord } from './wordUtils';

const MAX_SLOTS = 20;
const OVERFLOW_COUNTDOWN_SECONDS = 5;
const SOCKET_URL = `http://${window.location.hostname}:3000`;

type Slot = {
  id: number;
  letter: string | null;
  selected: boolean;
  isNew: boolean;
};

type PlayerSummary = {
  id: string;
  name: string;
  ready?: boolean;
  score: number;
  ko: boolean;
  eliminated: boolean;
  connected: boolean;
  position?: number;
};

type RoundSnapshot = {
  roundIndex: number;
  totalRounds: number;
  targetQualified: number;
  roundStartAt: number;
  durationMs: number;
  letterIntervalMs: number;
  initialLetters: string[];
};

const createSlots = () =>
  Array.from({ length: MAX_SLOTS }, (_, index) => ({
    id: index,
    letter: null as string | null,
    selected: false,
    isNew: false
  }));

const notifyError = (message: string) => {
  Notify.create({
    message,
    color: 'negative',
    position: 'top',
    timeout: 2200
  });
};

const notifySuccess = (message: string) => {
  Notify.create({
    message,
    color: 'positive',
    position: 'top',
    timeout: 1800
  });
};

let socket: Socket | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let overflowInterval: ReturnType<typeof setInterval> | null = null;

export const useMultiplayerStore = defineStore('multiplayer', {
  state: () => ({
    phase: 'entry' as 'entry' | 'lobby' | 'inRound' | 'roundEnd' | 'finished',
    roomCode: '' as string,
    playerName: '' as string,
    playerId: '' as string,
    playerToken: '' as string,
    hostId: '' as string,
    players: [] as PlayerSummary[],
    scoreboard: [] as PlayerSummary[],
    roundIndex: 0,
    totalRounds: 0,
    targetQualified: 0,
    roundStartAt: 0,
    durationMs: 0,
    letterIntervalMs: 0,
    timeLeftMs: 0,
    slots: createSlots(),
    selectedIndices: [] as number[],
    overflowCountdown: null as number | null,
    usedWords: [] as string[],
    wordHistory: [] as Array<{ id: number; word: string; points: number; time: string }>,
    lastValidation: null as string | null,
    lastValidationStatus: null as 'success' | 'error' | null,
    errorIndices: [] as number[],
    roundResult: null as {
      eliminatedIds: string[];
      qualifiedIds: string[];
      scoreboard: PlayerSummary[];
    } | null,
    finalResult: null as {
      winnerId: string | null;
      scoreboard: PlayerSummary[];
    } | null
  }),
  getters: {
    isHost: (state) => state.playerId === state.hostId,
    currentWord(state) {
      return state.selectedIndices
        .map((index) => state.slots[index]?.letter ?? '')
        .join('');
    },
    wordPreview(state) {
      const rawWord = state.selectedIndices
        .map((index) => state.slots[index]?.letter ?? '')
        .join('');
      const normalizedWord = normalizeWord(rawWord);
      if (!normalizedWord) {
        return { status: 'empty', label: 'Sélectionnez des lettres', points: 0 };
      }
      const isValid = isValidWord(normalizedWord);
      const points = computeScore(normalizedWord);
      if (state.usedWords.includes(normalizedWord)) {
        return { status: 'used', label: 'Mot déjà utilisé', points };
      }
      if (!isValid) {
        return { status: 'invalid', label: 'Mot invalide', points: 0 };
      }
      return { status: 'valid', label: 'Mot valide', points };
    }
  },
  actions: {
    connect() {
      if (socket) {
        return;
      }
      socket = io(SOCKET_URL, { transports: ['websocket'] });

      socket.on('connect', () => {
        this.playerId = socket?.id ?? '';
      });

      socket.on('disconnect', () => {
        this.playerId = '';
        notifyError('Déconnecté du serveur.');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        notifyError('Impossible de se connecter au serveur. Vérifiez que le port 3000 est ouvert sur votre pare-feu.');
      });

      socket.on('room:created', (payload) => {
        this.roomCode = payload.code;
        this.playerToken = payload.token;
        this.playerId = payload.playerId;
        this.hostId = payload.hostId;
        this.phase = 'lobby';
        localStorage.setItem(`lexiflood_multi_token_${payload.code}`, payload.token);
      });

      socket.on('room:joined', (payload) => {
        this.roomCode = payload.code;
        this.playerToken = payload.token;
        this.playerId = payload.playerId;
        this.hostId = payload.hostId;
        this.phase = 'lobby';
        if (payload.token) {
          localStorage.setItem(`lexiflood_multi_token_${payload.code}`, payload.token);
        }
      });

      socket.on('room:state', (payload) => {
        this.hostId = payload.hostId;
        this.players = payload.players;
        if (payload.status === 'lobby') {
          this.phase = 'lobby';
        }
      });

      socket.on('game:round:start', (payload: RoundSnapshot) => {
        this.startRound(payload);
      });

      socket.on('game:letter', ({ letter }) => {
        this.applyLetter(letter);
      });

      socket.on('game:scoreboard', ({ scoreboard }) => {
        this.scoreboard = scoreboard;
      });

      socket.on('game:round:end', (payload) => {
        this.phase = 'roundEnd';
        this.roundResult = payload;
        this.roundIndex = payload.roundIndex;
        this.totalRounds = payload.totalRounds;
        this.scoreboard = payload.scoreboard ?? [];
        this.stopTimers();
      });

      socket.on('game:end', (payload) => {
        this.phase = 'finished';
        this.finalResult = payload;
        this.scoreboard = payload.scoreboard ?? [];
        this.stopTimers();
      });

      socket.on('game:snapshot', (payload) => {
        this.applySnapshot(payload);
      });

      socket.on('word:result', (payload) => {
        if (!payload.ok) {
          notifyError(payload.message ?? 'Mot refusé.');
          this.lastValidation = payload.message ?? 'Mot refusé.';
          this.lastValidationStatus = 'error';
          return;
        }
        const points = payload.points ?? 0;
        const word = payload.word ?? '';
        const timestamp = new Date();
        const timeLabel = timestamp.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        this.usedWords.push(word);
        this.wordHistory = [
          {
            id: timestamp.getTime(),
            word: word.toUpperCase(),
            points,
            time: timeLabel
          },
          ...this.wordHistory
        ];
        this.lastValidation = `+${points} points pour ${word}`;
        this.lastValidationStatus = 'success';
        notifySuccess(this.lastValidation);
        this.removeSelectedLetters();
        this.resolveOverflowIfPossible();
      });

      socket.on('error', (payload) => {
        if (payload?.message) {
          notifyError(payload.message);
        }
      });
    },
    createRoom(name: string) {
      this.connect();
      this.playerName = name.trim() || 'LexiHero';
      socket?.emit('room:create', { name: this.playerName });
    },
    joinRoom(code: string, name: string) {
      this.connect();
      const trimmedCode = code.trim().toUpperCase();
      this.playerName = name.trim() || 'LexiHero';
      const token = localStorage.getItem(`lexiflood_multi_token_${trimmedCode}`) ?? undefined;
      socket?.emit('room:join', { code: trimmedCode, name: this.playerName, token });
    },
    leaveRoom() {
      socket?.emit('room:leave');
      this.resetState();
    },
    toggleReady(ready: boolean) {
      socket?.emit('player:ready', { ready });
    },
    startGame() {
      socket?.emit('game:start');
    },
    startRound(payload: RoundSnapshot) {
      this.phase = 'inRound';
      this.roundIndex = payload.roundIndex;
      this.totalRounds = payload.totalRounds;
      this.targetQualified = payload.targetQualified;
      this.roundStartAt = payload.roundStartAt;
      this.durationMs = payload.durationMs;
      this.letterIntervalMs = payload.letterIntervalMs;
      this.timeLeftMs = payload.durationMs;
      this.resetBoard();
      this.stopTimers();
      this.roundResult = null;
      this.finalResult = null;
      const startDelay = Math.max(payload.roundStartAt - Date.now(), 0);
      setTimeout(() => {
        payload.initialLetters.forEach((letter) => {
          this.applyLetter(letter);
        });
      }, startDelay);
      this.startCountdown();
    },
    applySnapshot(payload: any) {
      if (payload.status === 'inRound' || payload.status === 'roundEnd') {
        this.resetBoard();
        this.phase = payload.status === 'roundEnd' ? 'roundEnd' : 'inRound';
        this.roundIndex = payload.roundIndex;
        this.totalRounds = payload.totalRounds;
        this.targetQualified = payload.targetQualified ?? 0;
        this.roundStartAt = payload.roundStartAt ?? 0;
        this.durationMs = payload.durationMs ?? 0;
        this.letterIntervalMs = payload.letterIntervalMs ?? 0;
        this.timeLeftMs = payload.durationMs ?? 0;
        const letters = Array.isArray(payload.letterHistory)
          ? payload.letterHistory.sort((a: { tickIndex: number }, b: { tickIndex: number }) => a.tickIndex - b.tickIndex)
          : [];
        letters.forEach((entry: { letter: string }) => this.applyLetter(entry.letter, { silent: true }));
        this.scoreboard = payload.scoreboard ?? [];
        this.startCountdown();
      }
      if (payload.status === 'finished') {
        this.phase = 'finished';
        this.finalResult = {
          winnerId: payload.winnerId ?? null,
          scoreboard: payload.scoreboard ?? []
        };
        this.scoreboard = payload.scoreboard ?? [];
      }
    },
    startCountdown() {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      countdownInterval = setInterval(() => {
        if (!this.roundStartAt || !this.durationMs) {
          return;
        }
        const now = Date.now();
        const endAt = this.roundStartAt + this.durationMs;
        this.timeLeftMs = Math.max(endAt - now, 0);
        if (this.timeLeftMs <= 0 && countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
      }, 200);
    },
    stopTimers() {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      if (overflowInterval) {
        clearInterval(overflowInterval);
        overflowInterval = null;
      }
      this.overflowCountdown = null;
    },
    resetBoard() {
      this.slots = createSlots();
      this.selectedIndices = [];
      this.overflowCountdown = null;
      this.usedWords = [];
      this.wordHistory = [];
      this.lastValidation = null;
      this.lastValidationStatus = null;
      this.errorIndices = [];
    },
    resetState() {
      this.phase = 'entry';
      this.roomCode = '';
      this.playerName = '';
      this.playerToken = '';
      this.playerId = '';
      this.hostId = '';
      this.players = [];
      this.scoreboard = [];
      this.roundIndex = 0;
      this.totalRounds = 0;
      this.roundStartAt = 0;
      this.durationMs = 0;
      this.timeLeftMs = 0;
      this.roundResult = null;
      this.finalResult = null;
      this.resetBoard();
    },
    applyLetter(letter: string, options: { silent?: boolean } = {}) {
      const emptySlotIndex = this.slots.findIndex((slot) => !slot.letter);
      if (emptySlotIndex === -1) {
        if (!options.silent) {
          this.handleRackOverflow();
        }
        return;
      }
      this.slots[emptySlotIndex].letter = letter;
      this.slots[emptySlotIndex].isNew = true;
      setTimeout(() => {
        if (this.slots[emptySlotIndex]) {
          this.slots[emptySlotIndex].isNew = false;
        }
      }, 400);
    },
    handleRackOverflow() {
      if (this.overflowCountdown !== null) {
        return;
      }
      this.overflowCountdown = OVERFLOW_COUNTDOWN_SECONDS;
      overflowInterval = setInterval(() => {
        if (this.overflowCountdown === null) {
          return;
        }
        if (this.overflowCountdown <= 1) {
          this.overflowCountdown = null;
          if (overflowInterval) {
            clearInterval(overflowInterval);
            overflowInterval = null;
          }
          socket?.emit('player:ko');
          return;
        }
        this.overflowCountdown -= 1;
      }, 1000);
    },
    resolveOverflowIfPossible() {
      if (this.overflowCountdown === null) {
        return;
      }
      const hasSpace = this.slots.some((slot) => !slot.letter);
      if (!hasSpace) {
        return;
      }
      this.overflowCountdown = null;
      if (overflowInterval) {
        clearInterval(overflowInterval);
        overflowInterval = null;
      }
    },
    toggleSelect(index: number) {
      if (this.phase !== 'inRound') {
        return;
      }
      const me = this.scoreboard.find((player) => player.id === this.playerId);
      if (me?.ko || me?.eliminated) {
        return;
      }
      const slot = this.slots[index];
      if (!slot.letter) {
        return;
      }
      if (slot.selected) {
        slot.selected = false;
        this.selectedIndices = this.selectedIndices.filter((item) => item !== index);
      } else {
        slot.selected = true;
        this.selectedIndices.push(index);
      }
    },
    clearSelection() {
      this.selectedIndices.forEach((index) => {
        if (this.slots[index]) {
          this.slots[index].selected = false;
        }
      });
      this.selectedIndices = [];
    },
    removeSelectedLetters() {
      this.selectedIndices.forEach((index) => {
        this.slots[index].letter = null;
        this.slots[index].selected = false;
      });
      this.selectedIndices = [];
    },
    submitWord() {
      if (this.selectedIndices.length === 0 || this.phase !== 'inRound') {
        return;
      }
      const me = this.scoreboard.find((player) => player.id === this.playerId);
      if (me?.ko || me?.eliminated) {
        return;
      }
      const word = this.currentWord;
      const normalizedWord = normalizeWord(word);
      if (this.usedWords.includes(normalizedWord)) {
        this.lastValidation = `${word} a déjà été joué.`;
        this.lastValidationStatus = 'error';
        notifyError(this.lastValidation);
        this.clearSelection();
        return;
      }
      if (!isValidWord(normalizedWord)) {
        this.lastValidation = `${word} n'est pas valide.`;
        this.lastValidationStatus = 'error';
        notifyError(this.lastValidation);
        this.errorIndices = [...this.selectedIndices];
        setTimeout(() => {
          this.errorIndices = [];
        }, 400);
        this.clearSelection();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(120);
        }
        return;
      }
      socket?.emit('word:submit', { word: normalizedWord });
    }
  }
});
