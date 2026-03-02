import React, { useState, useRef, useCallback } from "react";
import { View, TextInput, StyleSheet, Keyboard } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MemeComposite } from "./textOverlayRenderer";
import type { OverlayConfig } from "./geminiTypes";
import { clampOffset, clampFontScale } from "./overlayGestureUtils";

export interface InteractiveOverlayProps {
  baseImageUri: string;
  overlayText: string;
  overlayConfig: OverlayConfig;
  imageWidth: number;
  imageHeight: number;
  onConfigChange: (config: OverlayConfig) => void;
  onTextChange: (text: string) => void;
  compositeRef: React.RefObject<View | null>;
}

export function InteractiveOverlay({
  baseImageUri,
  overlayText,
  overlayConfig,
  imageWidth,
  imageHeight,
  onConfigChange,
  onTextChange,
  compositeRef,
}: InteractiveOverlayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const startOffsetX = useRef(0);
  const startOffsetY = useRef(0);
  const startFontScale = useRef(1);

  const handlePanUpdate = useCallback(
    (translationX: number, translationY: number) => {
      const newOffsetX = clampOffset(startOffsetX.current + translationX / imageWidth);
      const newOffsetY = clampOffset(startOffsetY.current + translationY / imageHeight);
      onConfigChange({
        ...overlayConfig,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      });
    },
    [imageWidth, imageHeight, overlayConfig, onConfigChange],
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startOffsetX.current = overlayConfig.offsetX;
      startOffsetY.current = overlayConfig.offsetY;
    })
    .onUpdate((e: { translationX: number; translationY: number }) => {
      handlePanUpdate(e.translationX, e.translationY);
    });

  const handlePinchUpdate = useCallback(
    (scale: number) => {
      const newScale = clampFontScale(startFontScale.current * scale);
      onConfigChange({
        ...overlayConfig,
        fontScale: newScale,
      });
    },
    [overlayConfig, onConfigChange],
  );

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startFontScale.current = overlayConfig.fontScale;
    })
    .onUpdate((e: { scale: number }) => {
      handlePinchUpdate(e.scale);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      setIsEditing((prev) => !prev);
    });

  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(panGesture, pinchGesture),
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    Keyboard.dismiss();
  }, []);

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={{ width: imageWidth, height: imageHeight }}>
        <MemeComposite
          ref={compositeRef}
          baseImageUri={baseImageUri}
          overlayText={overlayText}
          overlayConfig={overlayConfig}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
        />
        {isEditing && (
          <View style={styles.editOverlay}>
            <TextInput
              style={styles.editInput}
              value={overlayText}
              onChangeText={onTextChange}
              multiline
              autoFocus
              onBlur={handleBlur}
              textAlignVertical="center"
              textAlign="center"
            />
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  editOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  editInput: {
    width: "85%",
    minHeight: 60,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.6)",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    textAlign: "center",
  },
});
