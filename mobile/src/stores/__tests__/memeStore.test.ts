import { useMemeStore } from "../memeStore";

describe("memeStore", () => {
  beforeEach(() => {
    useMemeStore.getState().reset();
  });

  it("starts with empty state", () => {
    const state = useMemeStore.getState();
    expect(state.isGenerating).toBe(false);
    expect(state.currentPrompt).toBe("");
    expect(state.overlayText).toBe("");
    expect(state.currentImageUri).toBeNull();
    expect(state.lastError).toBeNull();
    expect(state.history).toEqual([]);
  });

  it("sets prompt", () => {
    useMemeStore.getState().setPrompt("A funny cat");
    expect(useMemeStore.getState().currentPrompt).toBe("A funny cat");
  });

  it("sets overlay text", () => {
    useMemeStore.getState().setOverlayText("Hello World");
    expect(useMemeStore.getState().overlayText).toBe("Hello World");
  });

  it("starts generation", () => {
    useMemeStore.getState().startGeneration();
    expect(useMemeStore.getState().isGenerating).toBe(true);
    expect(useMemeStore.getState().lastError).toBeNull();
  });

  it("completes generation and adds to history", () => {
    useMemeStore.getState().setPrompt("Test prompt");
    useMemeStore.getState().setOverlayText("Test overlay");
    useMemeStore.getState().startGeneration();
    useMemeStore.getState().completeGeneration("file:///test.png");

    const state = useMemeStore.getState();
    expect(state.isGenerating).toBe(false);
    expect(state.currentImageUri).toBe("file:///test.png");
    expect(state.history).toHaveLength(1);
    expect(state.history[0].prompt).toBe("Test prompt");
    expect(state.history[0].overlayText).toBe("Test overlay");
    expect(state.history[0].imageUri).toBe("file:///test.png");
  });

  it("handles generation failure", () => {
    useMemeStore.getState().startGeneration();
    useMemeStore.getState().failGeneration("API error");

    const state = useMemeStore.getState();
    expect(state.isGenerating).toBe(false);
    expect(state.lastError).toBe("API error");
  });

  it("toggles favorite on history item", () => {
    useMemeStore.getState().setPrompt("Test");
    useMemeStore.getState().setOverlayText("Overlay");
    useMemeStore.getState().startGeneration();
    useMemeStore.getState().completeGeneration("file:///test.png");

    const id = useMemeStore.getState().history[0].id;
    useMemeStore.getState().toggleFavorite(id);
    expect(useMemeStore.getState().history[0].isFavorite).toBe(true);

    useMemeStore.getState().toggleFavorite(id);
    expect(useMemeStore.getState().history[0].isFavorite).toBe(false);
  });

  it("deletes history item", () => {
    useMemeStore.getState().setPrompt("Test");
    useMemeStore.getState().setOverlayText("Overlay");
    useMemeStore.getState().startGeneration();
    useMemeStore.getState().completeGeneration("file:///test.png");

    const id = useMemeStore.getState().history[0].id;
    useMemeStore.getState().deleteFromHistory(id);
    expect(useMemeStore.getState().history).toHaveLength(0);
  });

  it("resets state", () => {
    useMemeStore.getState().setPrompt("Test");
    useMemeStore.getState().startGeneration();
    useMemeStore.getState().reset();

    expect(useMemeStore.getState().currentPrompt).toBe("");
    expect(useMemeStore.getState().isGenerating).toBe(false);
  });
});
