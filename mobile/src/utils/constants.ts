export const APP_NAME = "KaosMeme";
export const BUNDLE_ID = "com.kaosmaps.nanomeme";

export const GEMINI_MODEL_ID = "gemini-3.1-flash-image-preview";
export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export const RESOLUTIONS = {
  "0.5K": { label: "0.5K", description: "512px" },
  "1K": { label: "1K", description: "1024px" },
  "2K": { label: "2K", description: "2048px" },
  "4K": { label: "4K", description: "4096px" },
} as const;

export type Resolution = keyof typeof RESOLUTIONS;

export const ASPECT_RATIOS = {
  "1:1": { label: "1:1", description: "Square" },
  "16:9": { label: "16:9", description: "Landscape" },
  "9:16": { label: "9:16", description: "Portrait" },
  "4:3": { label: "4:3", description: "Standard" },
  "3:4": { label: "3:4", description: "Tall" },
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIOS;

export const DEFAULT_RESOLUTION: Resolution = "1K";
export const DEFAULT_ASPECT_RATIO: AspectRatio = "1:1";

export const DEFAULT_YODA_PROMPT =
  "A photorealistic portrait of a small, ancient green-skinned alien elder with large pointed ears, wise brown eyes, and sparse white hair, wearing a neon pink beanie hat and earthy brown robes. Holding a gnarled wooden cane. Sitting on a mossy stone in a mystical swamp forest with bioluminescent plants. Cinematic lighting, 85mm f/1.4 portrait lens.";

export const DEFAULT_OVERLAY_TEXT = "Make or make not. There is no buy.";

export const MASHUP_PRESET_PROMPT =
  "Combine both reference images into one cinematic meme: the cat from @img-1 is sitting at the desk from @img-2, paws on the laptop keyboard, typing with intense focus. A coffee mug and sticky notes are nearby. The cat has a serious professional expression. Photorealistic, office lighting, humorous composition.";

export const MASHUP_OVERLAY_TEXT = "DOING VERY IMPORTANT WORK";
