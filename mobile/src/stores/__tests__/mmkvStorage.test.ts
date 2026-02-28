import { mmkvStorage } from "../mmkvStorage";

describe("mmkvStorage", () => {
  it("implements StateStorage interface", () => {
    expect(typeof mmkvStorage.getItem).toBe("function");
    expect(typeof mmkvStorage.setItem).toBe("function");
    expect(typeof mmkvStorage.removeItem).toBe("function");
  });

  it("returns null for missing keys", () => {
    expect(mmkvStorage.getItem("nonexistent")).toBeNull();
  });

  it("stores and retrieves values", () => {
    mmkvStorage.setItem("test-key", '{"value":42}');
    expect(mmkvStorage.getItem("test-key")).toBe('{"value":42}');
  });

  it("removes values", () => {
    mmkvStorage.setItem("to-remove", "data");
    mmkvStorage.removeItem("to-remove");
    expect(mmkvStorage.getItem("to-remove")).toBeNull();
  });
});
