import { useMemeStore } from "../../src/stores/memeStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import {
  DEFAULT_YODA_PROMPT,
  DEFAULT_OVERLAY_TEXT,
  MASHUP_PRESET_PROMPT,
  MASHUP_OVERLAY_TEXT,
} from "../../src/utils/constants";
import { MAX_REFERENCE_IMAGES } from "../../src/features/meme/geminiTypes";
import { MASHUP_IMAGES } from "../../src/fixtures/mashupImages";

describe("HomeScreen (Generate)", () => {
  beforeEach(() => {
    useMemeStore.getState().reset();
    useSettingsStore.getState().reset();
  });

  describe("prompt input", () => {
    it("starts with empty prompt", () => {
      expect(useMemeStore.getState().currentPrompt).toBe("");
    });

    it("sets prompt text", () => {
      useMemeStore.getState().setPrompt("A cat riding a bicycle");
      expect(useMemeStore.getState().currentPrompt).toBe("A cat riding a bicycle");
    });

    it("allows empty prompt (defaults to Yoda preset on generate)", () => {
      useMemeStore.getState().setPrompt("");
      expect(useMemeStore.getState().currentPrompt).toBe("");
    });
  });

  describe("overlay text input", () => {
    it("starts with empty overlay text", () => {
      expect(useMemeStore.getState().overlayText).toBe("");
    });

    it("sets overlay text", () => {
      useMemeStore.getState().setOverlayText("This is fine");
      expect(useMemeStore.getState().overlayText).toBe("This is fine");
    });
  });

  describe("overlay position presets", () => {
    it("starts with bottom position", () => {
      expect(useMemeStore.getState().overlayConfig.position).toBe("bottom");
    });

    it("changes to top position and resets offsets", () => {
      useMemeStore.getState().setOverlayPosition("top");
      const config = useMemeStore.getState().overlayConfig;
      expect(config.position).toBe("top");
      expect(config.offsetX).toBe(0);
      expect(config.offsetY).toBe(0);
    });

    it("changes to center position", () => {
      useMemeStore.getState().setOverlayPosition("center");
      expect(useMemeStore.getState().overlayConfig.position).toBe("center");
    });

    it("changes to bottom position", () => {
      useMemeStore.getState().setOverlayPosition("top");
      useMemeStore.getState().setOverlayPosition("bottom");
      expect(useMemeStore.getState().overlayConfig.position).toBe("bottom");
    });
  });

  describe("overlay font scale", () => {
    it("starts with default font scale 1.0", () => {
      expect(useMemeStore.getState().overlayConfig.fontScale).toBe(1.0);
    });

    it("sets font scale to 0.7", () => {
      useMemeStore.getState().setOverlayFontScale(0.7);
      expect(useMemeStore.getState().overlayConfig.fontScale).toBe(0.7);
    });

    it("sets font scale to 1.7", () => {
      useMemeStore.getState().setOverlayFontScale(1.7);
      expect(useMemeStore.getState().overlayConfig.fontScale).toBe(1.7);
    });

    it("supports all preset scale values", () => {
      const scales = [0.7, 1.0, 1.3, 1.7];
      for (const scale of scales) {
        useMemeStore.getState().setOverlayFontScale(scale);
        expect(useMemeStore.getState().overlayConfig.fontScale).toBe(scale);
      }
    });
  });

  describe("reference images", () => {
    it("starts with no reference images", () => {
      expect(useMemeStore.getState().referenceImages).toEqual([]);
    });

    it("adds a reference image", () => {
      useMemeStore.getState().addImage("base64data", "image/png");
      const images = useMemeStore.getState().referenceImages;
      expect(images).toHaveLength(1);
      expect(images[0].id).toBe("img-1");
      expect(images[0].data).toBe("base64data");
      expect(images[0].mimeType).toBe("image/png");
    });

    it("adds multiple reference images with sequential ids", () => {
      useMemeStore.getState().addImage("data1", "image/png");
      useMemeStore.getState().addImage("data2", "image/jpeg");
      const images = useMemeStore.getState().referenceImages;
      expect(images).toHaveLength(2);
      expect(images[0].id).toBe("img-1");
      expect(images[1].id).toBe("img-2");
    });

    it("enforces MAX_REFERENCE_IMAGES limit", () => {
      for (let i = 0; i < MAX_REFERENCE_IMAGES + 2; i++) {
        useMemeStore.getState().addImage(`data${i}`, "image/png");
      }
      expect(useMemeStore.getState().referenceImages.length).toBeLessThanOrEqual(MAX_REFERENCE_IMAGES);
    });

    it("removes a reference image by id", () => {
      useMemeStore.getState().addImage("data1", "image/png");
      useMemeStore.getState().addImage("data2", "image/jpeg");
      useMemeStore.getState().removeImage("img-1");

      const images = useMemeStore.getState().referenceImages;
      expect(images).toHaveLength(1);
      // After removal, remaining images are re-indexed
      expect(images[0].id).toBe("img-1");
      expect(images[0].data).toBe("data2");
    });

    it("clears all reference images", () => {
      useMemeStore.getState().addImage("data1", "image/png");
      useMemeStore.getState().addImage("data2", "image/jpeg");
      useMemeStore.getState().clearImages();

      expect(useMemeStore.getState().referenceImages).toEqual([]);
    });

    it("handles removing non-existent image id without crash", () => {
      useMemeStore.getState().addImage("data1", "image/png");
      expect(() => {
        useMemeStore.getState().removeImage("non-existent");
      }).not.toThrow();
      expect(useMemeStore.getState().referenceImages).toHaveLength(1);
    });
  });

  describe("preset loading", () => {
    it("loads Yoda preset", () => {
      useMemeStore.getState().setPrompt(DEFAULT_YODA_PROMPT);
      useMemeStore.getState().setOverlayText(DEFAULT_OVERLAY_TEXT);

      expect(useMemeStore.getState().currentPrompt).toBe(DEFAULT_YODA_PROMPT);
      expect(useMemeStore.getState().overlayText).toBe(DEFAULT_OVERLAY_TEXT);
    });

    it("loads Mashup preset with images", () => {
      useMemeStore.getState().setPrompt(MASHUP_PRESET_PROMPT);
      useMemeStore.getState().setOverlayText(MASHUP_OVERLAY_TEXT);
      useMemeStore.getState().clearImages();
      for (const img of MASHUP_IMAGES) {
        useMemeStore.getState().addImage(img.data, img.mimeType);
      }

      expect(useMemeStore.getState().currentPrompt).toBe(MASHUP_PRESET_PROMPT);
      expect(useMemeStore.getState().overlayText).toBe(MASHUP_OVERLAY_TEXT);
      expect(useMemeStore.getState().referenceImages.length).toBe(MASHUP_IMAGES.length);
    });

    it("preset overrides existing prompt", () => {
      useMemeStore.getState().setPrompt("My custom prompt");
      useMemeStore.getState().setPrompt(DEFAULT_YODA_PROMPT);
      expect(useMemeStore.getState().currentPrompt).toBe(DEFAULT_YODA_PROMPT);
    });
  });

  describe("generation flow", () => {
    it("starts not generating", () => {
      expect(useMemeStore.getState().isGenerating).toBe(false);
    });

    it("has no error initially", () => {
      expect(useMemeStore.getState().lastError).toBeNull();
    });

    it("sets isGenerating on startGeneration", () => {
      useMemeStore.getState().startGeneration();
      expect(useMemeStore.getState().isGenerating).toBe(true);
    });

    it("clears error on startGeneration", () => {
      useMemeStore.getState().failGeneration("Previous error");
      useMemeStore.getState().startGeneration();
      expect(useMemeStore.getState().lastError).toBeNull();
    });

    it("clears current image on startGeneration", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");

      useMemeStore.getState().startGeneration();
      expect(useMemeStore.getState().currentImageUri).toBeNull();
      expect(useMemeStore.getState().currentBaseImageUri).toBeNull();
    });

    it("completes generation with image URIs", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");

      const state = useMemeStore.getState();
      expect(state.isGenerating).toBe(false);
      expect(state.currentImageUri).toBe("file:///meme.png");
      expect(state.currentBaseImageUri).toBe("file:///base.png");
    });

    it("adds to history on completeGeneration", () => {
      useMemeStore.getState().setPrompt("Test");
      useMemeStore.getState().setOverlayText("Overlay");
      useMemeStore.getState().startGeneration();
      useMemeStore.getState().completeGeneration("file:///base.png", "file:///meme.png");

      expect(useMemeStore.getState().history).toHaveLength(1);
    });

    it("sets error on failGeneration", () => {
      useMemeStore.getState().failGeneration("Something went wrong");
      expect(useMemeStore.getState().lastError).toBe("Something went wrong");
      expect(useMemeStore.getState().isGenerating).toBe(false);
    });

    it("handles missing API key error message", () => {
      const errorMsg = "No API key configured. Go to Settings to add one or sign in with Cortex.";
      useMemeStore.getState().failGeneration(errorMsg);
      expect(useMemeStore.getState().lastError).toBe(errorMsg);
    });
  });

  describe("resolution picker", () => {
    it("uses settings default resolution initially", () => {
      expect(useSettingsStore.getState().defaultResolution).toBe("1K");
    });

    it("settings resolution can be changed", () => {
      useSettingsStore.getState().setDefaultResolution("2K");
      expect(useSettingsStore.getState().defaultResolution).toBe("2K");
    });
  });

  describe("overlay config reset", () => {
    it("resets overlay config to defaults", () => {
      useMemeStore.getState().setOverlayPosition("top");
      useMemeStore.getState().setOverlayFontScale(1.7);

      useMemeStore.getState().resetOverlayConfig();

      const config = useMemeStore.getState().overlayConfig;
      expect(config.position).toBe("bottom");
      expect(config.fontScale).toBe(1.0);
      expect(config.offsetX).toBe(0);
      expect(config.offsetY).toBe(0);
    });
  });
});
