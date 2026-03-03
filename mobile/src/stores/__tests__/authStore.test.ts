import { useAuthStore } from "../authStore";

// Mock the auth client
jest.mock("../../features/auth/authClient", () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  fetchApiKey: jest.fn(),
}));

// Mock secure storage
jest.mock("../../hooks/useSecureStorage", () => ({
  getApiKey: jest.fn(),
  setApiKey: jest.fn(),
  deleteApiKey: jest.fn(),
  getCortexApiKey: jest.fn(),
  setCortexApiKey: jest.fn(),
  deleteCortexApiKey: jest.fn(),
  getEffectiveApiKey: jest.fn(),
}));

import { signIn, signOut, fetchApiKey } from "../../features/auth/authClient";
import { setCortexApiKey, deleteCortexApiKey } from "../../hooks/useSecureStorage";

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockFetchApiKey = fetchApiKey as jest.MockedFunction<typeof fetchApiKey>;
const mockSetCortexApiKey = setCortexApiKey as jest.MockedFunction<typeof setCortexApiKey>;
const mockDeleteCortexApiKey = deleteCortexApiKey as jest.MockedFunction<typeof deleteCortexApiKey>;

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    jest.clearAllMocks();
  });

  it("starts with no session", () => {
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("isAuthenticated returns false when no session", () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  describe("login", () => {
    it("signs in and stores session + fetches API key", async () => {
      mockSignIn.mockResolvedValueOnce({
        token: "tok-123",
        user: { id: "u1", email: "demo@kaosmaps.com", name: "Demo" },
      });
      mockFetchApiKey.mockResolvedValueOnce("AIza-test");

      await useAuthStore.getState().login("demo@kaosmaps.com", "password");

      const state = useAuthStore.getState();
      expect(state.session?.token).toBe("tok-123");
      expect(state.session?.user.email).toBe("demo@kaosmaps.com");
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockSetCortexApiKey).toHaveBeenCalledWith("AIza-test");
    });

    it("handles sign-in error", async () => {
      mockSignIn.mockRejectedValueOnce(new Error("Invalid credentials"));

      await useAuthStore.getState().login("bad@email.com", "wrong");

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe("Invalid credentials");
      expect(state.isLoading).toBe(false);
    });

    it("sets isLoading during sign-in", async () => {
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve;
      });
      mockSignIn.mockReturnValueOnce(signInPromise as any);

      const loginPromise = useAuthStore.getState().login("a@b.com", "pw");
      expect(useAuthStore.getState().isLoading).toBe(true);

      resolveSignIn!({
        token: "t",
        user: { id: "1", email: "a@b.com" },
      });
      mockFetchApiKey.mockResolvedValueOnce(null);
      await loginPromise;

      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("does not crash when setCortexApiKey throws", async () => {
      mockSignIn.mockResolvedValueOnce({
        token: "tok-123",
        user: { id: "u1", email: "demo@kaosmaps.com", name: "Demo" },
      });
      mockFetchApiKey.mockResolvedValueOnce("AIza-test");
      mockSetCortexApiKey.mockRejectedValueOnce(new Error("SecureStore failure"));

      // Should NOT throw — the auth flow should succeed even if key storage fails
      await useAuthStore.getState().login("demo@kaosmaps.com", "password");

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it("does not crash when fetchApiKey throws", async () => {
      mockSignIn.mockResolvedValueOnce({
        token: "tok-123",
        user: { id: "u1", email: "demo@kaosmaps.com", name: "Demo" },
      });
      mockFetchApiKey.mockRejectedValueOnce(new Error("Network error"));

      await useAuthStore.getState().login("demo@kaosmaps.com", "password");

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it("does not store key when fetchApiKey returns null", async () => {
      mockSignIn.mockResolvedValueOnce({
        token: "tok-123",
        user: { id: "u1", email: "demo@kaosmaps.com", name: "Demo" },
      });
      mockFetchApiKey.mockResolvedValueOnce(null);

      await useAuthStore.getState().login("demo@kaosmaps.com", "password");

      expect(mockSetCortexApiKey).not.toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("handles non-Error thrown objects", async () => {
      mockSignIn.mockRejectedValueOnce("string error");

      await useAuthStore.getState().login("a@b.com", "pw");

      expect(useAuthStore.getState().error).toBe("Sign-in failed");
    });
  });

  describe("logout", () => {
    beforeEach(async () => {
      mockSignIn.mockResolvedValueOnce({
        token: "tok-123",
        user: { id: "u1", email: "demo@kaosmaps.com" },
      });
      mockFetchApiKey.mockResolvedValueOnce("AIza-test");
      await useAuthStore.getState().login("demo@kaosmaps.com", "password");
      jest.clearAllMocks();
    });

    it("clears session on sign-out", async () => {
      mockSignOut.mockResolvedValueOnce(undefined);

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(mockDeleteCortexApiKey).toHaveBeenCalled();
    });

    it("clears session even when signOut API call fails", async () => {
      mockSignOut.mockRejectedValueOnce(new Error("Network error"));

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("does not crash when deleteCortexApiKey throws", async () => {
      mockSignOut.mockResolvedValueOnce(undefined);
      mockDeleteCortexApiKey.mockRejectedValueOnce(new Error("SecureStore failure"));

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("clears session even when no prior session exists", async () => {
      useAuthStore.getState().reset();

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("reset", () => {
    it("restores initial state", async () => {
      mockSignIn.mockResolvedValueOnce({
        token: "tok-123",
        user: { id: "u1", email: "demo@kaosmaps.com" },
      });
      mockFetchApiKey.mockResolvedValueOnce(null);
      await useAuthStore.getState().login("demo@kaosmaps.com", "pw");

      useAuthStore.getState().reset();

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
