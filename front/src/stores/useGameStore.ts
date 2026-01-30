import { Notify } from 'quasar';
import { defineStore } from 'pinia';
import words from 'an-array-of-french-words';

const LETTER_BAG_COUNTS: Record<string, number> = {
  E: 15,
  A: 9,
  I: 8,
  O: 6,
  U: 5,
  Y: 2,
  S: 7,
  R: 6,
  T: 6,
  N: 6,
  L: 5,
  D: 3,
  M: 3,
  P: 2,
  C: 2,
  B: 2,
  F: 2,
  G: 2,
  H: 2,
  V: 1,
  J: 1,
  Q: 1,
  K: 1,
  W: 1,
  X: 1,
  Z: 1,
  '?': 1
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

const MAX_SLOTS = 20;
const INITIAL_LETTERS = 3;
const SPAWN_INTERVAL_MS = 2500;
const OVERFLOW_COUNTDOWN_SECONDS = 6;
const PAUSE_DURATION_MS = 10_000;
const PAUSE_COOLDOWN_MS = 60_000;
const PLAYER_NAME = 'LexiHero';
const PLAYER_NAME_STORAGE_KEY = 'lexiflood_player_name';

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
  Z: 5,
  '?': 0
};

const MULTIPLIER_BASE = 1;
const MULTIPLIER_MIN = 0.75;
const MULTIPLIER_MAX = 5;

const createSlots = () =>
  Array.from({ length: MAX_SLOTS }, (_, index) => ({
    id: index,
    letter: null as string | null,
    selected: false,
    isNew: false
  }));

const buildLetterBag = () => {
  const bag: string[] = [];
  Object.entries(LETTER_BAG_COUNTS).forEach(([letter, count]) => {
    for (let item = 0; item < count; item += 1) {
      bag.push(letter);
    }
  });
  return bag;
};

const normalizeWord = (value: string) =>
  value
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z?]/g, '');

const WORD_LIST = Array.isArray(words) ? (words as string[]) : [];
const DICTIONARY = new Set(WORD_LIST.map((word) => normalizeWord(word)).filter(Boolean));
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const matchesWithWildcards = (word: string): boolean => {
  const wildcardIndex = word.indexOf('?');
  if (wildcardIndex === -1) {
    return DICTIONARY.has(word);
  }
  const prefix = word.slice(0, wildcardIndex);
  const suffix = word.slice(wildcardIndex + 1);
  for (const letter of ALPHABET) {
    if (matchesWithWildcards(`${prefix}${letter}${suffix}`)) {
      return true;
    }
  }
  return false;
};

const getLengthModifiers = (length: number) => {
  if (length === 2) {
    return { multiplier: 0.6, bonus: 0 };
  }
  if (length === 3) {
    return { multiplier: 1.1, bonus: 0 };
  }
  if (length === 4) {
    return { multiplier: 1.2, bonus: 5 };
  }
  if (length === 5) {
    return { multiplier: 1.3, bonus: 10 };
  }
  if (length === 6) {
    return { multiplier: 1.4, bonus: 20 };
  }
  if (length === 7) {
    return { multiplier: 1.5, bonus: 30 };
  }
  if (length >= 8) {
    return { multiplier: 1.7, bonus: 50 };
  }
  if (length >= 10) {
    return { multiplier: 2, bonus: 70 };
  }
  return { multiplier: 1, bonus: 0 };
};

const computeScore = (word: string) => {
  const letters = word.split('');
  const letterSum = letters.reduce((sum, letter) => sum + (LETTER_POINTS[letter] ?? 0), 0);
  const { multiplier, bonus } = getLengthModifiers(word.length);
  return Math.floor(letterSum * multiplier + bonus);
};

const getMultiplierDelta = (length: number) => {
  if (length === 1) {
    return -0.5;
  }
  if (length === 2) {
    return -0.25;
  }
  if (length === 3) {
    return -0.15;
  }
  if (length === 4) {
    return -0.05;
  }
  if (length === 5) {
    return 0.05;
  }
  if (length === 6) {
    return 0.20;
  }
  if (length === 7) {
    return 0.5;
  }
  if (length === 8) {
    return 0.75;
  }
  if (length > 8) {
    return 1;
  }
  return 0;
};

const clampMultiplier = (value: number) => Math.min(MULTIPLIER_MAX, Math.max(MULTIPLIER_MIN, value));

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
let timerInterval: ReturnType<typeof setInterval> | null = null;

const getConsonantStreak = (letters: string[]) => {
  let streak = 0;
  for (let index = letters.length - 1; index >= 0; index -= 1) {
    const letter = letters[index];
    if (!letter) {
      break;
    }
    if (VOWELS.has(letter)) {
      break;
    }
    streak += 1;
  }
  return streak;
};

const getVowelRatio = (letters: string[]) => {
  if (!letters.length) {
    return 0;
  }
  const vowelCount = letters.filter((letter) => VOWELS.has(letter)).length;
  return vowelCount / letters.length;
};

export const useGameStore = defineStore('game', {
  state: () => ({
    slots: createSlots(),
    selectedIndices: [] as number[],
    score: 0,
    highScore: Number(localStorage.getItem('lexiflood_highscore') ?? 0),
    playerName: PLAYER_NAME,
    gameOver: false,
    lastValidation: '' as string | null,
    lastValidationStatus: null as 'success' | 'error' | null,
    errorIndices: [] as number[],
    overflowCountdown: null as number | null,
    usedWords: [] as string[],
    letterBag: [] as string[],
    lastSpawnedLetter: null as string | null,
    wordHistory: [] as Array<{
      id: number;
      word: string;
      points: number;
      time: string;
    }>,
    startTime: null as number | null,
    now: Date.now(),
    paused: false,
    pausedAt: null as number | null,
    pauseEndsAt: null as number | null,
    pauseCooldownUntil: null as number | null,
    scoreMultiplier: MULTIPLIER_BASE
  }),
  getters: {
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
      const isValid = matchesWithWildcards(normalizedWord);
      const basePoints = computeScore(normalizedWord);
      const points = Math.floor(basePoints * state.scoreMultiplier);
      if (state.usedWords.includes(normalizedWord)) {
        return { status: 'used', label: 'Mot déjà utilisé', points };
      }
      if (!isValid) {
        return { status: 'invalid', label: 'Mot invalide', points: 0 };
      }
      return { status: 'valid', label: 'Mot valide', points };
    },
    elapsedTimeFormatted(state) {
      if (!state.startTime) return '00:00';
      const diff = Math.floor((state.now - state.startTime) / 1000);
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }
  },
  actions: {
    startTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      timerInterval = setInterval(() => {
        this.now = Date.now();
      }, 1000);
    },
    startOverflowCountdown() {
      if (this.overflowCountdown === null) {
        return;
      }
      if (overflowInterval) {
        clearInterval(overflowInterval);
      }
      overflowInterval = setInterval(() => {
        if (this.overflowCountdown === null) {
          return;
        }
        if (this.overflowCountdown <= 1) {
          const hasSpace = this.slots.some((slot) => !slot.letter);
          this.overflowCountdown = null;
          if (hasSpace) {
            if (overflowInterval) {
              clearInterval(overflowInterval);
              overflowInterval = null;
            }
            if (!spawnInterval && !this.gameOver) {
              this.startSpawnLoop();
            }
            return;
          }
          this.finishGame('Game Over : rack saturé.');
          return;
        }
        this.overflowCountdown -= 1;
      }, 1000);
    },
    setPlayerName(name: string) {
      const trimmed = name.trim();
      this.playerName = trimmed || PLAYER_NAME;
      if (trimmed) {
        localStorage.setItem(PLAYER_NAME_STORAGE_KEY, trimmed);
      }
    },
    resetGame() {
      this.slots = createSlots();
      this.selectedIndices = [];
      this.score = 0;
      this.gameOver = false;
      this.lastValidation = null;
      this.lastValidationStatus = null;
      this.errorIndices = [];
      this.overflowCountdown = null;
      this.usedWords = [];
      this.letterBag = [];
      this.lastSpawnedLetter = null;
      this.wordHistory = [];
      this.startTime = null;
      this.now = Date.now();
      this.paused = false;
      this.pausedAt = null;
      this.pauseEndsAt = null;
      this.pauseCooldownUntil = null;
      this.scoreMultiplier = MULTIPLIER_BASE;
      if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
      }
      if (overflowInterval) {
        clearInterval(overflowInterval);
        overflowInterval = null;
      }
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    },
    startSolo() {
      this.resetGame();
      this.refillLetterBag();
      this.seedInitialLetters();
      this.startTime = Date.now();
      this.now = this.startTime;
      this.paused = false;
      this.pausedAt = null;
      this.pauseEndsAt = null;
      this.pauseCooldownUntil = null;
      this.startTimer();
      this.startSpawnLoop();
    },
    startSpawnLoop() {
      spawnInterval = setInterval(() => {
        if (this.gameOver || this.overflowCountdown !== null) {
          return;
        }
        this.spawnLetter();
      }, SPAWN_INTERVAL_MS);
    },
    seedInitialLetters() {
      for (let count = 0; count < INITIAL_LETTERS; count += 1) {
        this.placeRandomLetter();
      }
    },
    refillLetterBag() {
      this.letterBag = buildLetterBag();
    },
    drawLetterFromBag() {
      if (this.letterBag.length === 0) {
        this.refillLetterBag();
      }
      const index = Math.floor(Math.random() * this.letterBag.length);
      return this.letterBag.splice(index, 1)[0];
    },
    getRackLetters() {
      return this.slots
        .map((slot) => slot.letter)
        .filter((letter): letter is string => Boolean(letter));
    },
    drawSmartLetter() {
      const rackLetters = this.getRackLetters();
      const consonantStreak = getConsonantStreak(rackLetters);
      const vowelRatio = getVowelRatio(rackLetters);
      let forceVowel = consonantStreak >= 4;
      let forceConsonant = false;

      if (!forceVowel && rackLetters.length >= 5) {
        forceConsonant = vowelRatio >= 0.6;
      }

      if (forceVowel && forceConsonant) {
        forceVowel = false;
        forceConsonant = false;
      }

      const pickCandidate = (shouldBeVowel: boolean | null) => {
        let candidate = this.drawLetterFromBag();
        if (shouldBeVowel === null) {
          return candidate;
        }
        let attempts = 0;
        while (VOWELS.has(candidate) !== shouldBeVowel && attempts < 8) {
          this.letterBag.push(candidate);
          candidate = this.drawLetterFromBag();
          attempts += 1;
        }
        return candidate;
      };

      const desiredVowel = forceVowel ? true : forceConsonant ? false : null;
      let letter = pickCandidate(desiredVowel);
      if (this.lastSpawnedLetter && letter === this.lastSpawnedLetter) {
        this.letterBag.push(letter);
        letter = pickCandidate(desiredVowel);
      }
      this.lastSpawnedLetter = letter;
      return letter;
    },
    placeRandomLetter() {
      const emptySlots = this.slots
        .map((slot, index) => (slot.letter ? null : index))
        .filter((index): index is number => index !== null);
      if (emptySlots.length === 0) {
        return false;
      }
      const targetIndex = emptySlots[Math.floor(Math.random() * emptySlots.length)];
      this.slots[targetIndex].letter = this.drawSmartLetter();
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
      this.startOverflowCountdown();
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
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
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
      if (!slot.letter || this.gameOver || this.paused) {
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
    selectLetterFromKeyboard(letter: string) {
      if (this.gameOver || this.paused) {
        return;
      }
      const normalized = letter.toUpperCase();
      const targetIndex = this.slots.findIndex(
        (slot) => slot.letter === normalized && !slot.selected
      );
      if (targetIndex === -1) {
        return;
      }
      this.slots[targetIndex].selected = true;
      this.selectedIndices.push(targetIndex);
    },
    removeLastSelectedLetter() {
      if (this.selectedIndices.length === 0) {
        return;
      }
      const lastIndex = this.selectedIndices[this.selectedIndices.length - 1];
      if (this.slots[lastIndex]) {
        this.slots[lastIndex].selected = false;
      }
      this.selectedIndices = this.selectedIndices.slice(0, -1);
    },
    clearSelection() {
      this.selectedIndices.forEach((index) => {
        if (this.slots[index]) {
          this.slots[index].selected = false;
        }
      });
      this.selectedIndices = [];
    },
    removeRandomLetter() {
      const occupiedIndices = this.slots
        .map((slot, index) => (slot.letter ? index : null))
        .filter((index): index is number => index !== null);
      if (occupiedIndices.length === 0) {
        return;
      }
      const targetIndex = occupiedIndices[Math.floor(Math.random() * occupiedIndices.length)];
      this.slots[targetIndex].letter = null;
      this.slots[targetIndex].selected = false;
    },
    submitWord() {
      if (this.selectedIndices.length === 0 || this.paused) {
        return;
      }
      const word = this.currentWord;
      const normalizedWord = normalizeWord(word);
      const isValid = matchesWithWildcards(normalizedWord);
      if (this.usedWords.includes(normalizedWord)) {
        this.lastValidation = `${word} a déjà été joué.`;
        this.lastValidationStatus = 'error';
        notifyError(this.lastValidation);
        this.clearSelection();
        return;
      }
      if (isValid && word.length > 0) {
        const basePoints = computeScore(normalizedWord);
        const points = Math.floor(basePoints * this.scoreMultiplier);
        const timestamp = new Date();
        const timeLabel = timestamp.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        this.score += points;
        this.usedWords.push(normalizedWord);
        this.wordHistory = [
          {
            id: timestamp.getTime(),
            word: word.toUpperCase(),
            points,
            time: timeLabel
          },
          ...this.wordHistory
        ];
        this.selectedIndices.forEach((index) => {
          this.slots[index].letter = null;
          this.slots[index].selected = false;
        });
        this.selectedIndices = [];
        if (normalizedWord.length >= 5) {
          this.removeRandomLetter();
        }
        this.lastValidation = `+${points} points pour ${word}`;
        this.lastValidationStatus = 'success';
        notifySuccess(this.lastValidation);
        this.scoreMultiplier = clampMultiplier(
          this.scoreMultiplier + getMultiplierDelta(normalizedWord.length)
        );
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
    },
    pauseGame() {
      if (this.paused || this.gameOver || !this.startTime) {
        return false;
      }
      const now = Date.now();
      if (this.pauseCooldownUntil && now < this.pauseCooldownUntil) {
        return false;
      }
      this.paused = true;
      this.pausedAt = now;
      this.pauseEndsAt = now + PAUSE_DURATION_MS;
      this.pauseCooldownUntil = now + PAUSE_COOLDOWN_MS;
      if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
      }
      if (overflowInterval) {
        clearInterval(overflowInterval);
        overflowInterval = null;
      }
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      return true;
    },
    resumeGame() {
      if (!this.paused || this.gameOver || !this.startTime) {
        return;
      }
      const pausedAt = this.pausedAt ?? Date.now();
      const pausedDuration = Date.now() - pausedAt;
      this.startTime += pausedDuration;
      this.paused = false;
      this.pausedAt = null;
      this.pauseEndsAt = null;
      this.now = Date.now();
      this.startTimer();
      if (this.overflowCountdown !== null) {
        this.startOverflowCountdown();
        return;
      }
      this.startSpawnLoop();
    }
  }
});
