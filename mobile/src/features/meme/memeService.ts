import { File, Paths } from "expo-file-system";
import { GeminiClient } from "./geminiClient";
import type { ReferenceImage } from "./geminiTypes";

export interface MemeResult {
  imageUri: string;
  baseImageUri: string;
  mimeType: string;
}

export async function generateAndSaveMeme(
  apiKey: string,
  prompt: string,
  resolution?: string,
  referenceImages?: ReferenceImage[],
  aspectRatio?: string,
): Promise<MemeResult> {
  const client = new GeminiClient(apiKey);

  const result = await client.generateImage(prompt, resolution, referenceImages, aspectRatio);

  if (!result?.imageData) {
    throw new Error("API returned no image data");
  }

  // Save the base64 image to local filesystem (expo-file-system v55 API)
  const filename = `meme_${Date.now()}.png`;
  const file = new File(Paths.document, filename);
  try {
    file.write(result.imageData, { encoding: "base64" });
  } catch (writeError) {
    throw new Error(
      `Failed to save image: ${writeError instanceof Error ? writeError.message : "Storage write failed"}`,
    );
  }

  return {
    imageUri: file.uri,
    baseImageUri: file.uri,
    mimeType: result.mimeType,
  };
}
