import React, { useState, useRef, useCallback } from "react";
import { View, TextInput, StyleSheet, Keyboard } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { MemeComposite } from "./textOverlayRenderer";
import { computeOverlayStyle } from "./overlayStyle";
import type { OverlayConfig } from "./geminiTypes";
import {
  clampOffset,
  clampFontScale,
  computeTextBoundingBox,
  isNearCorner,
  computeResizeScale,
} from "./overlayGestureUtils";
import { colors } from "../../utils/colors";

const HANDLE_SIZE = 16;
const HANDLE_HIT = 24;

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
  const [isSelected, setIsSelected] = useState(true);
  const startOffsetX = useRef(0);
  const startOffsetY = useRef(0);
  const startFontScale = useRef(1);
  const gestureMode = useRef<"drag" | "resize">("drag");

  const safeWidth = imageWidth > 0 ? imageWidth : 300;
  const safeHeight = imageHeight > 0 ? imageHeight : 300;
  const computed = computeOverlayStyle(overlayConfig, safeWidth, safeHeight, overlayText);
  const bbox = computeTextBoundingBox(computed, safeWidth);

  const savePanStart = useCallback(
    (absX: number, absY: number) => {
      try {
        // Detect if touch is near a corner handle
        if (isNearCorner(absX, absY, bbox, HANDLE_HIT)) {
          gestureMode.current = "resize";
          startFontScale.current = overlayConfig.fontScale;
        } else {
          gestureMode.current = "drag";
          startOffsetX.current = overlayConfig.offsetX;
          startOffsetY.current = overlayConfig.offsetY;
        }
        setIsSelected(true);
        onGestureActive?.(true);
      } catch {
        // Prevent crash from UI thread callback
      }
    },
    [overlayConfig.offsetX, overlayConfig.offsetY, overlayConfig.fontScale, onGestureActive, bbox],
  );

  const handlePanUpdate = useCallback(
    (translationX: number, translationY: number) => {
      try {
        if (gestureMode.current === "resize") {
          const newScale = computeResizeScale(startFontScale.current, translationX, translationY, safeWidth);
          onConfigChange({
            ...overlayConfig,
            fontScale: newScale,
          });
        } else {
          const newOffsetX = clampOffset(startOffsetX.current + translationX / safeWidth);
          const newOffsetY = clampOffset(startOffsetY.current + translationY / safeHeight);
          onConfigChange({
            ...overlayConfig,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
          });
        }
      } catch {
        // Prevent crash from UI thread callback
      }
    },
    [safeWidth, safeHeight, overlayConfig, onConfigChange],
  );

  const handlePanEnd = useCallback(() => {
    try {
      onGestureActive?.(false);
    } catch {
      // Prevent crash from UI thread callback
    }
  }, [onGestureActive]);

  const savePinchStart = useCallback(() => {
    try {
      startFontScale.current = overlayConfig.fontScale;
      onGestureActive?.(true);
    } catch {
      // Prevent crash
    }
  }, [overlayConfig.fontScale, onGestureActive]);

  const handlePinchUpdate = useCallback(
    (scale: number) => {
      try {
        const newScale = clampFontScale(startFontScale.current * scale);
        onConfigChange({
          ...overlayConfig,
          fontScale: newScale,
        });
      } catch {
        // Prevent crash
      }
    },
    [overlayConfig, onConfigChange],
  );

  const handlePinchEnd = useCallback(() => {
    try {
      onGestureActive?.(false);
    } catch {
      // Prevent crash
    }
  }, [onGestureActive]);

  const toggleEditing = useCallback(() => {
    try {
      setIsEditing((prev) => !prev);
      setIsSelected(true);
    } catch {
      // Prevent crash
    }
  }, []);

  const panGesture = Gesture.Pan()
    .onStart((e: { absoluteX: number; absoluteY: number }) => {
      runOnJS(savePanStart)(e.absoluteX, e.absoluteY);
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

  const showHandles = isSelected && !isEditing && overlayText.length > 0 && bbox.width > 0;

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

        {/* Selection border + corner handles */}
        {showHandles && (
          <View
            style={[
              styles.selectionBorder,
              {
                left: bbox.left - 4,
                top: bbox.top - 4,
                width: bbox.width + 8,
                height: bbox.height + 8,
              },
            ]}
            pointerEvents="none"
          >
            {/* Corner handles */}
            <View style={[styles.handle, styles.handleTopLeft]} />
            <View style={[styles.handle, styles.handleTopRight]} />
            <View style={[styles.handle, styles.handleBottomLeft]} />
            <View style={[styles.handle, styles.handleBottomRight]} />
          </View>
        )}

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
  selectionBorder: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: colors.brand.cyan,
    borderStyle: "dashed",
    borderRadius: 4,
  },
  handle: {
    position: "absolute",
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: colors.brand.cyan,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  handleTopLeft: {
    top: -HANDLE_SIZE / 2,
    left: -HANDLE_SIZE / 2,
  },
  handleTopRight: {
    top: -HANDLE_SIZE / 2,
    right: -HANDLE_SIZE / 2,
  },
  handleBottomLeft: {
    bottom: -HANDLE_SIZE / 2,
    left: -HANDLE_SIZE / 2,
  },
  handleBottomRight: {
    bottom: -HANDLE_SIZE / 2,
    right: -HANDLE_SIZE / 2,
  },
});
