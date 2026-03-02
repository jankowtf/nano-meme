import { useState, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import {
  Share2,
  Download,
  ArrowLeft,
  Heart,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  SlidersHorizontal,
} from "lucide-react-native";
import { InteractiveOverlay } from "../src/features/meme/InteractiveOverlay";
import { MemeComposite } from "../src/features/meme/textOverlayRenderer";
import { captureComposite } from "../src/hooks/useOverlayCapture";
import { useMemeStore } from "../src/stores/memeStore";
import type { OverlayPosition, OverlayConfig } from "../src/features/meme/geminiTypes";
import { colors } from "../src/utils/colors";

export default function ResultScreen() {
  const { currentImageUri, currentBaseImageUri, overlayText, overlayConfig, history, updateOverlay, setOverlayPosition, setOverlayFontScale } = useMemeStore();
  const activeItem = history.find((h) => h.imageUri === currentImageUri) ?? history[0];
  const compositeRef = useRef<View>(null);
  const [imageSize, setImageSize] = useState({ width: 320, height: 320 });
  const [showControls, setShowControls] = useState(false);

  if (!currentImageUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No meme generated yet.</Text>
          <Pressable
            style={styles.goBackButton}
            onPress={() => router.navigate("/")}
          >
            <Text style={styles.goBackText}>Generate one</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const canEdit = activeItem?.baseImageUri != null;
  const baseImageUri = currentBaseImageUri ?? currentImageUri!;

  const handleShare = async () => {
    try {
      const uri = await captureComposite(compositeRef);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch {
      Alert.alert("Error", "Failed to capture meme for sharing.");
    }
  };

  const handleSave = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow photo library access to save memes.");
      return;
    }
    try {
      const uri = await captureComposite(compositeRef);
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved", "Meme saved to your photo library.");
    } catch {
      Alert.alert("Error", "Failed to save meme to photo library.");
    }
  };

  const handleConfigChange = useCallback(
    (newConfig: OverlayConfig) => {
      if (activeItem) {
        updateOverlay(activeItem.id, overlayText, newConfig, activeItem.imageUri);
      }
    },
    [activeItem, overlayText, updateOverlay],
  );

  const handleTextChange = useCallback(
    (newText: string) => {
      if (activeItem) {
        updateOverlay(activeItem.id, newText, overlayConfig, activeItem.imageUri);
      }
    },
    [activeItem, overlayConfig, updateOverlay],
  );

  const handlePositionChange = (position: OverlayPosition) => {
    const newConfig = { ...overlayConfig, position, offsetX: 0, offsetY: 0 };
    if (activeItem) {
      updateOverlay(activeItem.id, overlayText, newConfig, activeItem.imageUri);
    } else {
      setOverlayPosition(position);
    }
  };

  const handleFontScaleChange = (scale: number) => {
    const newConfig = { ...overlayConfig, fontScale: scale };
    if (activeItem) {
      updateOverlay(activeItem.id, overlayText, newConfig, activeItem.imageUri);
    } else {
      setOverlayFontScale(scale);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.navigate("/")} hitSlop={12}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </Pressable>
          <Text style={styles.title}>Your Meme</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Image Preview with Interactive Overlay */}
        <View
          style={styles.imageContainer}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            if (width > 0 && height > 0) setImageSize({ width, height });
          }}
        >
          <View style={styles.glowOuter} />
          <View style={styles.glowInner} />
          {canEdit ? (
            <InteractiveOverlay
              baseImageUri={baseImageUri}
              overlayText={overlayText}
              overlayConfig={overlayConfig}
              imageWidth={imageSize.width}
              imageHeight={imageSize.height}
              onConfigChange={handleConfigChange}
              onTextChange={handleTextChange}
              compositeRef={compositeRef}
            />
          ) : (
            <MemeComposite
              ref={compositeRef}
              baseImageUri={baseImageUri}
              overlayText={overlayText}
              overlayConfig={overlayConfig}
              imageWidth={imageSize.width}
              imageHeight={imageSize.height}
              style={styles.image}
            />
          )}
        </View>

        {canEdit && (
          <Text style={styles.gestureHint}>
            Drag to move text, pinch to resize, double-tap to edit
          </Text>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={handleShare}>
            <Share2 color={colors.brand.cyan} size={22} />
            <Text style={styles.actionText}>Share</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleSave}>
            <Download color={colors.brand.teal} size={22} />
            <Text style={styles.actionText}>Save</Text>
          </Pressable>

          {canEdit && (
            <Pressable
              style={[styles.actionButton, showControls && styles.actionButtonActive]}
              onPress={() => setShowControls((prev) => !prev)}
            >
              <SlidersHorizontal color={showControls ? colors.brand.cyan : colors.brand.magenta} size={22} />
              <Text style={styles.actionText}>Controls</Text>
            </Pressable>
          )}

          {activeItem && (
            <Pressable
              style={styles.actionButton}
              onPress={() => useMemeStore.getState().toggleFavorite(activeItem.id)}
            >
              <Heart
                color={colors.brand.magenta}
                size={22}
                fill={activeItem.isFavorite ? colors.brand.magenta : "none"}
              />
              <Text style={styles.actionText}>Favorite</Text>
            </Pressable>
          )}
        </View>

        {/* Collapsible Controls */}
        {showControls && canEdit && (
          <View style={styles.controlsPanel}>
            {/* Position Presets */}
            <View style={styles.controlsRow}>
              {(["top", "center", "bottom"] as OverlayPosition[]).map((pos) => {
                const icons = {
                  top: AlignVerticalJustifyStart,
                  center: AlignVerticalJustifyCenter,
                  bottom: AlignVerticalJustifyEnd,
                };
                const Icon = icons[pos];
                const isActive = overlayConfig.position === pos;
                return (
                  <Pressable
                    key={pos}
                    style={[styles.positionButton, isActive && styles.positionButtonActive]}
                    onPress={() => handlePositionChange(pos)}
                  >
                    <Icon color={isActive ? colors.brand.cyan : colors.text.muted} size={16} />
                    <Text style={[styles.positionText, isActive && styles.positionTextActive]}>
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Font Scale */}
            <View style={styles.fontScaleRow}>
              <Text style={styles.fontScaleLabel}>Size</Text>
              <View style={styles.fontScaleButtons}>
                {[0.7, 1.0, 1.3, 1.7].map((scale) => {
                  const isActive = Math.abs(overlayConfig.fontScale - scale) < 0.05;
                  return (
                    <Pressable
                      key={scale}
                      style={[styles.scaleButton, isActive && styles.scaleButtonActive]}
                      onPress={() => handleFontScaleChange(scale)}
                    >
                      <Text
                        style={[
                          styles.scaleText,
                          isActive && styles.scaleTextActive,
                          { fontSize: 10 + scale * 4 },
                        ]}
                      >
                        A
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Generate Another */}
        <Pressable
          style={styles.generateAnotherButton}
          onPress={() => router.navigate("/")}
        >
          <Text style={styles.generateAnotherText}>Generate Another</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 8,
    minHeight: 280,
  },
  glowOuter: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 18,
    shadowColor: colors.brand.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
  },
  glowInner: {
    position: "absolute",
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.3)",
  },
  image: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.surface.card,
  },
  gestureHint: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  actionButton: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surface.card,
  },
  actionButtonActive: {
    borderWidth: 1,
    borderColor: colors.brand.cyan,
    backgroundColor: "rgba(6,182,212,0.1)",
  },
  actionText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  controlsPanel: {
    marginBottom: 16,
    gap: 12,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 8,
  },
  positionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: "transparent",
  },
  positionButtonActive: {
    borderColor: colors.brand.cyan,
    backgroundColor: "rgba(6,182,212,0.1)",
  },
  positionText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: colors.text.muted,
  },
  positionTextActive: {
    color: colors.brand.cyan,
  },
  fontScaleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fontScaleLabel: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: "500" as const,
  },
  fontScaleButtons: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },
  scaleButton: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: "transparent",
  },
  scaleButtonActive: {
    borderColor: colors.brand.cyan,
    backgroundColor: "rgba(6,182,212,0.1)",
  },
  scaleText: {
    fontWeight: "700" as const,
    color: colors.text.muted,
  },
  scaleTextActive: {
    color: colors.brand.cyan,
  },
  generateAnotherButton: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.3)",
  },
  generateAnotherText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.brand.cyan,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.muted,
  },
  goBackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.brand.cyan,
  },
  goBackText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface.primary,
  },
});
