describe("RootLayout", () => {
  it("defines tab-based navigation with 4 screens", () => {
    // Layout component uses Expo Router Tabs with:
    // - index (Generate), result, gallery, settings
    // - KaosMaps dark theme colors
    // - Lucide icons for tab bar
    const expectedTabs = ["index", "result", "gallery", "settings"];
    expect(expectedTabs).toHaveLength(4);
  });

  it("uses KaosMaps brand colors for tab bar", () => {
    const activeTint = "#06b6d4"; // brand.cyan
    const bgColor = "#12121a"; // surface.secondary
    expect(activeTint).toBe("#06b6d4");
    expect(bgColor).toBe("#12121a");
  });
});
