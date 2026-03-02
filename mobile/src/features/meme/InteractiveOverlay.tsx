import React, { useState, useRef, useCallback } from "react";
import { View, TextInput, StyleSheet, Keyboard } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { MemeComposite } from "./textOverlayRenderer";
import { computeOverlayStyle } from "./overlayStyle";
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
  onGestureActive?: (active: boolean) => void;
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
  onGestureActive,
  compositeRef,
}: InteractiveOverlayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const startOffsetX = useRef(0);
  const startOffsetY = useRef(0);
  const startFontScale = useRef(1);

  const savePanStart = useCallback(() => {
    startOffsetX.current = overlayConfig.offsetX;
    startOffsetY.current = overlayConfig.offsetY;
    onGestureActive?.(true);
  }, [overlayConfig.offsetX, overlayConfig.offsetY, onGestureActive]);

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

  const handlePanEnd = useCallback(() => {
    onGestureActive?.(false);
  }, [onGestureActive]);

  const savePinchStart = useCallback(() => {
    startFontScale.current = overlayConfig.fontScale;
    onGestureActive?.(true);
  }, [overlayConfig.fontScale, onGestureActive]);

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

  const handlePinchEnd = useCallback(() => {
    onGestureActive?.(false);
  }, [onGestureActive]);

  const toggleEditing = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(savePanStart)();
    })
    .onUpdate((e: { translationX: number; translationY: number }) => {
      runOnJS(handlePanUpdate)(e.translationX, e.translationY);
    })
    .onEnd(() => {
      runOnJS(handlePanEnd)();
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      runOnJS(savePinchStart)();
    })
    .onUpdate((e: { scale: number }) => {
      runOnJS(handlePinchUpdate)(e.scale);
    })
    .onEnd(() => {
      runOnJS(handlePinchEnd)();
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(toggleEditing)();
    });

  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(panGesture, pinchGesture),
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    Keyboard.dismiss();
  }, []);

  const computed = computeOverlayStyle(overlayConfig, imageWidth, imageHeight, overlayText);

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
          <View
            style={[
              styles.editContainer,
              {
                top: Math.max(0, computed.y - computed.fontSize * 0.5),
                left: imageWidth * 0.05,
                width: imageWidth * 0.9,
              },
            ]}
          >
            <TextInput
              style={[
                styles.editInput,
                { fontSize: Math.max(12, computed.fontSize * 0.6) },
              ]}
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
  editContainer: {
    position: "absolute",
    minHeight: 48,
  },
  editInput: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.6)",
    color: "#ffffff",
    fontWeight: "bold",
    padding: 12,
    textAlign: "center",
    minHeight: 48,
  },
});
