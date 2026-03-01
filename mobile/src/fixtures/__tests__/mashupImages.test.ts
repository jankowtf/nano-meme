import { MASHUP_IMAGES } from "../mashupImages";

describe("mashupImages", () => {
  it("exports exactly 2 images", () => {
    expect(MASHUP_IMAGES).toHaveLength(2);
  });

  it("each image has correct structure", () => {
    for (const img of MASHUP_IMAGES) {
      expect(img).toHaveProperty("id");
      expect(img).toHaveProperty("data");
      expect(img).toHaveProperty("mimeType");
      expect(typeof img.id).toBe("string");
      expect(typeof img.data).toBe("string");
      expect(img.mimeType).toBe("image/jpeg");
    }
  });

  it("images have ids img-1 and img-2", () => {
    expect(MASHUP_IMAGES[0].id).toBe("img-1");
    expect(MASHUP_IMAGES[1].id).toBe("img-2");
  });

  it("image data is non-empty base64", () => {
    for (const img of MASHUP_IMAGES) {
      expect(img.data.length).toBeGreaterThan(100);
      // Valid base64 characters only
      expect(img.data).toMatch(/^[A-Za-z0-9+/=]+$/);
    }
  });

  it("images are substantially larger than test fixtures", () => {
    // Real images should be >10KB base64, not 4x4 pixel placeholders
    for (const img of MASHUP_IMAGES) {
      expect(img.data.length).toBeGreaterThan(10_000);
    }
  });
});
