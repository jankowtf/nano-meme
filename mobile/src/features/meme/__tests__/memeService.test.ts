import { generateAndSaveMeme } from "../memeService";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock atob for base64 decoding
global.atob = jest.fn((data: string) => data);

// Mock expo-file-system new API
const mockWrite = jest.fn();
jest.mock("expo-file-system", () => ({
  File: jest.fn().mockImplementation((...uris: unknown[]) => ({
    uri: `file:///mock/documents/${String(uris[uris.length - 1])}`,
    write: mockWrite,
  })),
  Paths: {
    document: { uri: "file:///mock/documents/" },
  },
}));

function mockSuccessResponse() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () =>
      Promise.resolve({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: "base64imagedata",
                  },
                },
              ],
              role: "model",
            },
          },
        ],
      }),
  });
}

describe("memeService", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockWrite.mockReset();
  });

  it("generates and saves a meme, returning imageUri and baseImageUri", async () => {
    mockSuccessResponse();

    const result = await generateAndSaveMeme("test-key", "A cat");
    expect(result.imageUri).toContain("file:///mock/documents/");
    expect(result.imageUri).toContain(".png");
    expect(result.baseImageUri).toContain("file:///mock/documents/");
    expect(mockWrite).toHaveBeenCalled();
  });

  it("sends prompt to API without overlay text instructions", async () => {
    mockSuccessResponse();

    await generateAndSaveMeme("test-key", "A cat sitting on a couch");

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    const promptText = callBody.contents[0].parts[0].text;
    expect(promptText).toBe("A cat sitting on a couch");
    // No overlay instructions should be in the prompt
    expect(promptText).not.toContain("Render the following text");
    expect(promptText).not.toContain("bold, white font");
  });

  it("passes resolution to API", async () => {
    mockSuccessResponse();

    await generateAndSaveMeme("test-key", "A dog", "1K");

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.generationConfig?.imageConfig?.imageSize).toBe("1K");
  });

  it("passes reference images to API", async () => {
    mockSuccessResponse();

    const refImages = [
      { id: "img-1", data: "data1", mimeType: "image/png" },
      { id: "img-2", data: "data2", mimeType: "image/jpeg" },
    ];
    await generateAndSaveMeme("test-key", "Combine these", undefined, refImages);

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.contents[0].parts).toHaveLength(3); // text + 2 images
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: { message: "Bad request", status: "INVALID_ARGUMENT" },
        }),
    });

    await expect(
      generateAndSaveMeme("test-key", "Bad prompt"),
    ).rejects.toThrow();
  });

  it("passes aspect ratio to API", async () => {
    mockSuccessResponse();

    await generateAndSaveMeme("test-key", "A dog", "1K", undefined, "16:9");

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.generationConfig?.imageConfig?.aspectRatio).toBe("16:9");
    expect(callBody.generationConfig?.imageConfig?.imageSize).toBe("1K");
  });

  it("throws when API returns no image data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: "No image here" }],
                role: "model",
              },
            },
          ],
        }),
    });

    await expect(
      generateAndSaveMeme("test-key", "A cat"),
    ).rejects.toThrow("No image data in response");
  });
});
