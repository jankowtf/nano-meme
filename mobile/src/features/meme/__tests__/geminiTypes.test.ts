import {
  type GenerateContentRequest,
  type GenerateContentResponse,
  type GeminiErrorResponse,
  buildGenerateRequest,
  parseImageFromResponse,
} from "../geminiTypes";

describe("geminiTypes", () => {
  describe("buildGenerateRequest", () => {
    it("builds a text-only request", () => {
      const req = buildGenerateRequest("A cat sitting on a couch");
      expect(req.contents).toHaveLength(1);
      expect(req.contents[0].parts).toHaveLength(1);
      expect(req.contents[0].parts[0]).toEqual({ text: "A cat sitting on a couch" });
    });

    it("includes generation config with image response", () => {
      const req = buildGenerateRequest("A cat", { responseMimeType: "image/png" });
      expect(req.generationConfig?.responseMimeType).toBe("image/png");
    });
  });

  describe("parseImageFromResponse", () => {
    it("extracts base64 image data from response", () => {
      const response: GenerateContentResponse = {
        candidates: [
          {
            content: {
              parts: [
                { inlineData: { mimeType: "image/png", data: "abc123base64" } },
              ],
              role: "model",
            },
          },
        ],
      };
      const result = parseImageFromResponse(response);
      expect(result).toEqual({
        mimeType: "image/png",
        data: "abc123base64",
      });
    });

    it("returns null for text-only response", () => {
      const response: GenerateContentResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "Here is your image description" }],
              role: "model",
            },
          },
        ],
      };
      expect(parseImageFromResponse(response)).toBeNull();
    });

    it("returns null for empty candidates", () => {
      const response: GenerateContentResponse = { candidates: [] };
      expect(parseImageFromResponse(response)).toBeNull();
    });

    it("extracts text from response", () => {
      const response: GenerateContentResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "Description of image" }],
              role: "model",
            },
          },
        ],
      };
      const text = response.candidates[0]?.content.parts
        .filter((p): p is { text: string } => "text" in p)
        .map((p) => p.text)
        .join("");
      expect(text).toBe("Description of image");
    });
  });
});
