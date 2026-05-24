import { generateMnemonic, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

export function generateSeedPhrase(): string {
  return generateMnemonic(wordlist, 256); // 256 bits → 24 words
}

export function validateSeedPhrase(mnemonic: string): boolean {
  return validateMnemonic(mnemonic, wordlist);
}

export function splitMnemonic(mnemonic: string): string[] {
  return mnemonic.trim().split(' ');
}

export function pickVerificationIndices(): [number, number, number] {
  const total = 24;
  const seen = new Set<number>();
  const result: number[] = [];
  while (result.length < 3) {
    const idx = Math.floor(Math.random() * total);
    if (!seen.has(idx)) {
      seen.add(idx);
      result.push(idx);
    }
  }
  return result.sort((a, b) => a - b) as [number, number, number];
}

export function verifyWords(
  mnemonic: string,
  indices: [number, number, number],
  answers: [string, string, string],
): boolean {
  const words = splitMnemonic(mnemonic);
  return indices.every((idx, i) => words[idx]?.toLowerCase() === answers[i]?.toLowerCase().trim());
}
