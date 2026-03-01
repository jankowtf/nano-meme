const store = new Map<string, string>();

export function createMMKV(_configuration?: { id?: string }) {
  return {
    getString(key: string): string | undefined {
      return store.get(key);
    },
    set(key: string, value: string): void {
      store.set(key, value);
    },
    remove(key: string): boolean {
      return store.delete(key);
    },
  };
}

export class MMKV {
  private store = new Map<string, string>();
  constructor(_config?: { id?: string }) {}
  set(key: string, value: string | number | boolean) {
    this.store.set(key, String(value));
  }
  getString(key: string) {
    return this.store.get(key);
  }
  getNumber(key: string) {
    const v = this.store.get(key);
    return v ? Number(v) : undefined;
  }
  getBoolean(key: string) {
    const v = this.store.get(key);
    return v === "true";
  }
  delete(key: string) {
    this.store.delete(key);
  }
  contains(key: string) {
    return this.store.has(key);
  }
  clearAll() {
    this.store.clear();
  }
  getAllKeys() {
    return [...this.store.keys()];
  }
}
