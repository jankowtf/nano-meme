/**
 * Pure utility functions for interactive overlay gestures.
 * Extracted for testability — no React/RN imports.
 */

export function clampOffset(value: number): number {
  return Math.min(0.5, Math.max(-0.5, value));
}

export function clampFontScale(value: number): number {
  return Math.min(3.0, Math.max(0.3, value));
}

export function normalizeOffset(pixelDelta: number, dimension: number): number {
  if (dimension === 0) return 0;
  return clampOffset(pixelDelta / dimension);
}
