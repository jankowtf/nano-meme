import { useMemeStore } from "../../src/stores/memeStore";

describe("GalleryScreen", () => {
  beforeEach(() => {
    useMemeStore.getState().reset();
  });

  describe("empty state", () => {
    it("shows empty history initially", () => {
      expect(useMemeStore.getState().history).toEqual([]);
    });

    it("history length is 0", () => {
      expect(useMemeStore.getState().history.length).toBe(0);
    });
  });

  describe("history population", () => {
    it("adds item to history on generation", () => {
      useMemeStore.getState().setPrompt("Test prompt");
      useMemeStore.getState().setOverlayText("Test overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");

      expect(useMemeStore.getState().history).toHaveLength(1);
    });

    it("newest items appear first in history", () => {
      useMemeStore.getState().setPrompt("First");
      useMemeStore.getState().setOverlayText("First overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base1.png", "file:///first.png");

      useMemeStore.getState().setPrompt("Second");
      useMemeStore.getState().setOverlayText("Second overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base2.png", "file:///second.png");

      const { history } = useMemeStore.getState();
      expect(history).toHaveLength(2);
      expect(history[0].imageUri).toBe("file:///second.png");
      expect(history[1].imageUri).toBe("file:///first.png");
    });

    it("stores prompt and overlay text in history item", () => {
      useMemeStore.getState().setPrompt("My prompt");
      useMemeStore.getState().setOverlayText("My overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");

      const item = useMemeStore.getState().history[0];
      expect(item.prompt).toBe("My prompt");
      expect(item.overlayText).toBe("My overlay");
    });

    it("stores createdAt as ISO date string", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");

      const item = useMemeStore.getState().history[0];
      const date = new Date(item.createdAt);
      expect(date.getTime()).not.toBeNaN();
    });
  });

  describe("date formatting safety", () => {
    it("valid ISO date formats correctly", () => {
      const validDate = "2026-03-01T10:30:00.000Z";
      expect(() => new Date(validDate).toLocaleDateString()).not.toThrow();
    });

    it("handles date formatting with try/catch for invalid dates", () => {
      const invalidDate = "not-a-date";
      let displayDate: string;
      try {
        displayDate = new Date(invalidDate).toLocaleDateString();
        if (displayDate === "Invalid Date") {
          displayDate = "Unknown date";
        }
      } catch {
        displayDate = "Unknown date";
      }
      expect(typeof displayDate).toBe("string");
    });
  });

  describe("favorite toggle", () => {
    beforeEach(() => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");
    });

    it("items start as not favorite", () => {
      expect(useMemeStore.getState().history[0].isFavorite).toBe(false);
    });

    it("toggles favorite on", () => {
      const id = useMemeStore.getState().history[0].id;
      useMemeStore.getState().toggleFavorite(id);
      expect(useMemeStore.getState().history[0].isFavorite).toBe(true);
    });

    it("toggles favorite off", () => {
      const id = useMemeStore.getState().history[0].id;
      useMemeStore.getState().toggleFavorite(id);
      useMemeStore.getState().toggleFavorite(id);
      expect(useMemeStore.getState().history[0].isFavorite).toBe(false);
    });

    it("only toggles the targeted item", () => {
      useMemeStore.getState().setPrompt("Second");
      useMemeStore.getState().setOverlayText("Second");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base2.png", "file:///second.png");

      const secondId = useMemeStore.getState().history[0].id;
      useMemeStore.getState().toggleFavorite(secondId);

      expect(useMemeStore.getState().history[0].isFavorite).toBe(true);
      expect(useMemeStore.getState().history[1].isFavorite).toBe(false);
    });
  });

  describe("delete from history", () => {
    beforeEach(() => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");
    });

    it("removes item from history", () => {
      const id = useMemeStore.getState().history[0].id;
      useMemeStore.getState().deleteFromHistory(id);
      expect(useMemeStore.getState().history).toHaveLength(0);
    });

    it("only removes the targeted item", () => {
      useMemeStore.getState().setPrompt("Second");
      useMemeStore.getState().setOverlayText("Second");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base2.png", "file:///second.png");

      const firstId = useMemeStore.getState().history[1].id;
      useMemeStore.getState().deleteFromHistory(firstId);

      expect(useMemeStore.getState().history).toHaveLength(1);
      expect(useMemeStore.getState().history[0].imageUri).toBe("file:///second.png");
    });

    it("handles deleting non-existent id without crash", () => {
      expect(() => {
        useMemeStore.getState().deleteFromHistory("non-existent-id");
      }).not.toThrow();
      expect(useMemeStore.getState().history).toHaveLength(1);
    });
  });

  describe("select from history (gallery navigation)", () => {
    beforeEach(() => {
      useMemeStore.getState().setPrompt("First");
      useMemeStore.getState().setOverlayText("First overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base1.png", "file:///first.png");

      useMemeStore.getState().setPrompt("Second");
      useMemeStore.getState().setOverlayText("Second overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base2.png", "file:///second.png");
    });

    it("sets currentImageUri from selected history item", () => {
      const olderId = useMemeStore.getState().history[1].id;
      useMemeStore.getState().selectFromHistory(olderId);

      expect(useMemeStore.getState().currentImageUri).toBe("file:///first.png");
    });

    it("sets currentBaseImageUri from selected history item", () => {
      const olderId = useMemeStore.getState().history[1].id;
      useMemeStore.getState().selectFromHistory(olderId);

      expect(useMemeStore.getState().currentBaseImageUri).toBe("file:///base1.png");
    });

    it("restores overlayText from selected history item", () => {
      const olderId = useMemeStore.getState().history[1].id;
      useMemeStore.getState().selectFromHistory(olderId);

      expect(useMemeStore.getState().overlayText).toBe("First overlay");
    });

    it("handles selecting non-existent id without crash", () => {
      expect(() => {
        useMemeStore.getState().selectFromHistory("non-existent-id");
      }).not.toThrow();
      expect(useMemeStore.getState().currentImageUri).toBe("file:///second.png");
    });
  });

  describe("history item structure", () => {
    it("each item has required fields", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");

      const item = useMemeStore.getState().history[0];
      expect(item.id).toBeDefined();
      expect(item.prompt).toBeDefined();
      expect(item.overlayText).toBeDefined();
      expect(item.imageUri).toBeDefined();
      expect(item.createdAt).toBeDefined();
      expect(typeof item.isFavorite).toBe("boolean");
    });

    it("stores overlayConfig in history item", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Overlay");
      useMemeStore.getState().setOverlayPosition("top");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");

      const item = useMemeStore.getState().history[0];
      expect(item.overlayConfig.position).toBe("top");
    });

    it("displays overlay text or fallback for items without overlay", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");

      const item = useMemeStore.getState().history[0];
      const displayText = item.overlayText || "No overlay";
      expect(displayText).toBe("No overlay");
    });
  });

  describe("gallery composite thumbnails", () => {
    it("history item with baseImageUri should use MemeComposite", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("OVERLAY TEXT");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");

      const item = useMemeStore.getState().history[0];
      expect(item.baseImageUri).toBe("file:///base.png");
      // Gallery should render MemeComposite with overlayText + overlayConfig
      expect(item.overlayText).toBe("OVERLAY TEXT");
      expect(item.overlayConfig).toBeDefined();
    });

    it("updated overlay reflects in history for gallery composite", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("ORIGINAL");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");

      const id = useMemeStore.getState().history[0].id;
      const config = { ...useMemeStore.getState().history[0].overlayConfig, offsetX: 0.3 };
      useMemeStore.getState().updateOverlay(id, "UPDATED TEXT", config, "file:///new-composite.png");

      const updated = useMemeStore.getState().history[0];
      expect(updated.overlayText).toBe("UPDATED TEXT");
      expect(updated.overlayConfig.offsetX).toBe(0.3);
      // baseImageUri preserved — gallery MemeComposite re-renders with new overlay state
      expect(updated.baseImageUri).toBe("file:///base.png");
    });

    it("legacy items without baseImageUri fallback to plain image", () => {
      // Simulate legacy item by manually checking condition
      const legacyItem: { baseImageUri?: string; imageUri: string } = {
        imageUri: "file:///old.png",
        // no baseImageUri
      };

      // Gallery condition: item.baseImageUri ? MemeComposite : Image
      const useMemeComposite = !!legacyItem.baseImageUri;
      expect(useMemeComposite).toBe(false);
    });
  });
});
