import type { StateStorage } from "zustand/middleware";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MMKV } = require("react-native-mmkv") as { MMKV: new (opts?: { id?: string }) => { getString(k: string): string | undefined; set(k: string, v: string): void; delete(k: string): void } };

const mmkv = new MMKV({ id: "nanomeme-store" });

export const mmkvStorage: StateStorage = {
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => mmkv.delete(name),
};
