import { GEMINI_BASE_URL, GEMINI_MODEL_ID } from "../../utils/constants";
import {
  type GenerateContentResponse,
  type GeminiErrorResponse,
  type ReferenceImage,
  buildGenerateRequest,
  parseImageFromResponse,
} from "./geminiTypes";

export class GeminiAPIError extends Error {
  public readonly status: string;
  public readonly httpStatus: number;

  constructor(message: string, status: string, httpStatus: number) {
    super(message);
    this.name = "GeminiAPIError";
    this.status = status;
    this.httpStatus = httpStatus;
  }

  get isProhibitedContent(): boolean {
    return this.status === "PROHIBITED_CONTENT";
  }
}

export interface GenerateImageResult {
  imageData: string;
  mimeType: string;
  textResponse?: string;
}

export class GeminiClient {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  static buildApiUrl(apiKey: string): string {
    return `${GEMINI_BASE_URL}/${GEMINI_MODEL_ID}:generateContent?key=${apiKey}`;
  }

  async generateImage(
    prompt: string,
    resolution?: string,
    referenceImages?: ReferenceImage[],
    aspectRatio?: string,
  ): Promise<GenerateImageResult> {
    const url = GeminiClient.buildApiUrl(this.apiKey);
    const imageConfig =
      resolution || aspectRatio
        ? {
            ...(resolution && { imageSize: resolution }),
            ...(aspectRatio && { aspectRatio }),
          }
        : undefined;
    const request = buildGenerateRequest(
      prompt,
      {
        responseModalities: ["Text", "Image"],
        ...(imageConfig && { imageConfig }),
      },
      referenceImages,
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
    } catch (networkError) {
      clearTimeout(timeout);
      if (networkError instanceof DOMException && networkError.name === "AbortError") {
        throw new Error("Request timed out after 120 seconds");
      }
      throw new Error(
        `Network error: ${networkError instanceof Error ? networkError.message : "Failed to connect to Gemini API"}`,
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      let status = "UNKNOWN";
      try {
        const errorBody = (await response.json()) as GeminiErrorResponse;
        message = errorBody?.error?.message ?? message;
        status = errorBody?.error?.status ?? status;
      } catch {
        // Response body wasn't valid JSON
      }
      throw new GeminiAPIError(message, status, response.status);
    }

    const data = (await response.json()) as GenerateContentResponse;
    const image = parseImageFromResponse(data);

    if (!image) {
      const finishReason = data?.candidates?.[0]?.finishReason;
      if (finishReason === "OTHER" || finishReason === "SAFETY") {
        throw new Error(
          "Content filtered by API. Try rephrasing your prompt (avoid copyrighted characters).",
        );
      }
      throw new Error("No image data in response");
    }

    // Extract text response if present
    const parts = data?.candidates?.[0]?.content?.parts;
    const textResponse = parts
      ? parts
          .filter((p): p is { text: string } => "text" in p)
          .map((p) => p.text)
          .join("")
      : undefined;

    return {
      imageData: image.data,
      mimeType: image.mimeType,
      ...(textResponse && { textResponse }),
    };
  }
}
