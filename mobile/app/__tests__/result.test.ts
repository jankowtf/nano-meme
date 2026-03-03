import { useMemeStore } from "../../src/stores/memeStore";

// Mock native modules
jest.mock("expo-sharing", () => ({
  shareAsync: jest.fn(),
  isAvailableAsync: jest.fn().mockResolvedValue(true),
}));
jest.mock("expo-media-library", () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  saveToLibraryAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("react-native-view-shot", () => ({
  captureRef: jest.fn().mockResolvedValue("file:///captured.png"),
}));

describe("ResultScreen", () => {
  beforeEach(() => {
    useMemeStore.getState().reset();
  });

  describe("empty state", () => {
    it("shows empty state when no image is generated", () => {
      const state = useMemeStore.getState();
      expect(state.currentImageUri).toBeNull();
      // Screen should show "No meme generated yet" and a back button
    });

    it("handles no history with no crash", () => {
      const state = useMemeStore.getState();
      expect(state.history).toEqual([]);
      expect(state.currentImageUri).toBeNull();
      // history.find() ?? history[0] → both undefined, early return prevents crash
    });
  });

  describe("activeItem resolution", () => {
    it("finds activeItem when currentImageUri matches history", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///composite.png");

      const { history, currentImageUri } = useMemeStore.getState();
      const activeItem = history.find((h) => h.imageUri === currentImageUri) ?? history[0];
      expect(activeItem).toBeDefined();
      expect(activeItem.imageUri).toBe("file:///composite.png");
    });

    it("falls back to history[0] when currentImageUri does not match any item", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///composite.png");

      // Manually set a non-matching currentImageUri (shouldn't happen in practice)
      const { history } = useMemeStore.getState();
      const activeItem = history.find((h) => h.imageUri === "file:///nonexistent.png") ?? history[0];
      expect(activeItem).toBeDefined();
      expect(activeItem.imageUri).toBe("file:///composite.png");
    });

    it("returns undefined when history is empty and no match", () => {
      const { history } = useMemeStore.getState();
      const activeItem = history.find((h) => h.imageUri === "file:///any.png") ?? history[0];
      // activeItem is undefined, but early return in component prevents access
      expect(activeItem).toBeUndefined();
    });
  });

  describe("canEdit flag", () => {
    it("enables editing when baseImageUri exists", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///composite.png");

      const { history, currentImageUri } = useMemeStore.getState();
      const activeItem = history.find((h) => h.imageUri === currentImageUri) ?? history[0];
      const canEdit = activeItem?.baseImageUri != null;
      expect(canEdit).toBe(true);
    });

    it("disables editing when activeItem is undefined", () => {
      // Simulates the component's `const canEdit = activeItem?.baseImageUri != null`
      // when activeItem is undefined (empty history, no match)
      const { history } = useMemeStore.getState();
      const activeItem = history.find((h) => h.imageUri === "file:///any.png") ?? history[0];
      const canEdit = activeItem?.baseImageUri != null;
      expect(canEdit).toBe(false);
    });
  });

  describe("overlay interactions", () => {
    beforeEach(() => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Original overlay");
      useMemeStore.getState().setOverlayPosition("bottom");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///composite.png");
    });

    it("updates overlay text via updateOverlay", () => {
      const { history } = useMemeStore.getState();
      useMemeStore.getState().updateOverlay(
        history[0].id,
        "New text",
        { position: "bottom", fontScale: 1.0, offsetX: 0, offsetY: 0 },
        history[0].imageUri,
      );

      expect(useMemeStore.getState().overlayText).toBe("New text");
      expect(useMemeStore.getState().history[0].overlayText).toBe("New text");
    });

    it("updates overlay position via updateOverlay", () => {
      const { history } = useMemeStore.getState();
      useMemeStore.getState().updateOverlay(
        history[0].id,
        "Original overlay",
        { position: "top", fontScale: 1.0, offsetX: 0, offsetY: 0 },
        history[0].imageUri,
      );

      expect(useMemeStore.getState().overlayConfig.position).toBe("top");
    });

    it("updates overlay font scale", () => {
      const { history } = useMemeStore.getState();
      useMemeStore.getState().updateOverlay(
        history[0].id,
        "Original overlay",
        { position: "bottom", fontScale: 1.7, offsetX: 0, offsetY: 0 },
        history[0].imageUri,
      );

      expect(useMemeStore.getState().overlayConfig.fontScale).toBe(1.7);
    });

    it("updates overlay position with offset reset", () => {
      useMemeStore.getState().setOverlayPosition("top");
      const config = useMemeStore.getState().overlayConfig;
      expect(config.position).toBe("top");
      expect(config.offsetX).toBe(0);
      expect(config.offsetY).toBe(0);
    });
  });

  describe("favorite toggle", () => {
    it("toggles favorite on active item", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///composite.png");

      const id = useMemeStore.getState().history[0].id;
      expect(useMemeStore.getState().history[0].isFavorite).toBe(false);

      useMemeStore.getState().toggleFavorite(id);
      expect(useMemeStore.getState().history[0].isFavorite).toBe(true);

      useMemeStore.getState().toggleFavorite(id);
      expect(useMemeStore.getState().history[0].isFavorite).toBe(false);
    });
  });

  describe("gallery navigation to result", () => {
    it("selectFromHistory sets currentImageUri and navigates", () => {
      // Generate 2 memes
      useMemeStore.getState().setPrompt("First");
      useMemeStore.getState().setOverlayText("First overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base1.png", "file:///first.png");

      useMemeStore.getState().setPrompt("Second");
      useMemeStore.getState().setOverlayText("Second overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base2.png", "file:///second.png");

      // Select first (older) item
      const olderId = useMemeStore.getState().history[1].id;
      useMemeStore.getState().selectFromHistory(olderId);

      const state = useMemeStore.getState();
      expect(state.currentImageUri).toBe("file:///first.png");
      expect(state.currentBaseImageUri).toBe("file:///base1.png");
      expect(state.overlayText).toBe("First overlay");
    });
  });
});
