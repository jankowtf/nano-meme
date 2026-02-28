import { File, Paths } from "expo-file-system";
import { GeminiClient } from "./geminiClient";

export interface MemeResult {
  imageUri: string;
  mimeType: string;
}

export async function generateAndSaveMeme(
  apiKey: string,
  prompt: string,
  overlayText: string,
  resolution?: string,
): Promise<MemeResult> {
  const client = new GeminiClient(apiKey);

  // Include overlay text in the prompt for AI-rendered text
  const fullPrompt = overlayText
    ? `${prompt}\n\nRender the following text prominently in the image using a bold, white font with black outline, positioned at the bottom: "${overlayText}"`
    : prompt;

  const result = await client.generateImage(fullPrompt, resolution);

  if (!result?.imageData) {
    throw new Error("API returned no image data");
  }

  // Save the base64 image to local filesystem using new File API
  if (!File || !Paths?.document) {
    throw new Error("expo-file-system File/Paths API not available");
  }

  const filename = `meme_${Date.now()}.png`;
  const file = new File(Paths.document, filename);

  // Decode base64 and write as bytes
  const binaryString = atob(result.imageData);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  file.write(bytes);

  return {
    imageUri: file.uri,
    mimeType: result.mimeType,
  };
}
