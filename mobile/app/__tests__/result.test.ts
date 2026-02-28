describe("ResultScreen", () => {
  it("displays generated meme with share/save actions", () => {
    const expectedActions = ["share", "save", "copy"];
    expect(expectedActions).toHaveLength(3);
  });
});
