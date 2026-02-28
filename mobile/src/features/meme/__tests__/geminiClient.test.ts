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
});
