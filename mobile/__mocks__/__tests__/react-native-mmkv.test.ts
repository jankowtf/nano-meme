import { MMKV } from "../react-native-mmkv";

describe("MMKV mock", () => {
  it("creates instance without error", () => {
    const mmkv = new MMKV({ id: "test" });
    expect(mmkv).toBeDefined();
  });

  it("stores and retrieves string values", () => {
    const mmkv = new MMKV();
    mmkv.set("key", "value");
    expect(mmkv.getString("key")).toBe("value");
  });

  it("returns undefined for missing keys", () => {
    const mmkv = new MMKV();
    expect(mmkv.getString("missing")).toBeUndefined();
  });

  it("deletes values", () => {
    const mmkv = new MMKV();
    mmkv.set("del", "data");
    mmkv.delete("del");
    expect(mmkv.getString("del")).toBeUndefined();
  });
});
