import {
  APP_NAME,
  BUNDLE_ID,
  GEMINI_MODEL_ID,
  GEMINI_BASE_URL,
  RESOLUTIONS,
  ASPECT_RATIOS,
  DEFAULT_RESOLUTION,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_YODA_PROMPT,
  DEFAULT_OVERLAY_TEXT,
} from "../constants";

describe("constants", () => {
  it("defines app identity", () => {
    expect(APP_NAME).toBe("NanoMeme");
    expect(BUNDLE_ID).toBe("com.kaosmaps.nanomeme");
  });

  it("defines Gemini API config", () => {
    expect(GEMINI_MODEL_ID).toBe("gemini-3.1-flash-image-preview");
    expect(GEMINI_BASE_URL).toContain("generativelanguage.googleapis.com");
  });

  it("defines resolution options", () => {
    expect(Object.keys(RESOLUTIONS)).toEqual(["0.5K", "1K", "2K", "4K"]);
  });

  it("defines aspect ratio options", () => {
    expect(Object.keys(ASPECT_RATIOS)).toContain("1:1");
    expect(Object.keys(ASPECT_RATIOS)).toContain("16:9");
  });

  it("has sensible defaults", () => {
    expect(DEFAULT_RESOLUTION).toBe("1K");
    expect(DEFAULT_ASPECT_RATIO).toBe("1:1");
  });

  it("defines yoda prompt", () => {
    expect(DEFAULT_YODA_PROMPT).toContain("ancient green-skinned alien elder");
  });

  it("defines overlay text", () => {
    expect(DEFAULT_OVERLAY_TEXT).toBe("Make or make not. There is no buy.");
  });
});
