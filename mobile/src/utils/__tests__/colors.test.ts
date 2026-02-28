import { colors } from "../colors";

describe("colors", () => {
  it("exports brand colors", () => {
    expect(colors.brand.cyan).toBe("#06b6d4");
    expect(colors.brand.teal).toBe("#14b8a6");
    expect(colors.brand.magenta).toBe("#ec4899");
    expect(colors.brand.active).toBe("#facc15");
    expect(colors.brand.success).toBe("#22c55e");
    expect(colors.brand.warning).toBe("#f97316");
  });

  it("exports surface colors", () => {
    expect(colors.surface.primary).toBe("#0a0a0f");
    expect(colors.surface.secondary).toBe("#12121a");
    expect(colors.surface.card).toBe("#1a1a24");
  });

  it("exports text colors", () => {
    expect(colors.text.primary).toBe("#e2e8f0");
    expect(typeof colors.text.secondary).toBe("string");
    expect(typeof colors.text.muted).toBe("string");
  });
});
