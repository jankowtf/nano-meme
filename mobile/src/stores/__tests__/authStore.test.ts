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

  describe("signIn", () => {
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
  });

  describe("signOut", () => {
    it("clears session on sign-out", async () => {
      // First sign in
      mockSignIn.mockResolvedValueOnce({
        token: "tok-123",
        user: { id: "u1", email: "demo@kaosmaps.com" },
      });
      mockFetchApiKey.mockResolvedValueOnce("AIza-test");
      await useAuthStore.getState().login("demo@kaosmaps.com", "password");

      // Then sign out
      mockSignOut.mockResolvedValueOnce(undefined);
      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(mockDeleteCortexApiKey).toHaveBeenCalled();
    });
  });
});
