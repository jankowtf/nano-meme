import { getApiKey, setApiKey, deleteApiKey } from "../useSecureStorage";

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as SecureStore from "expo-secure-store";

describe("useSecureStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets API key from secure store", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("test-key");
    const key = await getApiKey();
    expect(key).toBe("test-key");
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("gemini-api-key");
  });

  it("returns null when no key stored", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    const key = await getApiKey();
    expect(key).toBeNull();
  });

  it("saves API key to secure store", async () => {
    await setApiKey("new-key");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "gemini-api-key",
      "new-key",
    );
  });

  it("deletes API key from secure store", async () => {
    await deleteApiKey();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("gemini-api-key");
  });
});
