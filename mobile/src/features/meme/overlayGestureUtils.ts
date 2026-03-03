/**
 * Pure utility functions for interactive overlay gestures.
 * Extracted for testability — no React/RN imports.
 */

export function clampOffset(value: number): number {
  return Math.min(1.0, Math.max(-1.0, value));
}

export function clampFontScale(value: number): number {
  return Math.min(3.0, Math.max(0.3, value));
}

export function normalizeOffset(pixelDelta: number, dimension: number): number {
  if (dimension === 0) return 0;
  return clampOffset(pixelDelta / dimension);
}

export interface TextBoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Compute the pixel bounding box of overlay text from computeOverlayStyle output.
 * x/y from computeOverlayStyle is the anchor point (center-top of first line).
 */
export function computeTextBoundingBox(
  computed: { x: number; y: number; fontSize: number; lines: string[]; lineHeight: number; maxWidth: number },
  imageWidth: number,
): TextBoundingBox {
  if (computed.lines.length === 0 || imageWidth <= 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  const totalHeight = computed.fontSize + Math.max(0, computed.lines.length - 1) * computed.lineHeight;
  const textWidth = Math.min(computed.maxWidth, imageWidth * 0.9);

  // x is the center anchor, so left = x - textWidth/2
  const left = computed.x - textWidth / 2;
  // y is the top of first line baseline, shift up by ~20% of fontSize for ascent
  const top = computed.y - computed.fontSize * 0.2;

  return { left, top, width: textWidth, height: totalHeight };
}

/**
 * Check if a touch point is near any corner of the bounding box.
 * Returns true if within threshold pixels of any corner.
 */
export function isNearCorner(
  touchX: number,
  touchY: number,
  bbox: TextBoundingBox,
  threshold: number = 24,
): boolean {
  if (bbox.width === 0 || bbox.height === 0) return false;

  const corners = [
    { x: bbox.left, y: bbox.top },
    { x: bbox.left + bbox.width, y: bbox.top },
    { x: bbox.left, y: bbox.top + bbox.height },
    { x: bbox.left + bbox.width, y: bbox.top + bbox.height },
  ];

  return corners.some(
    (c) => Math.abs(touchX - c.x) <= threshold && Math.abs(touchY - c.y) <= threshold,
  );
}

/**
 * Compute new font scale from drag distance during a corner-resize gesture.
 * Diagonal drag away from center = scale up, toward center = scale down.
 */
export function computeResizeScale(
  startScale: number,
  translationX: number,
  translationY: number,
  imageWidth: number,
): number {
  if (imageWidth <= 0) return startScale;

  // Use diagonal distance normalized by image width
  const diagonal = Math.sqrt(translationX * translationX + translationY * translationY);
  const sign = translationX + translationY > 0 ? 1 : -1;
  const scaleDelta = (sign * diagonal) / imageWidth;

  return clampFontScale(startScale + scaleDelta);
}
