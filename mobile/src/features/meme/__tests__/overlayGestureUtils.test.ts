import {
  clampOffset,
  clampFontScale,
  normalizeOffset,
  computeTextBoundingBox,
  isNearCorner,
  computeResizeScale,
} from "../overlayGestureUtils";

describe("overlayGestureUtils", () => {
  describe("clampOffset", () => {
    it("passes through values within range", () => {
      expect(clampOffset(0.1)).toBe(0.1);
      expect(clampOffset(-0.2)).toBe(-0.2);
      expect(clampOffset(0)).toBe(0);
    });

    it("allows values up to 1.0 (full image coverage)", () => {
      expect(clampOffset(0.8)).toBe(0.8);
      expect(clampOffset(1.0)).toBe(1.0);
      expect(clampOffset(-0.8)).toBe(-0.8);
      expect(clampOffset(-1.0)).toBe(-1.0);
    });

    it("clamps to -1.0 minimum", () => {
      expect(clampOffset(-1.5)).toBe(-1.0);
      expect(clampOffset(-2.0)).toBe(-1.0);
    });

    it("clamps to 1.0 maximum", () => {
      expect(clampOffset(1.5)).toBe(1.0);
      expect(clampOffset(2.0)).toBe(1.0);
    });
  });

  describe("clampFontScale", () => {
    it("passes through values within range", () => {
      expect(clampFontScale(1.0)).toBe(1.0);
      expect(clampFontScale(0.5)).toBe(0.5);
      expect(clampFontScale(2.5)).toBe(2.5);
    });

    it("clamps to 0.3 minimum", () => {
      expect(clampFontScale(0.1)).toBe(0.3);
      expect(clampFontScale(0)).toBe(0.3);
    });

    it("clamps to 3.0 maximum", () => {
      expect(clampFontScale(3.5)).toBe(3.0);
      expect(clampFontScale(5.0)).toBe(3.0);
    });
  });

  describe("normalizeOffset", () => {
    it("converts pixel displacement to normalized value", () => {
      expect(normalizeOffset(50, 500)).toBeCloseTo(0.1);
    });

    it("returns 0 when dimension is 0", () => {
      expect(normalizeOffset(100, 0)).toBe(0);
    });

    it("handles negative displacements", () => {
      expect(normalizeOffset(-30, 300)).toBeCloseTo(-0.1);
    });

    it("result is clamped to [-1.0, 1.0]", () => {
      expect(normalizeOffset(600, 500)).toBe(1.0);
      expect(normalizeOffset(-600, 500)).toBe(-1.0);
    });
  });

  describe("computeTextBoundingBox", () => {
    const baseComputed = {
      x: 160,
      y: 250,
      fontSize: 24,
      lines: ["HELLO WORLD"],
      lineHeight: 28.8,
      maxWidth: 288,
    };

    it("computes non-zero bounding box for valid text", () => {
      const bbox = computeTextBoundingBox(baseComputed, 320);
      expect(bbox.width).toBeGreaterThan(0);
      expect(bbox.height).toBeGreaterThan(0);
    });

    it("centers the box around the x anchor", () => {
      const bbox = computeTextBoundingBox(baseComputed, 320);
      // left should be x - width/2
      expect(bbox.left).toBeCloseTo(160 - bbox.width / 2);
    });

    it("places top near the y position adjusted for ascent", () => {
      const bbox = computeTextBoundingBox(baseComputed, 320);
      // top = y - fontSize * 0.2
      expect(bbox.top).toBeCloseTo(250 - 24 * 0.2);
    });

    it("height accounts for multiple lines", () => {
      const multiLine = { ...baseComputed, lines: ["LINE ONE", "LINE TWO", "LINE THREE"] };
      const bbox = computeTextBoundingBox(multiLine, 320);
      // height = fontSize + (lines - 1) * lineHeight
      expect(bbox.height).toBeCloseTo(24 + 2 * 28.8);
    });

    it("returns zero box for empty lines", () => {
      const empty = { ...baseComputed, lines: [] as string[] };
      const bbox = computeTextBoundingBox(empty, 320);
      expect(bbox.width).toBe(0);
      expect(bbox.height).toBe(0);
    });

    it("returns zero box for zero imageWidth", () => {
      const bbox = computeTextBoundingBox(baseComputed, 0);
      expect(bbox.width).toBe(0);
      expect(bbox.height).toBe(0);
    });
  });

  describe("isNearCorner", () => {
    const bbox = { left: 20, top: 40, width: 200, height: 60 };

    it("returns true when touch is at top-left corner", () => {
      expect(isNearCorner(20, 40, bbox)).toBe(true);
    });

    it("returns true when touch is at top-right corner", () => {
      expect(isNearCorner(220, 40, bbox)).toBe(true);
    });

    it("returns true when touch is at bottom-left corner", () => {
      expect(isNearCorner(20, 100, bbox)).toBe(true);
    });

    it("returns true when touch is at bottom-right corner", () => {
      expect(isNearCorner(220, 100, bbox)).toBe(true);
    });

    it("returns true within threshold distance of corner", () => {
      expect(isNearCorner(30, 50, bbox, 24)).toBe(true); // 10px from top-left
    });

    it("returns false when touch is far from all corners", () => {
      expect(isNearCorner(120, 70, bbox)).toBe(false); // center of box
    });

    it("returns false for zero-size bounding box", () => {
      expect(isNearCorner(0, 0, { left: 0, top: 0, width: 0, height: 0 })).toBe(false);
    });

    it("respects custom threshold", () => {
      expect(isNearCorner(25, 45, bbox, 5)).toBe(true); // within 5px
      expect(isNearCorner(35, 55, bbox, 5)).toBe(false); // outside 5px
    });
  });

  describe("computeResizeScale", () => {
    it("scales up on positive diagonal drag", () => {
      const result = computeResizeScale(1.0, 50, 50, 320);
      expect(result).toBeGreaterThan(1.0);
    });

    it("scales down on negative diagonal drag", () => {
      const result = computeResizeScale(1.0, -50, -50, 320);
      expect(result).toBeLessThan(1.0);
    });

    it("clamps to minimum 0.3", () => {
      const result = computeResizeScale(0.5, -500, -500, 320);
      expect(result).toBe(0.3);
    });

    it("clamps to maximum 3.0", () => {
      const result = computeResizeScale(2.5, 500, 500, 320);
      expect(result).toBe(3.0);
    });

    it("returns startScale when imageWidth is 0", () => {
      expect(computeResizeScale(1.5, 50, 50, 0)).toBe(1.5);
    });

    it("returns startScale for zero translation", () => {
      const result = computeResizeScale(1.0, 0, 0, 320);
      expect(result).toBe(1.0);
    });
  });
});
