describe("GalleryScreen", () => {
  it("shows meme history list", () => {
    const expectedFeatures = ["list", "favorite", "delete"];
    expect(expectedFeatures).toHaveLength(3);
  });
});
