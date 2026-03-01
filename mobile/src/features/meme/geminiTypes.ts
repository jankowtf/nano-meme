// Gemini API request/response types

export const MAX_REFERENCE_IMAGES = 14;

export interface ReferenceImage {
  id: string; // "img-1", "img-2", etc.
  data: string; // base64 encoded
  mimeType: string;
}

export type OverlayPosition = "top" | "center" | "bottom";

export interface OverlayConfig {
  position: OverlayPosition;
  fontScale: number; // 0.5 - 2.0 multiplier
  offsetX: number;   // normalized -1.0 to 1.0
  offsetY: number;   // normalized -1.0 to 1.0
}

export const DEFAULT_OVERLAY_CONFIG: OverlayConfig = {
  position: "bottom",
  fontScale: 1.0,
  offsetX: 0,
  offsetY: 0,
};

export interface TextPart {
  text: string;
}

export interface InlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export type Part = TextPart | InlineDataPart;

export interface Content {
  parts: Part[];
  role?: string;
}

export interface ImageConfig {
  imageSize?: string;
  aspectRatio?: string;
}

export interface GenerationConfig {
  responseMimeType?: string;
  responseModalities?: string[];
  imageConfig?: ImageConfig;
}

export interface GenerateContentRequest {
  contents: Content[];
  generationConfig?: GenerationConfig;
}

export interface Candidate {
  content: Content;
  finishReason?: string;
}

export interface GenerateContentResponse {
  candidates: Candidate[];
}

export interface GeminiErrorResponse {
  error: {
    message: string;
    status: string;
    code?: number;
  };
}

export interface ImageResult {
  mimeType: string;
  data: string;
}

export function buildGenerateRequest(
  prompt: string,
  config?: GenerationConfig,
  referenceImages?: ReferenceImage[],
): GenerateContentRequest {
  const parts: Part[] = [{ text: prompt }];

  if (referenceImages?.length) {
    for (const img of referenceImages) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data,
        },
      });
    }
  }

  return {
    contents: [{ parts }],
    ...(config && { generationConfig: config }),
  };
}

export function parseImageFromResponse(
  response: GenerateContentResponse,
): ImageResult | null {
  if (!response?.candidates || response.candidates.length === 0) return null;

  const candidate = response.candidates[0];
  if (!candidate?.content?.parts) return null;

  for (const part of candidate.content.parts) {
    if ("inlineData" in part) {
      return {
        mimeType: part.inlineData.mimeType,
        data: part.inlineData.data,
      };
    }
  }

  return null;
}
