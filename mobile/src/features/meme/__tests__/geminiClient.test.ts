import { GeminiClient, GeminiAPIError } from "../geminiClient";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("GeminiClient", () => {
  const client = new GeminiClient("test-api-key");

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("constructs the correct API URL", () => {
    // Access the internal URL builder
    const url = GeminiClient.buildApiUrl("test-key");
    expect(url).toContain("generativelanguage.googleapis.com");
    expect(url).toContain("gemini-3.1-flash-image-preview");
    expect(url).toContain("key=test-key");
  });

  it("sends a generate request", async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [
              { inlineData: { mimeType: "image/png", data: "base64data" } },
            ],
            role: "model",
          },
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await client.generateImage("A test prompt");
    expect(result.imageData).toBe("base64data");
    expect(result.mimeType).toBe("image/png");
  });

  it("throws GeminiAPIError on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: { message: "Invalid request", status: "INVALID_ARGUMENT" },
        }),
    });

    await expect(client.generateImage("bad prompt")).rejects.toThrow(GeminiAPIError);
  });

  it("handles PROHIBITED_CONTENT error specifically", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: {
            message: "Content was blocked",
            status: "PROHIBITED_CONTENT",
          },
        }),
    });

    try {
      await client.generateImage("blocked prompt");
      fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(GeminiAPIError);
      expect((e as GeminiAPIError).isProhibitedContent).toBe(true);
    }
  });

  it("handles network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(client.generateImage("test")).rejects.toThrow("Network error");
  });

  it("throws when successful response JSON parse fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error("Unexpected token")),
    });

    await expect(client.generateImage("test")).rejects.toThrow(
      "Failed to parse API response as JSON",
    );
  });

  it("handles timeout (AbortError)", async () => {
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
    const promise = client.generateImage("slow prompt");
    jest.advanceTimersByTime(121_000);
    await expect(promise).rejects.toThrow("timed out");
    jest.useRealTimers();
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

    await expect(client.generateImage("inappropriate")).rejects.toThrow("Content filtered");
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

    await expect(client.generateImage("copyrighted")).rejects.toThrow("Content filtered");
  });

  it("throws when response has no image data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: { parts: [{ text: "No image" }], role: "model" },
            },
          ],
        }),
    });

    await expect(client.generateImage("test")).rejects.toThrow("No image data");
  });

  it("passes resolution to API request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ inlineData: { mimeType: "image/png", data: "base64data" } }],
                role: "model",
              },
            },
          ],
        }),
    });

    await client.generateImage("test", "1K");

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.generationConfig?.imageConfig?.imageSize).toBe("1K");
  });

  it("passes aspect ratio to API request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ inlineData: { mimeType: "image/png", data: "base64data" } }],
                role: "model",
              },
            },
          ],
        }),
    });

    await client.generateImage("test", "1K", undefined, "16:9");

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.generationConfig?.imageConfig?.aspectRatio).toBe("16:9");
  });

  it("extracts text response when present alongside image", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  { text: "Here is your meme" },
                  { inlineData: { mimeType: "image/png", data: "base64data" } },
                ],
                role: "model",
              },
            },
          ],
        }),
    });

    const result = await client.generateImage("test");
    expect(result.imageData).toBe("base64data");
    expect(result.textResponse).toBe("Here is your meme");
  });
});
