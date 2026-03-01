import { computeOverlayStyle, type OverlayStyleConfig } from "../overlayStyle";

describe("computeOverlayStyle", () => {
  const defaultConfig: OverlayStyleConfig = {
    position: "bottom",
    fontScale: 1.0,
    offsetX: 0,
    offsetY: 0,
  };

  it("computes font size as max(width/14, 24) * fontScale", () => {
    const result = computeOverlayStyle(defaultConfig, 1024, 1024);
    // 1024/14 ≈ 73.14, max(73.14, 24) * 1.0 = 73.14
    expect(result.fontSize).toBeCloseTo(1024 / 14, 1);
  });

  it("enforces minimum font size of 24", () => {
    const result = computeOverlayStyle(defaultConfig, 100, 100);
    // 100/14 ≈ 7.14, max(7.14, 24) = 24
    expect(result.fontSize).toBe(24);
  });

  it("applies fontScale multiplier", () => {
    const config = { ...defaultConfig, fontScale: 1.5 };
    const result = computeOverlayStyle(config, 1024, 1024);
    expect(result.fontSize).toBeCloseTo((1024 / 14) * 1.5, 1);
  });

  it("positions text at bottom with 5% margin", () => {
    const result = computeOverlayStyle(defaultConfig, 1000, 1000);
    // Bottom: y = height - fontSize - margin (5% of height)
    const margin = 1000 * 0.05;
    expect(result.y).toBeCloseTo(1000 - result.fontSize - margin, 0);
  });

  it("positions text at top with 5% margin", () => {
    const config = { ...defaultConfig, position: "top" as const };
    const result = computeOverlayStyle(config, 1000, 1000);
    const margin = 1000 * 0.05;
    expect(result.y).toBeCloseTo(margin + result.fontSize, 0);
  });

  it("positions text at center", () => {
    const config = { ...defaultConfig, position: "center" as const };
    const result = computeOverlayStyle(config, 1000, 1000);
    expect(result.y).toBeCloseTo(1000 / 2, 0);
  });

  it("centers text horizontally", () => {
    const result = computeOverlayStyle(defaultConfig, 1000, 1000);
    expect(result.x).toBe(1000 / 2);
    expect(result.textAnchor).toBe("middle");
  });

  it("applies offset as fraction of image dimensions", () => {
    const config = { ...defaultConfig, offsetX: 0.1, offsetY: -0.2 };
    const baseline = computeOverlayStyle(defaultConfig, 1000, 1000);
    const result = computeOverlayStyle(config, 1000, 1000);
    expect(result.x).toBeCloseTo(baseline.x + 0.1 * 1000, 0);
    expect(result.y).toBeCloseTo(baseline.y + -0.2 * 1000, 0);
  });

  it("computes maxWidth as 90% of image width", () => {
    const result = computeOverlayStyle(defaultConfig, 1000, 1000);
    expect(result.maxWidth).toBe(1000 * 0.9);
  });

  it("returns correct structure", () => {
    const result = computeOverlayStyle(defaultConfig, 500, 500);
    expect(result).toHaveProperty("fontSize");
    expect(result).toHaveProperty("x");
    expect(result).toHaveProperty("y");
    expect(result).toHaveProperty("maxWidth");
    expect(result).toHaveProperty("textAnchor");
  });
});
