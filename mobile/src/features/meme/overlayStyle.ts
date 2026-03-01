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
  lines: string[];
  lineHeight: number;
}

/**
 * Split text into lines that fit within maxWidth.
 * Approximates character width as fontSize * 0.6 (Impact is condensed).
 * Does not break mid-word — a single word wider than maxWidth stays on its own line.
 */
export function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  if (!text) return [];

  const charWidth = fontSize * 0.6;
  const charsPerLine = Math.max(1, Math.floor(maxWidth / charWidth));
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= charsPerLine) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

/**
 * Pure function: computes overlay text positioning based on image dimensions.
 * Port of macOS TextOverlayRenderer.swift logic.
 * When text is provided, wraps it into lines and adjusts y-position accordingly.
 */
export function computeOverlayStyle(
  config: OverlayStyleConfig,
  imageWidth: number,
  imageHeight: number,
  text?: string,
): ComputedOverlayStyle {
  const baseFontSize = Math.max(imageWidth / 14, 24);
  const fontSize = baseFontSize * config.fontScale;
  const margin = imageHeight * 0.05;
  const maxWidth = imageWidth * 0.9;
  const lineHeight = fontSize * 1.2;

  const lines = text ? wrapText(text.toUpperCase(), maxWidth, fontSize) : [];
  const totalTextHeight = Math.max(0, lines.length - 1) * lineHeight;

  let x = imageWidth / 2;
  let y: number;

  switch (config.position) {
    case "top":
      y = margin + fontSize;
      break;
    case "center":
      y = imageHeight / 2 - totalTextHeight / 2;
      break;
    case "bottom":
    default:
      y = imageHeight - fontSize - margin - totalTextHeight;
      break;
  }

  // Apply normalized offsets
  x += config.offsetX * imageWidth;
  y += config.offsetY * imageHeight;

  return { fontSize, x, y, maxWidth, textAnchor: "middle", lines, lineHeight };
}
