import { computeOverlayStyle, wrapText, type OverlayStyleConfig } from "../overlayStyle";

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

  it("returns correct structure with lines and lineHeight", () => {
    const result = computeOverlayStyle(defaultConfig, 500, 500, "Hello world");
    expect(result).toHaveProperty("fontSize");
    expect(result).toHaveProperty("x");
    expect(result).toHaveProperty("y");
    expect(result).toHaveProperty("maxWidth");
    expect(result).toHaveProperty("textAnchor");
    expect(result).toHaveProperty("lines");
    expect(result).toHaveProperty("lineHeight");
  });

  it("adjusts y for multi-line bottom text (shifts up)", () => {
    // Long text that wraps to multiple lines at bottom position
    const longText = "THIS IS A VERY LONG OVERLAY TEXT THAT SHOULD WRAP TO MULTIPLE LINES ON THE IMAGE";
    const singleLine = computeOverlayStyle(defaultConfig, 400, 400, "SHORT");
    const multiLine = computeOverlayStyle(defaultConfig, 400, 400, longText);

    // Multi-line bottom text should start higher so all lines fit
    expect(multiLine.lines.length).toBeGreaterThan(1);
    expect(multiLine.y).toBeLessThan(singleLine.y);
  });

  it("does not shift y for multi-line top text", () => {
    const topConfig = { ...defaultConfig, position: "top" as const };
    const shortResult = computeOverlayStyle(topConfig, 400, 400, "SHORT");
    const longText = "THIS IS A VERY LONG OVERLAY TEXT THAT SHOULD WRAP TO MULTIPLE LINES ON THE IMAGE";
    const longResult = computeOverlayStyle(topConfig, 400, 400, longText);

    // Top position: y stays the same regardless of line count
    expect(longResult.y).toBeCloseTo(shortResult.y, 0);
  });

  it("centers multi-line text vertically for center position", () => {
    const centerConfig = { ...defaultConfig, position: "center" as const };
    const longText = "THIS IS A VERY LONG OVERLAY TEXT THAT SHOULD WRAP TO MULTIPLE LINES ON THE IMAGE";
    const result = computeOverlayStyle(centerConfig, 400, 400, longText);

    // Center text should be shifted up by half total height
    const totalTextHeight = (result.lines.length - 1) * result.lineHeight;
    const expectedY = 400 / 2 - totalTextHeight / 2;
    expect(result.y).toBeCloseTo(expectedY, 0);
  });
});

describe("wrapText", () => {
  it("returns single line for short text", () => {
    const lines = wrapText("HELLO", 500, 40);
    expect(lines).toEqual(["HELLO"]);
  });

  it("wraps long text into multiple lines", () => {
    const lines = wrapText("THIS IS A VERY LONG TEXT THAT SHOULD WRAP", 200, 40);
    expect(lines.length).toBeGreaterThan(1);
    // All words should be present
    expect(lines.join(" ")).toBe("THIS IS A VERY LONG TEXT THAT SHOULD WRAP");
  });

  it("returns empty array for empty text", () => {
    const lines = wrapText("", 500, 40);
    expect(lines).toEqual([]);
  });

  it("does not break a single long word", () => {
    const lines = wrapText("SUPERCALIFRAGILISTICEXPIALIDOCIOUS", 100, 40);
    expect(lines).toEqual(["SUPERCALIFRAGILISTICEXPIALIDOCIOUS"]);
  });

  it("handles text that fits exactly in one line", () => {
    // charWidth = fontSize * 0.6 = 24, so 500/24 ≈ 20 chars per line
    const lines = wrapText("HELLO WORLD", 500, 40);
    expect(lines).toEqual(["HELLO WORLD"]);
  });

  it("preserves word order across lines", () => {
    const input = "ONE TWO THREE FOUR FIVE SIX SEVEN EIGHT";
    const lines = wrapText(input, 200, 40);
    const rejoined = lines.join(" ");
    expect(rejoined).toBe(input);
  });

  it("respects explicit line breaks (\\n)", () => {
    const lines = wrapText("LINE ONE\nLINE TWO\nLINE THREE", 500, 40);
    expect(lines).toEqual(["LINE ONE", "LINE TWO", "LINE THREE"]);
  });

  it("combines explicit line breaks with word wrapping", () => {
    // First paragraph is short, second is long enough to wrap
    const lines = wrapText("SHORT\nTHIS IS A MUCH LONGER PARAGRAPH THAT WRAPS", 200, 40);
    expect(lines[0]).toBe("SHORT");
    expect(lines.length).toBeGreaterThan(2);
  });

  it("handles multiple consecutive line breaks", () => {
    const lines = wrapText("A\n\nB", 500, 40);
    // Empty line between A and B becomes an empty string entry
    expect(lines).toEqual(["A", "", "B"]);
  });
});
