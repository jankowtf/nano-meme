import {
  TEST_IMAGE_1_BASE64,
  TEST_IMAGE_2_BASE64,
  TEST_IMAGE_1_MIME,
  TEST_IMAGE_2_MIME,
  TEST_FIXTURE_IMAGES,
} from "../testImages";

describe("testImages fixtures", () => {
  it("exports two base64 PNG strings", () => {
    expect(typeof TEST_IMAGE_1_BASE64).toBe("string");
    expect(typeof TEST_IMAGE_2_BASE64).toBe("string");
    expect(TEST_IMAGE_1_BASE64.length).toBeGreaterThan(10);
    expect(TEST_IMAGE_2_BASE64.length).toBeGreaterThan(10);
  });

  it("both are valid base64 (no whitespace, valid chars)", () => {
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    expect(TEST_IMAGE_1_BASE64).toMatch(base64Regex);
    expect(TEST_IMAGE_2_BASE64).toMatch(base64Regex);
  });

  it("images are different from each other", () => {
    expect(TEST_IMAGE_1_BASE64).not.toBe(TEST_IMAGE_2_BASE64);
  });

  it("exports mime types as image/png", () => {
    expect(TEST_IMAGE_1_MIME).toBe("image/png");
    expect(TEST_IMAGE_2_MIME).toBe("image/png");
  });

  it("TEST_FIXTURE_IMAGES has 2 items with correct structure", () => {
    expect(TEST_FIXTURE_IMAGES).toHaveLength(2);
    expect(TEST_FIXTURE_IMAGES[0].id).toBe("img-1");
    expect(TEST_FIXTURE_IMAGES[0].data).toBe(TEST_IMAGE_1_BASE64);
    expect(TEST_FIXTURE_IMAGES[0].mimeType).toBe("image/png");
    expect(TEST_FIXTURE_IMAGES[1].id).toBe("img-2");
    expect(TEST_FIXTURE_IMAGES[1].data).toBe(TEST_IMAGE_2_BASE64);
    expect(TEST_FIXTURE_IMAGES[1].mimeType).toBe("image/png");
  });
});
