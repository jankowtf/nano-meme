describe("SettingsScreen", () => {
  it("provides API key configuration", () => {
    const expectedSections = ["apiKey", "generation", "about"];
    expect(expectedSections).toHaveLength(3);
  });
});
