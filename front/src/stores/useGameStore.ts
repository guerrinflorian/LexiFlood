import { defineStore } from 'pinia';
import words from 'an-array-of-french-words';

const LETTER_WEIGHTS: Record<string, number> = {
  E: 15,
  A: 9,
  I: 8,
  S: 7,
  N: 7,
  R: 7,
  T: 7,
  O: 6,
  U: 6,
  L: 5,
  D: 3,
  M: 3,
  C: 3,
  P: 3,
  G: 2,
  B: 2,
  V: 2,
  H: 2,
  F: 2,
  J: 1,
  Q: 1,
  K: 1,
  W: 1,
  X: 1,
  Y: 1,
  Z: 1
};

const MAX_SLOTS = 20;
const SPAWN_INTERVAL_MS = 800;
const ROUND_DURATIONS: Record<number, number> = {
  1: 90,
  2: 90,
  3: 90,
  4: 60
};
const PLAYER_NAME = 'LexiHero';

const createSlots = () =>
  Array.from({ length: MAX_SLOTS }, (_, index) => ({
    id: index,
    letter: null as string | null,
    selected: false,
    isNew: false
  }));

const getRandomLetter = () => {
  const bag: string[] = [];
  Object.entries(LETTER_WEIGHTS).forEach(([letter, weight]) => {
    for (let count = 0; count < weight; count += 1) {
      bag.push(letter);
    }
  });
  return bag[Math.floor(Math.random() * bag.length)];
};

const normalizeWord = (value: string) =>
  value
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z]/g, '');

const DICTIONARY = new Set(words.map((word) => normalizeWord(word)).filter(Boolean));

const getRoundDuration = (round: number) => ROUND_DURATIONS[round] ?? ROUND_DURATIONS[1];

const getTargetPlayersForRound = (round: number, totalPlayers: number) => {
  if (round === 1) {
    if (totalPlayers >= 20) {
      return 12;
    }
    return Math.ceil((totalPlayers * 2) / 3);
  }
  if (round === 2) {
    return 6;
  }
  if (round === 3) {
    return 3;
  }
  return 1;
};

let spawnInterval: ReturnType<typeof setInterval> | null = null;
let roundInterval: ReturnType<typeof setInterval> | null = null;

export type Player = {
  id: string;
  name: string;
  score: number;
  eliminated: boolean;
};

export const useGameStore = defineStore('game', {
  state: () => ({
    slots: createSlots(),
    selectedIndices: [] as number[],
    score: 0,
    highScore: Number(localStorage.getItem('lexiflood_highscore') ?? 0),
    mode: 'solo' as 'solo' | 'multi',
    playerName: PLAYER_NAME,
    players: [] as Player[],
    round: 1,
    roundTimeLeft: getRoundDuration(1),
    gameOver: false,
    lastValidation: '' as string | null,
    lastValidationStatus: null as 'success' | 'error' | null,
    errorIndices: [] as number[],
    roundBanner: '' as string | null
  }),
  getters: {
    currentWord(state) {
      return state.selectedIndices
        .map((index) => state.slots[index]?.letter ?? '')
        .join('');
    },
    activePlayers(state) {
      return state.players.filter((player) => !player.eliminated);
    }
  },
  actions: {
    setPlayerName(name: string) {
      this.playerName = name.trim() || PLAYER_NAME;
    },
    resetGame(mode: 'solo' | 'multi') {
      this.mode = mode;
      this.slots = createSlots();
      this.selectedIndices = [];
      this.score = 0;
      this.round = 1;
      this.roundTimeLeft = getRoundDuration(1);
      this.gameOver = false;
      this.lastValidation = null;
      this.lastValidationStatus = null;
      this.errorIndices = [];
      this.roundBanner = null;
      if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
      }
      if (roundInterval) {
        clearInterval(roundInterval);
        roundInterval = null;
      }
    },
    startSolo() {
      this.resetGame('solo');
      this.players = [];
      this.startSpawnLoop();
    },
    startMulti(playerCount: number) {
      this.resetGame('multi');
      const totalPlayers = Math.max(2, Math.min(20, playerCount));
      this.players = Array.from({ length: totalPlayers }, (_, index) => ({
        id: index === 0 ? 'you' : `player-${index + 1}`,
        name: index === 0 ? this.playerName : `Joueur ${index + 1}`,
        score: 0,
        eliminated: false
      }));
      this.startSpawnLoop();
      this.startRoundTimer();
    },
    startSpawnLoop() {
      spawnInterval = setInterval(() => {
        if (this.gameOver) {
          return;
        }
        this.spawnLetter();
      }, SPAWN_INTERVAL_MS);
    },
    startRoundTimer() {
      this.roundTimeLeft = getRoundDuration(this.round);
      roundInterval = setInterval(() => {
        if (this.gameOver) {
          return;
        }
        if (this.roundTimeLeft <= 0) {
          this.finishRound();
          return;
        }
        this.roundTimeLeft -= 1;
      }, 1000);
    },
    finishRound() {
      const activePlayers = this.players.filter((player) => !player.eliminated);
      const target = getTargetPlayersForRound(this.round, activePlayers.length);
      const sorted = [...activePlayers].sort((a, b) => b.score - a.score);
      const survivors = new Set(sorted.slice(0, target).map((player) => player.id));
      this.players = this.players.map((player) => ({
        ...player,
        eliminated: player.eliminated || !survivors.has(player.id)
      }));
      if (this.round >= 4 || survivors.size <= 1) {
        this.gameOver = true;
        if (roundInterval) {
          clearInterval(roundInterval);
          roundInterval = null;
        }
        return;
      }
      this.round += 1;
      this.roundTimeLeft = getRoundDuration(this.round);
      this.simulateOpponents();
      this.showRoundBanner();
    },
    showRoundBanner() {
      this.roundBanner = `ROUND ${this.round} - ÉLIMINATION`;
      setTimeout(() => {
        this.roundBanner = null;
      }, 2000);
    },
    simulateOpponents() {
      this.players = this.players.map((player) => {
        if (player.id === 'you' || player.eliminated) {
          return player;
        }
        const bonus = Math.floor(Math.random() * 30);
        return {
          ...player,
          score: player.score + bonus
        };
      });
    },
    spawnLetter() {
      const emptySlots = this.slots
        .map((slot, index) => (slot.letter ? null : index))
        .filter((index): index is number => index !== null);
      if (emptySlots.length === 0) {
        this.handleRackOverflow();
        return;
      }
      const targetIndex = emptySlots[Math.floor(Math.random() * emptySlots.length)];
      this.slots[targetIndex].letter = getRandomLetter();
      this.slots[targetIndex].isNew = true;
      setTimeout(() => {
        if (this.slots[targetIndex]) {
          this.slots[targetIndex].isNew = false;
        }
      }, 400);
    },
    handleRackOverflow() {
      this.gameOver = true;
      this.lastValidation = 'Game Over : rack saturé.';
      this.lastValidationStatus = 'error';
      if (this.mode === 'multi') {
        this.players = this.players.map((player) =>
          player.id === 'you' ? { ...player, eliminated: true } : player
        );
      }
      if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
      }
      if (roundInterval) {
        clearInterval(roundInterval);
        roundInterval = null;
      }
    },
    toggleSelect(index: number) {
      const slot = this.slots[index];
      if (!slot.letter || this.gameOver) {
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
    submitWord() {
      if (this.selectedIndices.length === 0) {
        return;
      }
      const word = this.currentWord;
      const isValid = DICTIONARY.has(normalizeWord(word));
      if (isValid && word.length > 0) {
        const points = word.length * word.length;
        this.score += points;
        if (this.mode === 'multi') {
          const you = this.players.find((player) => player.id === 'you');
          if (you) {
            you.score += points;
          }
        }
        this.selectedIndices.forEach((index) => {
          this.slots[index].letter = null;
          this.slots[index].selected = false;
        });
        this.selectedIndices = [];
        this.lastValidation = `+${points} points pour ${word}`;
        this.lastValidationStatus = 'success';
        if (this.mode === 'solo' && this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('lexiflood_highscore', String(this.score));
        }
      } else {
        this.lastValidation = `${word} n'est pas valide.`;
        this.lastValidationStatus = 'error';
        this.errorIndices = [...this.selectedIndices];
        setTimeout(() => {
          this.errorIndices = [];
        }, 400);
        this.clearSelection();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(120);
        }
      }
    }
  }
});
