import { Notify } from 'quasar';
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
const INITIAL_LETTERS = 5;
const SPAWN_INTERVAL_MS = 2500;
const OVERFLOW_COUNTDOWN_SECONDS = 5;
const PLAYER_NAME = 'LexiHero';

const LETTER_POINTS: Record<string, number> = {
  A: 1,
  E: 1,
  I: 1,
  L: 1,
  N: 1,
  O: 1,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  D: 2,
  G: 2,
  M: 2,
  B: 2,
  C: 2,
  P: 2,
  F: 3,
  H: 3,
  V: 3,
  W: 3,
  Y: 3,
  J: 5,
  Q: 5,
  K: 5,
  X: 5,
  Z: 5
};

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

const getLengthModifiers = (length: number) => {
  if (length === 2) {
    return { multiplier: 0.5, bonus: 0 };
  }
  if (length === 3) {
    return { multiplier: 1, bonus: 0 };
  }
  if (length === 4) {
    return { multiplier: 1.1, bonus: 5 };
  }
  if (length === 5) {
    return { multiplier: 1.2, bonus: 10 };
  }
  if (length === 6) {
    return { multiplier: 1.3, bonus: 20 };
  }
  if (length === 7) {
    return { multiplier: 1.4, bonus: 30 };
  }
  if (length >= 8) {
    return { multiplier: 1.5, bonus: 50 };
  }
  return { multiplier: 1, bonus: 0 };
};

const computeScore = (word: string) => {
  const letters = word.split('');
  const letterSum = letters.reduce((sum, letter) => sum + (LETTER_POINTS[letter] ?? 0), 0);
  const { multiplier, bonus } = getLengthModifiers(word.length);
  return Math.floor(letterSum * multiplier + bonus);
};

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

let spawnInterval: ReturnType<typeof setInterval> | null = null;
let overflowInterval: ReturnType<typeof setInterval> | null = null;

export const useGameStore = defineStore('game', {
  state: () => ({
    slots: createSlots(),
    selectedIndices: [] as number[],
    score: 0,
    highScore: Number(localStorage.getItem('lexiflood_highscore') ?? 0),
    playerName: PLAYER_NAME,
    round: 1,
    gameOver: false,
    hasSubmittedThisRound: false,
    lastValidation: '' as string | null,
    lastValidationStatus: null as 'success' | 'error' | null,
    errorIndices: [] as number[],
    overflowCountdown: null as number | null,
    usedWords: [] as string[]
  }),
  getters: {
    currentWord(state) {
      return state.selectedIndices
        .map((index) => state.slots[index]?.letter ?? '')
        .join('');
    }
  },
  actions: {
    setPlayerName(name: string) {
      this.playerName = name.trim() || PLAYER_NAME;
    },
    resetGame() {
      this.slots = createSlots();
      this.selectedIndices = [];
      this.score = 0;
      this.round = 1;
      this.gameOver = false;
      this.hasSubmittedThisRound = false;
      this.lastValidation = null;
      this.lastValidationStatus = null;
      this.errorIndices = [];
      this.overflowCountdown = null;
      this.usedWords = [];
      if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
      }
      if (overflowInterval) {
        clearInterval(overflowInterval);
        overflowInterval = null;
      }
    },
    startSolo() {
      this.resetGame();
      this.seedInitialLetters();
      this.startSpawnLoop();
    },
    startSpawnLoop() {
      spawnInterval = setInterval(() => {
        if (this.gameOver || this.overflowCountdown !== null) {
          return;
        }
        this.spawnLetter();
        this.advanceRound();
      }, SPAWN_INTERVAL_MS);
    },
    seedInitialLetters() {
      for (let count = 0; count < INITIAL_LETTERS; count += 1) {
        this.placeRandomLetter();
      }
    },
    advanceRound() {
      this.round += 1;
      this.hasSubmittedThisRound = false;
    },
    placeRandomLetter() {
      const emptySlots = this.slots
        .map((slot, index) => (slot.letter ? null : index))
        .filter((index): index is number => index !== null);
      if (emptySlots.length === 0) {
        return false;
      }
      const targetIndex = emptySlots[Math.floor(Math.random() * emptySlots.length)];
      this.slots[targetIndex].letter = getRandomLetter();
      this.slots[targetIndex].isNew = true;
      setTimeout(() => {
        if (this.slots[targetIndex]) {
          this.slots[targetIndex].isNew = false;
        }
      }, 400);
      return true;
    },
    spawnLetter() {
      const placed = this.placeRandomLetter();
      if (!placed) {
        this.handleRackOverflow();
      }
    },
    handleRackOverflow() {
      if (this.overflowCountdown !== null || this.gameOver) {
        return;
      }
      this.overflowCountdown = OVERFLOW_COUNTDOWN_SECONDS;
      if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
      }
      overflowInterval = setInterval(() => {
        if (this.overflowCountdown === null) {
          return;
        }
        if (this.overflowCountdown <= 1) {
          this.overflowCountdown = null;
          this.finishGame('Game Over : rack saturé.');
          return;
        }
        this.overflowCountdown -= 1;
      }, 1000);
    },
    finishGame(message: string) {
      this.gameOver = true;
      this.lastValidation = message;
      this.lastValidationStatus = 'error';
      if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
      }
      if (overflowInterval) {
        clearInterval(overflowInterval);
        overflowInterval = null;
      }
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
      if (!spawnInterval && !this.gameOver) {
        this.startSpawnLoop();
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
      if (this.hasSubmittedThisRound) {
        this.lastValidation = 'Un seul mot autorisé par round.';
        this.lastValidationStatus = 'error';
        notifyError(this.lastValidation);
        return;
      }
      const word = this.currentWord;
      const normalizedWord = normalizeWord(word);
      const isValid = DICTIONARY.has(normalizedWord);
      if (this.usedWords.includes(normalizedWord)) {
        this.lastValidation = `${word} a déjà été joué.`;
        this.lastValidationStatus = 'error';
        notifyError(this.lastValidation);
        return;
      }
      if (isValid && word.length > 0) {
        const points = computeScore(normalizedWord);
        this.score += points;
        this.usedWords.push(normalizedWord);
        this.selectedIndices.forEach((index) => {
          this.slots[index].letter = null;
          this.slots[index].selected = false;
        });
        this.selectedIndices = [];
        this.lastValidation = `+${points} points pour ${word}`;
        this.lastValidationStatus = 'success';
        notifySuccess(this.lastValidation);
        this.hasSubmittedThisRound = true;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('lexiflood_highscore', String(this.score));
        }
        this.resolveOverflowIfPossible();
      } else {
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
      }
    }
  }
});
