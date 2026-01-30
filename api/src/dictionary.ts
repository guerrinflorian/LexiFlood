import frenchWords from 'an-array-of-french-words';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const normalizeWord = (word: string) =>
  word
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z?]/g, '');

const wordSet = new Set(frenchWords.map((word) => normalizeWord(word)).filter(Boolean));

const resolveWithWildcards = (word: string): string | null => {
  const wildcardIndex = word.indexOf('?');
  if (wildcardIndex === -1) {
    return wordSet.has(word) ? word : null;
  }
  const prefix = word.slice(0, wildcardIndex);
  const suffix = word.slice(wildcardIndex + 1);
  for (const letter of ALPHABET) {
    const resolved = resolveWithWildcards(`${prefix}${letter}${suffix}`);
    if (resolved) {
      return resolved;
    }
  }
  return null;
};

export const resolveWord = (word: string) => {
  const normalized = normalizeWord(word);
  if (!normalized) {
    return null;
  }
  return resolveWithWildcards(normalized);
};

export const checkWord = (word: string) => Boolean(resolveWord(word));
