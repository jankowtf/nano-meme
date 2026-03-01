import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Check, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from "lucide-react-native";
import type { OverlayPosition, OverlayConfig } from "../src/features/meme/geminiTypes";
import { MemeComposite } from "../src/features/meme/textOverlayRenderer";
import { captureComposite } from "../src/hooks/useOverlayCapture";
import { useMemeStore } from "../src/stores/memeStore";
import { colors } from "../src/utils/colors";

export default function EditOverlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { history, updateOverlay } = useMemeStore();

  const item = history.find((h) => h.id === id);
  const compositeRef = useRef<View>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const [editText, setEditText] = useState(item?.overlayText ?? "");
  const [editConfig, setEditConfig] = useState<OverlayConfig>(
    item?.overlayConfig ?? { position: "bottom", fontScale: 1.0, offsetX: 0, offsetY: 0 },
  );

  if (!item || !item.baseImageUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {!item ? "Meme not found." : "This meme cannot be edited (no base image available)."}
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleApply = useCallback(async () => {
    if (!compositeRef.current || !id) return;
    setIsCapturing(true);
    try {
      const newUri = await captureComposite(compositeRef);
      updateOverlay(id, editText, editConfig, newUri);
      router.back();
    } catch {
      setIsCapturing(false);
    }
  }, [id, editText, editConfig, updateOverlay]);

  const setPosition = (position: OverlayPosition) => {
    setEditConfig((prev) => ({ ...prev, position, offsetX: 0, offsetY: 0 }));
  };

  const setFontScale = (fontScale: number) => {
    setEditConfig((prev) => ({ ...prev, fontScale }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </Pressable>
          <Text style={styles.title}>Edit Text</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Live Preview */}
        <View style={styles.previewContainer}>
          <MemeComposite
            ref={compositeRef}
            baseImageUri={item.baseImageUri}
            overlayText={editText}
            overlayConfig={editConfig}
            imageWidth={320}
            imageHeight={320}
            style={styles.preview}
          />
        </View>

        {/* Text Input */}
        <TextInput
          style={styles.input}
          placeholder="Overlay text..."
          placeholderTextColor={colors.text.muted}
          value={editText}
          onChangeText={setEditText}
          multiline
        />

        {/* Position Presets */}
        <View style={styles.controlsRow}>
          {(["top", "center", "bottom"] as OverlayPosition[]).map((pos) => {
            const icons = {
              top: AlignVerticalJustifyStart,
              center: AlignVerticalJustifyCenter,
              bottom: AlignVerticalJustifyEnd,
            };
            const Icon = icons[pos];
            const isActive = editConfig.position === pos;
            return (
              <Pressable
                key={pos}
                style={[styles.positionButton, isActive && styles.positionButtonActive]}
                onPress={() => setPosition(pos)}
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
              const isActive = Math.abs(editConfig.fontScale - scale) < 0.05;
              return (
                <Pressable
                  key={scale}
                  style={[styles.scaleButton, isActive && styles.scaleButtonActive]}
                  onPress={() => setFontScale(scale)}
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

        {/* Apply Button */}
        <Pressable
          style={[styles.applyButton, isCapturing && { opacity: 0.6 }]}
          onPress={handleApply}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator color={colors.surface.primary} />
          ) : (
            <Check color={colors.surface.primary} size={20} />
          )}
          <Text style={styles.applyButtonText}>
            {isCapturing ? "Applying..." : "Apply Changes"}
          </Text>
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
  previewContainer: {
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  preview: {
    borderRadius: 16,
  },
  input: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.15)",
    marginBottom: 16,
    minHeight: 60,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
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
    marginBottom: 24,
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
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.brand.cyan,
    paddingVertical: 16,
    borderRadius: 14,
  },
  applyButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.surface.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.muted,
    textAlign: "center",
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.brand.cyan,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface.primary,
  },
});
