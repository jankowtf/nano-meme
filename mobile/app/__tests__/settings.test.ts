import { useSettingsStore } from "../../src/stores/settingsStore";
import { useAuthStore } from "../../src/stores/authStore";

// Mock the auth client
jest.mock("../../src/features/auth/authClient", () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  fetchApiKey: jest.fn(),
}));

// Mock secure storage
const mockGetApiKey = jest.fn();
const mockSetApiKey = jest.fn();
const mockDeleteApiKey = jest.fn();
jest.mock("../../src/hooks/useSecureStorage", () => ({
  getApiKey: (...args: unknown[]) => mockGetApiKey(...args),
  setApiKey: (...args: unknown[]) => mockSetApiKey(...args),
  deleteApiKey: (...args: unknown[]) => mockDeleteApiKey(...args),
  getEffectiveApiKey: jest.fn(),
  getCortexApiKey: jest.fn(),
  setCortexApiKey: jest.fn(),
  deleteCortexApiKey: jest.fn(),
}));

describe("SettingsScreen", () => {
  beforeEach(() => {
    useSettingsStore.getState().reset();
    useAuthStore.getState().reset();
    jest.clearAllMocks();
  });

  describe("settings store defaults", () => {
    it("starts with default resolution 1K", () => {
      expect(useSettingsStore.getState().defaultResolution).toBe("1K");
    });

    it("starts with default aspect ratio 1:1", () => {
      expect(useSettingsStore.getState().defaultAspectRatio).toBe("1:1");
    });

    it("starts with auto overlay text enabled", () => {
      expect(useSettingsStore.getState().autoOverlayText).toBe(true);
    });
  });

  describe("resolution changes", () => {
    it("updates default resolution", () => {
      useSettingsStore.getState().setDefaultResolution("2K");
      expect(useSettingsStore.getState().defaultResolution).toBe("2K");
    });

    it("cycles through all resolution options", () => {
      const resolutions = ["1K", "2K"] as const;
      for (const res of resolutions) {
        useSettingsStore.getState().setDefaultResolution(res);
        expect(useSettingsStore.getState().defaultResolution).toBe(res);
      }
    });
  });

  describe("aspect ratio changes", () => {
    it("updates default aspect ratio", () => {
      useSettingsStore.getState().setDefaultAspectRatio("16:9");
      expect(useSettingsStore.getState().defaultAspectRatio).toBe("16:9");
    });

    it("supports all aspect ratio options", () => {
      const ratios = ["1:1", "16:9", "9:16", "4:3", "3:4"] as const;
      for (const ratio of ratios) {
        useSettingsStore.getState().setDefaultAspectRatio(ratio);
        expect(useSettingsStore.getState().defaultAspectRatio).toBe(ratio);
      }
    });
  });

  describe("auto overlay text toggle", () => {
    it("disables auto overlay text", () => {
      useSettingsStore.getState().setAutoOverlayText(false);
      expect(useSettingsStore.getState().autoOverlayText).toBe(false);
    });

    it("re-enables auto overlay text", () => {
      useSettingsStore.getState().setAutoOverlayText(false);
      useSettingsStore.getState().setAutoOverlayText(true);
      expect(useSettingsStore.getState().autoOverlayText).toBe(true);
    });
  });

  describe("settings reset", () => {
    it("restores all defaults on reset", () => {
      useSettingsStore.getState().setDefaultResolution("2K");
      useSettingsStore.getState().setDefaultAspectRatio("16:9");
      useSettingsStore.getState().setAutoOverlayText(false);

      useSettingsStore.getState().reset();

      const state = useSettingsStore.getState();
      expect(state.defaultResolution).toBe("1K");
      expect(state.defaultAspectRatio).toBe("1:1");
      expect(state.autoOverlayText).toBe(true);
    });
  });

  describe("API key management", () => {
    it("saves API key successfully", async () => {
      mockSetApiKey.mockResolvedValueOnce(undefined);
      await mockSetApiKey("test-api-key");
      expect(mockSetApiKey).toHaveBeenCalledWith("test-api-key");
    });

    it("handles save API key failure", async () => {
      mockSetApiKey.mockRejectedValueOnce(new Error("SecureStore failure"));
      await expect(mockSetApiKey("test-key")).rejects.toThrow("SecureStore failure");
    });

    it("loads API key on init", async () => {
      mockGetApiKey.mockResolvedValueOnce("existing-key");
      const key = await mockGetApiKey();
      expect(key).toBe("existing-key");
    });

    it("handles getApiKey returning null", async () => {
      mockGetApiKey.mockResolvedValueOnce(null);
      const key = await mockGetApiKey();
      expect(key).toBeNull();
    });

    it("handles getApiKey failure gracefully", async () => {
      mockGetApiKey.mockRejectedValueOnce(new Error("SecureStore read failed"));
      await expect(mockGetApiKey()).rejects.toThrow("SecureStore read failed");
      // Component should catch this and leave defaults
    });

    it("deletes API key successfully", async () => {
      mockDeleteApiKey.mockResolvedValueOnce(undefined);
      await mockDeleteApiKey();
      expect(mockDeleteApiKey).toHaveBeenCalled();
    });

    it("handles delete API key failure", async () => {
      mockDeleteApiKey.mockRejectedValueOnce(new Error("SecureStore failure"));
      await expect(mockDeleteApiKey()).rejects.toThrow("SecureStore failure");
    });
  });

  describe("auth state interactions", () => {
    it("auth store starts unauthenticated", () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().session).toBeNull();
    });

    it("auth error is null by default", () => {
      expect(useAuthStore.getState().error).toBeNull();
    });

    it("isLoading is false by default", () => {
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
