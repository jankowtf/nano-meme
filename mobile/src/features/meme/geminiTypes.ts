// Gemini API request/response types

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
): GenerateContentRequest {
  return {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    ...(config && { generationConfig: config }),
  };
}

export function parseImageFromResponse(
  response: GenerateContentResponse,
): ImageResult | null {
  const candidate = response.candidates[0];
  if (!candidate) return null;

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
