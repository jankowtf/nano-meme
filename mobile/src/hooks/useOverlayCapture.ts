import type { RefObject } from "react";
import type { View } from "react-native";
import { captureRef } from "react-native-view-shot";

/**
 * Captures a View ref to a local file URI.
 * Used to render MemeComposite (base image + SVG text) into a shareable PNG.
 */
export async function captureComposite(
  viewRef: RefObject<View | null>,
): Promise<string> {
  if (!viewRef.current) {
    throw new Error("View ref is not attached");
  }

  const uri = await captureRef(viewRef, {
    format: "png",
    quality: 1,
    result: "tmpfile",
  });

  return uri;
}
