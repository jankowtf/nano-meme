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

describe("memeService", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockWrite.mockReset();
  });

  it("generates and saves a meme", async () => {
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

    const result = await generateAndSaveMeme("test-key", "A cat", "Funny text");
    expect(result.imageUri).toContain("file:///mock/documents/");
    expect(result.imageUri).toContain(".png");
    expect(mockWrite).toHaveBeenCalled();
  });

  it("includes overlay text in the prompt", async () => {
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

    await generateAndSaveMeme("test-key", "A cat", "Hello World");

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.contents[0].parts[0].text).toContain("Hello World");
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
      generateAndSaveMeme("test-key", "Bad prompt", "Text"),
    ).rejects.toThrow();
  });
});
