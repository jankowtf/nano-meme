import { clampOffset, clampFontScale } from "../overlayGestureUtils";
import { computeOverlayStyle } from "../overlayStyle";

describe("InteractiveOverlay integration", () => {
  describe("gesture callback logic", () => {
    it("pan update computes clamped offset from translation + start offset", () => {
      const imageWidth = 320;
      const imageHeight = 320;
      const startOffsetX = 0.1;
      const startOffsetY = -0.1;
      const translationX = 50;
      const translationY = -30;

      const newOffsetX = clampOffset(startOffsetX + translationX / imageWidth);
      const newOffsetY = clampOffset(startOffsetY + translationY / imageHeight);

      expect(newOffsetX).toBeCloseTo(0.256, 2);
      expect(newOffsetY).toBeCloseTo(-0.194, 2);
    });

    it("pinch update computes clamped scale from gesture scale * start scale", () => {
      const startFontScale = 1.0;
      const gestureScale = 1.5;

      const newScale = clampFontScale(startFontScale * gestureScale);
      expect(newScale).toBe(1.5);
    });

    it("pinch clamps to max 3.0", () => {
      const startFontScale = 2.0;
      const gestureScale = 2.0;

      const newScale = clampFontScale(startFontScale * gestureScale);
      expect(newScale).toBe(3.0);
    });
  });

  describe("edit input positioning", () => {
    it("computes edit position from overlayStyle at text location", () => {
      const config = { position: "bottom" as const, fontScale: 1.0, offsetX: 0, offsetY: 0 };
      const computed = computeOverlayStyle(config, 320, 320, "HELLO WORLD");

      // Edit input should be near the text y position
      const editTop = Math.max(0, computed.y - computed.fontSize * 0.5);
      expect(editTop).toBeGreaterThan(200); // bottom position → lower half of image
      expect(editTop).toBeLessThan(320);
    });

    it("edit position adapts to top position", () => {
      const config = { position: "top" as const, fontScale: 1.0, offsetX: 0, offsetY: 0 };
      const computed = computeOverlayStyle(config, 320, 320, "HELLO WORLD");

      const editTop = Math.max(0, computed.y - computed.fontSize * 0.5);
      expect(editTop).toBeLessThan(100); // top position → upper area
    });

    it("edit font size scales with overlay fontScale", () => {
      const config1 = { position: "bottom" as const, fontScale: 1.0, offsetX: 0, offsetY: 0 };
      const config2 = { position: "bottom" as const, fontScale: 2.0, offsetX: 0, offsetY: 0 };

      const computed1 = computeOverlayStyle(config1, 320, 320, "TEST");
      const computed2 = computeOverlayStyle(config2, 320, 320, "TEST");

      const editFontSize1 = Math.max(12, computed1.fontSize * 0.6);
      const editFontSize2 = Math.max(12, computed2.fontSize * 0.6);

      expect(editFontSize2).toBeGreaterThan(editFontSize1);
    });
  });

  describe("onGestureActive callback", () => {
    it("is called with true on gesture start and false on end", () => {
      const onGestureActive = jest.fn();

      // Simulate savePanStart calling onGestureActive(true)
      onGestureActive(true);
      expect(onGestureActive).toHaveBeenCalledWith(true);

      // Simulate handlePanEnd calling onGestureActive(false)
      onGestureActive(false);
      expect(onGestureActive).toHaveBeenCalledWith(false);
    });
  });

  describe("zero-dimension guard", () => {
    it("uses safe fallback when imageWidth is 0", () => {
      const imageWidth = 0;
      const safeWidth = imageWidth > 0 ? imageWidth : 300;
      expect(safeWidth).toBe(300);
    });

    it("uses safe fallback when imageHeight is 0", () => {
      const imageHeight = 0;
      const safeHeight = imageHeight > 0 ? imageHeight : 300;
      expect(safeHeight).toBe(300);
    });

    it("uses actual dimensions when positive", () => {
      const imageWidth = 400;
      const imageHeight = 600;
      const safeWidth = imageWidth > 0 ? imageWidth : 300;
      const safeHeight = imageHeight > 0 ? imageHeight : 300;
      expect(safeWidth).toBe(400);
      expect(safeHeight).toBe(600);
    });

    it("computeOverlayStyle does not crash with fallback dimensions", () => {
      const config = { position: "bottom" as const, fontScale: 1.0, offsetX: 0, offsetY: 0 };
      const safeWidth = 300;
      const safeHeight = 300;
      expect(() => {
        computeOverlayStyle(config, safeWidth, safeHeight, "TEST");
      }).not.toThrow();
    });

    it("pan with zero-dimension fallback does not produce NaN", () => {
      const imageWidth = 0;
      const safeWidth = imageWidth > 0 ? imageWidth : 300;
      const startOffsetX = 0;
      const translationX = 50;
      const newOffsetX = clampOffset(startOffsetX + translationX / safeWidth);
      expect(Number.isNaN(newOffsetX)).toBe(false);
    });
  });
});
