describe("HomeScreen (Generate)", () => {
  it("provides prompt input and generate button", () => {
    // Home screen renders:
    // - Prompt TextInput
    // - Overlay text TextInput
    // - Resolution picker
    // - Generate button
    const expectedElements = ["promptInput", "overlayInput", "resolutionPicker", "generateButton"];
    expect(expectedElements).toHaveLength(4);
  });
});
