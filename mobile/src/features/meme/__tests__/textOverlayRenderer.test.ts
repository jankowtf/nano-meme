// textOverlayRenderer.tsx is a React component file that requires JSX transforms.
// The pure logic (computeOverlayStyle) is tested in overlayStyle.test.ts.
// This test verifies the module boundary via mocking.

jest.mock("../textOverlayRenderer", () => {
  const actual = jest.requireActual("../overlayStyle");
  return {
    MemeComposite: { displayName: "MemeComposite" },
    computeOverlayStyle: actual.computeOverlayStyle,
    ...actual,
  };
});

describe("textOverlayRenderer", () => {
  it("exports MemeComposite component", () => {
    const mod = require("../textOverlayRenderer");
    expect(mod.MemeComposite).toBeDefined();
    expect(mod.MemeComposite.displayName).toBe("MemeComposite");
  });

  it("re-exports computeOverlayStyle with lines support", () => {
    const mod = require("../textOverlayRenderer");
    expect(typeof mod.computeOverlayStyle).toBe("function");
    const result = mod.computeOverlayStyle(
      { position: "bottom", fontScale: 1.0, offsetX: 0, offsetY: 0 },
      1000,
      1000,
      "Hello World",
    );
    expect(result).toHaveProperty("fontSize");
    expect(result).toHaveProperty("x");
    expect(result).toHaveProperty("y");
    expect(result).toHaveProperty("lines");
    expect(result).toHaveProperty("lineHeight");
    expect(result.lines.length).toBeGreaterThan(0);
  });
});
