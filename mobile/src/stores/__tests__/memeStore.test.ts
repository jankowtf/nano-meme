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
    expect(state.currentBaseImageUri).toBeNull();
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

  it("completes generation with baseImageUri and compositeUri", () => {
    useMemeStore.getState().setPrompt("Test prompt");
    useMemeStore.getState().setOverlayText("Test overlay");
    useMemeStore.getState().startGeneration();
    useMemeStore.getState().completeGeneration("file:///base.png", "file:///composite.png");

    const state = useMemeStore.getState();
    expect(state.isGenerating).toBe(false);
    expect(state.currentImageUri).toBe("file:///composite.png");
    expect(state.currentBaseImageUri).toBe("file:///base.png");
    expect(state.history).toHaveLength(1);
    expect(state.history[0].prompt).toBe("Test prompt");
    expect(state.history[0].overlayText).toBe("Test overlay");
    expect(state.history[0].imageUri).toBe("file:///composite.png");
    expect(state.history[0].baseImageUri).toBe("file:///base.png");
  });

  it("stores overlayConfig in history item on completeGeneration", () => {
    useMemeStore.getState().setPrompt("Test");
    useMemeStore.getState().setOverlayText("Overlay");
    useMemeStore.getState().setOverlayPosition("top");
    useMemeStore.getState().setOverlayFontScale(1.5);
    useMemeStore.getState().startGeneration();
    useMemeStore.getState().completeGeneration("file:///base.png", "file:///composite.png");

    const item = useMemeStore.getState().history[0];
    expect(item.overlayConfig.position).toBe("top");
    expect(item.overlayConfig.fontScale).toBe(1.5);
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
    useMemeStore.getState().completeGeneration("file:///base.png", "file:///test.png");

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
    useMemeStore.getState().completeGeneration("file:///base.png", "file:///test.png");

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
    expect(useMemeStore.getState().currentBaseImageUri).toBeNull();
  });

  describe("updateOverlay", () => {
    it("updates overlay text and imageUri on a history item", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Original");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///original.png");

      const id = useMemeStore.getState().history[0].id;
      useMemeStore.getState().updateOverlay(id, "Updated text", {
        position: "top",
        fontScale: 1.3,
        offsetX: 0,
        offsetY: 0,
      }, "file:///updated.png");

      const item = useMemeStore.getState().history[0];
      expect(item.overlayText).toBe("Updated text");
      expect(item.imageUri).toBe("file:///updated.png");
      expect(item.overlayConfig.position).toBe("top");
      expect(item.overlayConfig.fontScale).toBe(1.3);
      expect(item.baseImageUri).toBe("file:///base.png"); // unchanged
    });

    it("does nothing for non-existent id", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Original");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///original.png");

      useMemeStore.getState().updateOverlay("nonexistent", "New", {
        position: "bottom",
        fontScale: 1.0,
        offsetX: 0,
        offsetY: 0,
      }, "file:///new.png");

      expect(useMemeStore.getState().history[0].overlayText).toBe("Original");
    });

    it("updates currentImageUri when editing the latest meme", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Original");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///original.png");

      const id = useMemeStore.getState().history[0].id;
      useMemeStore.getState().updateOverlay(id, "Updated", {
        position: "bottom",
        fontScale: 1.0,
        offsetX: 0,
        offsetY: 0,
      }, "file:///updated.png");

      expect(useMemeStore.getState().currentImageUri).toBe("file:///updated.png");
    });
  });

  describe("reference images", () => {
    it("starts with empty reference images", () => {
      expect(useMemeStore.getState().referenceImages).toEqual([]);
    });

    it("adds an image with auto-assigned id", () => {
      useMemeStore.getState().addImage("base64data", "image/png");
      const images = useMemeStore.getState().referenceImages;
      expect(images).toHaveLength(1);
      expect(images[0].id).toBe("img-1");
      expect(images[0].data).toBe("base64data");
      expect(images[0].mimeType).toBe("image/png");
    });

    it("adds multiple images with sequential ids", () => {
      useMemeStore.getState().addImage("data1", "image/png");
      useMemeStore.getState().addImage("data2", "image/jpeg");
      const images = useMemeStore.getState().referenceImages;
      expect(images).toHaveLength(2);
      expect(images[0].id).toBe("img-1");
      expect(images[1].id).toBe("img-2");
    });

    it("removes image and re-indexes", () => {
      useMemeStore.getState().addImage("data1", "image/png");
      useMemeStore.getState().addImage("data2", "image/jpeg");
      useMemeStore.getState().addImage("data3", "image/png");

      useMemeStore.getState().removeImage("img-2");
      const images = useMemeStore.getState().referenceImages;
      expect(images).toHaveLength(2);
      expect(images[0].id).toBe("img-1");
      expect(images[0].data).toBe("data1");
      expect(images[1].id).toBe("img-2");
      expect(images[1].data).toBe("data3");
    });

    it("clears all images", () => {
      useMemeStore.getState().addImage("data1", "image/png");
      useMemeStore.getState().addImage("data2", "image/jpeg");
      useMemeStore.getState().clearImages();
      expect(useMemeStore.getState().referenceImages).toEqual([]);
    });

    it("enforces max 14 images", () => {
      for (let i = 0; i < 16; i++) {
        useMemeStore.getState().addImage(`data${i}`, "image/png");
      }
      expect(useMemeStore.getState().referenceImages).toHaveLength(14);
    });

    it("resets reference images", () => {
      useMemeStore.getState().addImage("data1", "image/png");
      useMemeStore.getState().reset();
      expect(useMemeStore.getState().referenceImages).toEqual([]);
    });
  });

  describe("overlay config", () => {
    it("starts with default overlay config", () => {
      const config = useMemeStore.getState().overlayConfig;
      expect(config.position).toBe("bottom");
      expect(config.fontScale).toBe(1.0);
      expect(config.offsetX).toBe(0);
      expect(config.offsetY).toBe(0);
    });

    it("sets overlay position and resets offsets", () => {
      useMemeStore.getState().setOverlayPosition("top");
      const config = useMemeStore.getState().overlayConfig;
      expect(config.position).toBe("top");
      expect(config.offsetX).toBe(0);
      expect(config.offsetY).toBe(0);
    });

    it("sets overlay font scale", () => {
      useMemeStore.getState().setOverlayFontScale(1.5);
      expect(useMemeStore.getState().overlayConfig.fontScale).toBe(1.5);
    });

    it("resets overlay config on reset", () => {
      useMemeStore.getState().setOverlayPosition("top");
      useMemeStore.getState().setOverlayFontScale(1.8);
      useMemeStore.getState().reset();
      const config = useMemeStore.getState().overlayConfig;
      expect(config.position).toBe("bottom");
      expect(config.fontScale).toBe(1.0);
    });
  });
});
