jest.mock("react-native-view-shot", () => ({
  captureRef: jest.fn().mockResolvedValue("file:///captured.png"),
}));

describe("useOverlayCapture module", () => {
  it("exports captureComposite function", () => {
    const mod = require("../useOverlayCapture");
    expect(typeof mod.captureComposite).toBe("function");
  });

  it("captureComposite throws when ref is null", async () => {
    const { captureComposite } = require("../useOverlayCapture");
    const ref = { current: null };
    await expect(captureComposite(ref)).rejects.toThrow("View ref is not attached");
  });

  it("captureComposite calls captureRef and returns URI", async () => {
    const { captureComposite } = require("../useOverlayCapture");
    const { captureRef } = require("react-native-view-shot");
    const ref = { current: {} }; // mock non-null ref
    const uri = await captureComposite(ref);
    expect(captureRef).toHaveBeenCalledWith(ref, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });
    expect(uri).toBe("file:///captured.png");
  });
});
