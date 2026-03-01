/**
 * Minimal PNG test fixtures for mashup preset testing.
 * Each is a valid 4x4 pixel PNG encoded as base64.
 */

// 4x4 solid cyan (#06B6D4) PNG
export const TEST_IMAGE_1_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAADklEQVQI12P4z8BQDwAEgAF/QualzQAAAABJRU5ErkJggg==";

// 4x4 solid magenta (#D946EF) PNG
export const TEST_IMAGE_2_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAADklEQVQI12OYwcBQDwAEOAF/xKPmGgAAAABJRU5ErkJggg==";

export const TEST_IMAGE_1_MIME = "image/png";
export const TEST_IMAGE_2_MIME = "image/png";

export const TEST_FIXTURE_IMAGES = [
  { id: "img-1", data: TEST_IMAGE_1_BASE64, mimeType: TEST_IMAGE_1_MIME },
  { id: "img-2", data: TEST_IMAGE_2_BASE64, mimeType: TEST_IMAGE_2_MIME },
] as const;
