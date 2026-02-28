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
