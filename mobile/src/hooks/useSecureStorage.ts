import * as SecureStore from "expo-secure-store";

const API_KEY_STORAGE_KEY = "gemini-api-key";
const CORTEX_API_KEY_STORAGE_KEY = "cortex-gemini-api-key";

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

export async function setApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}

export async function getCortexApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(CORTEX_API_KEY_STORAGE_KEY);
}

export async function setCortexApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(CORTEX_API_KEY_STORAGE_KEY, key);
}

export async function deleteCortexApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(CORTEX_API_KEY_STORAGE_KEY);
}

/**
 * Returns the effective API key, checking in priority order:
 * 1. User-entered API key (manual override)
 * 2. Cortex-provided API key (from auth)
 * 3. null (no key available)
 */
export async function getEffectiveApiKey(): Promise<string | null> {
  const userKey = await getApiKey();
  if (userKey) return userKey;

  const cortexKey = await getCortexApiKey();
  return cortexKey;
}
