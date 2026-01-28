import words from 'an-array-of-french-words';

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

export const normalizeWord = (value: string) =>
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

export const computeScore = (word: string) => {
  const letters = word.split('');
  const letterSum = letters.reduce((sum, letter) => sum + (LETTER_POINTS[letter] ?? 0), 0);
  const { multiplier, bonus } = getLengthModifiers(word.length);
  return Math.floor(letterSum * multiplier + bonus);
};

export const isValidWord = (value: string) => {
  const normalized = normalizeWord(value);
  return DICTIONARY.has(normalized);
};
