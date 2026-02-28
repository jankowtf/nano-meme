import { GEMINI_BASE_URL, GEMINI_MODEL_ID } from "../../utils/constants";
import {
  type GenerateContentResponse,
  type GeminiErrorResponse,
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

  async generateImage(prompt: string): Promise<GenerateImageResult> {
    const url = GeminiClient.buildApiUrl(this.apiKey);
    const request = buildGenerateRequest(prompt, {
      responseMimeType: "image/png",
      responseModalities: ["Text", "Image"],
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorBody = (await response.json()) as GeminiErrorResponse;
      throw new GeminiAPIError(
        errorBody.error.message,
        errorBody.error.status,
        response.status,
      );
    }

    const data = (await response.json()) as GenerateContentResponse;
    const image = parseImageFromResponse(data);

    if (!image) {
      throw new Error("No image data in response");
    }

    // Extract text response if present
    const textResponse = data.candidates[0]?.content.parts
      .filter((p): p is { text: string } => "text" in p)
      .map((p) => p.text)
      .join("");

    return {
      imageData: image.data,
      mimeType: image.mimeType,
      ...(textResponse && { textResponse }),
    };
  }
}
