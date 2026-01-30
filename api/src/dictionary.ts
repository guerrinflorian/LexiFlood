import frenchWords from 'an-array-of-french-words';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const normalizeWord = (word: string) =>
  word
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z?]/g, '');

const wordSet = new Set(frenchWords.map((word) => normalizeWord(word)).filter(Boolean));

const matchesWithWildcards = (word: string): boolean => {
  const wildcardIndex = word.indexOf('?');
  if (wildcardIndex === -1) {
    return wordSet.has(word);
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

export const checkWord = (word: string) => {
  const normalized = normalizeWord(word);
  if (!normalized) {
    return false;
  }
  return matchesWithWildcards(normalized);
};
