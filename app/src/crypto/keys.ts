import * as SecureStore from 'expo-secure-store';

const DB_KEY_STORE_KEY = 'moatly_db_key_v1';
const ONBOARDING_FLAG_KEY = 'moatly_onboarding_complete_v1';

const PBKDF2_SALT = new TextEncoder().encode('moatly-db-salt-v1');
const PBKDF2_ITERATIONS = 200_000;

async function derivePbkdf2Key(mnemonic: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(mnemonic),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: PBKDF2_SALT, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function initDbKey(mnemonic: string): Promise<string> {
  const key = await derivePbkdf2Key(mnemonic);
  await SecureStore.setItemAsync(DB_KEY_STORE_KEY, key);
  return key;
}

export async function getStoredDbKey(): Promise<string | null> {
  return SecureStore.getItemAsync(DB_KEY_STORE_KEY);
}

export async function deleteDbKey(): Promise<void> {
  await SecureStore.deleteItemAsync(DB_KEY_STORE_KEY);
}

export async function markOnboardingComplete(): Promise<void> {
  await SecureStore.setItemAsync(ONBOARDING_FLAG_KEY, '1');
}

export async function isOnboardingComplete(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(ONBOARDING_FLAG_KEY);
  return val === '1';
}

export async function wipeAllKeys(): Promise<void> {
  await SecureStore.deleteItemAsync(DB_KEY_STORE_KEY);
  await SecureStore.deleteItemAsync(ONBOARDING_FLAG_KEY);
}
