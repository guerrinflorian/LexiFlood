import frenchWords from 'an-array-of-french-words';

const normalizeWord = (word: string) =>
  word
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const wordSet = new Set(frenchWords.map((word) => normalizeWord(word)));

export const checkWord = (word: string) => {
  const normalized = normalizeWord(word);
  return wordSet.has(normalized);
};
