import type { OverlayPosition } from "./geminiTypes";

export interface OverlayStyleConfig {
  position: OverlayPosition;
  fontScale: number;
  offsetX: number;
  offsetY: number;
}

export interface ComputedOverlayStyle {
  fontSize: number;
  x: number;
  y: number;
  maxWidth: number;
  textAnchor: "middle" | "start" | "end";
}

/**
 * Pure function: computes overlay text positioning based on image dimensions.
 * Port of macOS TextOverlayRenderer.swift logic.
 */
export function computeOverlayStyle(
  config: OverlayStyleConfig,
  imageWidth: number,
  imageHeight: number,
): ComputedOverlayStyle {
  const baseFontSize = Math.max(imageWidth / 14, 24);
  const fontSize = baseFontSize * config.fontScale;
  const margin = imageHeight * 0.05;
  const maxWidth = imageWidth * 0.9;

  let x = imageWidth / 2;
  let y: number;

  switch (config.position) {
    case "top":
      y = margin + fontSize;
      break;
    case "center":
      y = imageHeight / 2;
      break;
    case "bottom":
    default:
      y = imageHeight - fontSize - margin;
      break;
  }

  // Apply normalized offsets
  x += config.offsetX * imageWidth;
  y += config.offsetY * imageHeight;

  return { fontSize, x, y, maxWidth, textAnchor: "middle" };
}
