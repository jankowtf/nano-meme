import {
  type GenerateContentRequest,
  type GenerateContentResponse,
  type GeminiErrorResponse,
  type ReferenceImage,
  MAX_REFERENCE_IMAGES,
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

    it("includes reference images as inline data parts", () => {
      const images: ReferenceImage[] = [
        { id: "img-1", data: "base64data1", mimeType: "image/png" },
        { id: "img-2", data: "base64data2", mimeType: "image/jpeg" },
      ];
      const req = buildGenerateRequest("Combine these images", undefined, images);
      expect(req.contents[0].parts).toHaveLength(3);
      expect(req.contents[0].parts[0]).toEqual({ text: "Combine these images" });
      expect(req.contents[0].parts[1]).toEqual({
        inlineData: { mimeType: "image/png", data: "base64data1" },
      });
      expect(req.contents[0].parts[2]).toEqual({
        inlineData: { mimeType: "image/jpeg", data: "base64data2" },
      });
    });

    it("builds text-only when no reference images provided", () => {
      const req = buildGenerateRequest("A cat", undefined, []);
      expect(req.contents[0].parts).toHaveLength(1);
      expect(req.contents[0].parts[0]).toEqual({ text: "A cat" });
    });

    it("builds text-only when reference images is undefined", () => {
      const req = buildGenerateRequest("A cat", undefined, undefined);
      expect(req.contents[0].parts).toHaveLength(1);
    });

    it("includes aspectRatio in imageConfig when provided", () => {
      const req = buildGenerateRequest("A cat", {
        responseModalities: ["Text", "Image"],
        imageConfig: { imageSize: "1K", aspectRatio: "16:9" },
      });
      expect(req.generationConfig?.imageConfig?.aspectRatio).toBe("16:9");
      expect(req.generationConfig?.imageConfig?.imageSize).toBe("1K");
    });

    it("omits aspectRatio from imageConfig when not provided", () => {
      const req = buildGenerateRequest("A cat", {
        responseModalities: ["Text", "Image"],
        imageConfig: { imageSize: "1K" },
      });
      expect(req.generationConfig?.imageConfig?.imageSize).toBe("1K");
      expect(req.generationConfig?.imageConfig?.aspectRatio).toBeUndefined();
    });
  });

  describe("MAX_REFERENCE_IMAGES", () => {
    it("is 14", () => {
      expect(MAX_REFERENCE_IMAGES).toBe(14);
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
