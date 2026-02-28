import { useSettingsStore } from "../settingsStore";

describe("settingsStore", () => {
  beforeEach(() => {
    useSettingsStore.getState().reset();
  });

  it("has default values", () => {
    const state = useSettingsStore.getState();
    expect(state.defaultResolution).toBe("1K");
    expect(state.defaultAspectRatio).toBe("1:1");
    expect(state.autoOverlayText).toBe(true);
  });

  it("updates resolution", () => {
    useSettingsStore.getState().setDefaultResolution("2K");
    expect(useSettingsStore.getState().defaultResolution).toBe("2K");
  });

  it("updates aspect ratio", () => {
    useSettingsStore.getState().setDefaultAspectRatio("16:9");
    expect(useSettingsStore.getState().defaultAspectRatio).toBe("16:9");
  });

  it("toggles auto overlay text", () => {
    useSettingsStore.getState().setAutoOverlayText(false);
    expect(useSettingsStore.getState().autoOverlayText).toBe(false);
  });

  it("resets to defaults", () => {
    useSettingsStore.getState().setDefaultResolution("4K");
    useSettingsStore.getState().setDefaultAspectRatio("9:16");
    useSettingsStore.getState().reset();
    expect(useSettingsStore.getState().defaultResolution).toBe("1K");
    expect(useSettingsStore.getState().defaultAspectRatio).toBe("1:1");
  });
});
