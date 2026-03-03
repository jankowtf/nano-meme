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

  describe("generateAndSaveMeme", () => {
    it("generates and saves a meme, returning imageUri and baseImageUri", async () => {
      mockSuccessResponse();

      const result = await generateAndSaveMeme("test-key", "A cat");
      expect(result.imageUri).toContain("file:///mock/documents/");
      expect(result.imageUri).toContain(".png");
      expect(result.baseImageUri).toContain("file:///mock/documents/");
      expect(result.mimeType).toBe("image/png");
      expect(mockWrite).toHaveBeenCalled();
    });

    it("sends prompt to API without overlay text instructions", async () => {
      mockSuccessResponse();

      await generateAndSaveMeme("test-key", "A cat sitting on a couch");

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const promptText = callBody.contents[0].parts[0].text;
      expect(promptText).toBe("A cat sitting on a couch");
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

    it("passes aspect ratio to API", async () => {
      mockSuccessResponse();

      await generateAndSaveMeme("test-key", "A dog", "1K", undefined, "16:9");

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.generationConfig?.imageConfig?.aspectRatio).toBe("16:9");
      expect(callBody.generationConfig?.imageConfig?.imageSize).toBe("1K");
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

    it("throws timeout error when fetch takes too long", async () => {
      mockFetch.mockImplementationOnce(
        (_url: string, options: { signal?: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            if (options?.signal) {
              options.signal.addEventListener("abort", () => {
                reject(new DOMException("The operation was aborted", "AbortError"));
              });
            }
          }),
      );

      jest.useFakeTimers();
      const promise = generateAndSaveMeme("test-key", "A slow prompt");
      jest.advanceTimersByTime(121_000);
      await expect(promise).rejects.toThrow("timed out");
      jest.useRealTimers();
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

    it("throws descriptive error when file.write() fails", async () => {
      mockSuccessResponse();
      mockWrite.mockImplementationOnce(() => {
        throw new Error("ENOSPC: no space left on device");
      });

      await expect(
        generateAndSaveMeme("test-key", "A cat"),
      ).rejects.toThrow("Failed to save image: ENOSPC: no space left on device");
    });

    it("throws descriptive error when file.write() throws non-Error", async () => {
      mockSuccessResponse();
      mockWrite.mockImplementationOnce(() => {
        throw "unknown write error";
      });

      await expect(
        generateAndSaveMeme("test-key", "A cat"),
      ).rejects.toThrow("Failed to save image: Storage write failed");
    });

    it("throws when API returns null result", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      await expect(
        generateAndSaveMeme("test-key", "A cat"),
      ).rejects.toThrow("No image data in response");
    });

    it("throws when API response JSON parse fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error("Unexpected token")),
      });

      await expect(
        generateAndSaveMeme("test-key", "A cat"),
      ).rejects.toThrow("Failed to parse API response");
    });

    it("handles content filtered by SAFETY finish reason", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: { parts: [{ text: "Blocked" }], role: "model" },
                finishReason: "SAFETY",
              },
            ],
          }),
      });

      await expect(
        generateAndSaveMeme("test-key", "Something inappropriate"),
      ).rejects.toThrow("Content filtered");
    });

    it("handles content filtered by OTHER finish reason", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: { parts: [{ text: "Blocked" }], role: "model" },
                finishReason: "OTHER",
              },
            ],
          }),
      });

      await expect(
        generateAndSaveMeme("test-key", "Copyright character"),
      ).rejects.toThrow("Content filtered");
    });
  });
});
