import { clampOffset, clampFontScale, normalizeOffset } from "../overlayGestureUtils";

describe("overlayGestureUtils", () => {
  describe("clampOffset", () => {
    it("passes through values within range", () => {
      expect(clampOffset(0.1)).toBe(0.1);
      expect(clampOffset(-0.2)).toBe(-0.2);
      expect(clampOffset(0)).toBe(0);
    });

    it("clamps to -0.5 minimum", () => {
      expect(clampOffset(-0.8)).toBe(-0.5);
      expect(clampOffset(-1.0)).toBe(-0.5);
    });

    it("clamps to 0.5 maximum", () => {
      expect(clampOffset(0.8)).toBe(0.5);
      expect(clampOffset(1.0)).toBe(0.5);
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

    it("result is clamped to [-0.5, 0.5]", () => {
      expect(normalizeOffset(400, 500)).toBe(0.5);
    });
  });
});
