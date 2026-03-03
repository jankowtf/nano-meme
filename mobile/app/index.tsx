import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Sparkles, Wand2, Type, Maximize, ImagePlus, X, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Combine, ChevronDown } from "lucide-react-native";
import type { OverlayPosition } from "../src/features/meme/geminiTypes";
import { useMemeStore } from "../src/stores/memeStore";
import { useSettingsStore } from "../src/stores/settingsStore";
import { getEffectiveApiKey } from "../src/hooks/useSecureStorage";
import { generateAndSaveMeme } from "../src/features/meme/memeService";
import { colors } from "../src/utils/colors";
import { MAX_REFERENCE_IMAGES } from "../src/features/meme/geminiTypes";
import {
  DEFAULT_YODA_PROMPT,
  DEFAULT_OVERLAY_TEXT,
  MASHUP_PRESET_PROMPT,
  MASHUP_OVERLAY_TEXT,
  RESOLUTIONS,
  type Resolution,
} from "../src/utils/constants";
import { MASHUP_IMAGES } from "../src/fixtures/mashupImages";

export default function HomeScreen() {
  const {
    currentPrompt,
    overlayText,
    isGenerating,
    lastError,
    referenceImages,
    overlayConfig,
    setPrompt,
    setOverlayText,
    setOverlayPosition,
    setOverlayFontScale,
    addImage,
    removeImage,
    clearImages,
    startGeneration,
    completeGeneration,
    failGeneration,
  } = useMemeStore();

  const { defaultResolution, defaultAspectRatio } = useSettingsStore();
  const [selectedResolution, setSelectedResolution] =
    useState<Resolution>(defaultResolution);
  const [showRefImages, setShowRefImages] = useState(false);

  useEffect(() => {
    setShowRefImages(referenceImages.length > 0);
  }, [referenceImages.length]);

  const handleGenerate = useCallback(async () => {
    const apiKey = await getEffectiveApiKey();
    if (!apiKey) {
      failGeneration("No API key configured. Go to Settings to add one or sign in with Cortex.");
      router.navigate("/settings");
      return;
    }

    startGeneration();
    try {
      const result = await generateAndSaveMeme(
        apiKey,
        currentPrompt || DEFAULT_YODA_PROMPT,
        selectedResolution,
        referenceImages.length > 0 ? referenceImages : undefined,
        defaultAspectRatio,
      );
      // baseImageUri = clean API image, imageUri = same for now (overlay rendered in result/edit)
      completeGeneration(result.baseImageUri, result.imageUri);
      router.navigate("/result");
    } catch (error) {
      failGeneration(
        error instanceof Error ? error.message : "Generation failed",
      );
    }
  }, [currentPrompt, overlayText, referenceImages, overlayConfig, selectedResolution, defaultAspectRatio, startGeneration, completeGeneration, failGeneration]);

  const handleAttachImage = useCallback(async () => {
    if (referenceImages.length >= MAX_REFERENCE_IMAGES) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        base64: true,
        exif: false,
        allowsMultipleSelection: true,
        selectionLimit: MAX_REFERENCE_IMAGES - referenceImages.length,
      });

      if (result.canceled || !result.assets) return;

      for (const asset of result.assets) {
        if (referenceImages.length >= MAX_REFERENCE_IMAGES) break;
        if (!asset.base64) continue;
        const mimeType = asset.mimeType ?? "image/jpeg";
        addImage(asset.base64, mimeType);
      }
    } catch {
      failGeneration("Failed to attach image from library.");
    }
  }, [referenceImages, addImage, failGeneration]);

  const handleLoadYodaPreset = useCallback(() => {
    setPrompt(DEFAULT_YODA_PROMPT);
    setOverlayText(DEFAULT_OVERLAY_TEXT);
  }, [setPrompt, setOverlayText]);

  const handleLoadMashupPreset = useCallback(() => {
    setPrompt(MASHUP_PRESET_PROMPT);
    setOverlayText(MASHUP_OVERLAY_TEXT);
    clearImages();
    for (const img of MASHUP_IMAGES) {
      addImage(img.data, img.mimeType);
    }
  }, [setPrompt, setOverlayText, clearImages, addImage]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../assets/icon.png")}
            style={styles.logoImage}
          />
          <Text style={styles.title}>KaosMeme</Text>
        </View>
        <Text style={styles.subtitle}>
          Generate memes with Kaos Banana 2
        </Text>

        {/* Prompt Input */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wand2 color={colors.brand.teal} size={18} />
            <Text style={styles.sectionTitle}>Prompt</Text>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the image you want to generate..."
            placeholderTextColor={colors.text.muted}
            value={currentPrompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View style={styles.presetRow}>
            <Pressable style={styles.presetButton} onPress={handleLoadYodaPreset}>
              <Text style={styles.presetButtonText}>Load Yoda Preset</Text>
            </Pressable>
            <Pressable style={styles.presetButton} onPress={handleLoadMashupPreset}>
              <Combine color={colors.brand.cyan} size={14} />
              <Text style={styles.presetButtonText}>Load Mashup Preset</Text>
            </Pressable>
          </View>
        </View>

        {/* Reference Images (collapsible, right after prompt) */}
        <View style={styles.section}>
          <Pressable
            style={styles.sectionHeaderPressable}
            onPress={() => setShowRefImages((prev) => !prev)}
          >
            <ImagePlus color={colors.brand.active} size={18} />
            <Text style={[styles.sectionTitle, { flex: 1 }]}>
              Reference Images ({referenceImages.length}/{MAX_REFERENCE_IMAGES})
            </Text>
            <ChevronDown
              color={colors.text.muted}
              size={16}
              style={{ transform: [{ rotate: showRefImages ? "180deg" : "0deg" }] }}
            />
          </Pressable>

          {showRefImages && (
            <>
              {referenceImages.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.thumbnailStrip}
                  contentContainerStyle={styles.thumbnailStripContent}
                >
                  {referenceImages.map((img) => (
                    <View key={img.id} style={styles.thumbnailContainer}>
                      <Image
                        source={{ uri: `data:${img.mimeType};base64,${img.data}` }}
                        style={styles.thumbnail}
                      />
                      <View style={styles.thumbnailBadge}>
                        <Text style={styles.thumbnailBadgeText}>@{img.id}</Text>
                      </View>
                      <Pressable
                        style={styles.thumbnailRemove}
                        onPress={() => removeImage(img.id)}
                      >
                        <X color="#fff" size={12} />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              )}

              <Pressable
                style={[
                  styles.presetButton,
                  referenceImages.length >= MAX_REFERENCE_IMAGES && { opacity: 0.4 },
                ]}
                onPress={handleAttachImage}
                disabled={referenceImages.length >= MAX_REFERENCE_IMAGES}
              >
                <Text style={styles.presetButtonText}>Attach Images</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Overlay Text */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Type color={colors.brand.magenta} size={18} />
            <Text style={styles.sectionTitle}>Overlay Text</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Text to render on the meme..."
            placeholderTextColor={colors.text.muted}
            value={overlayText}
            onChangeText={setOverlayText}
          />

          {/* Position Presets */}
          <View style={styles.overlayControlsRow}>
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
                  style={[
                    styles.positionButton,
                    isActive && styles.positionButtonActive,
                  ]}
                  onPress={() => setOverlayPosition(pos)}
                >
                  <Icon
                    color={isActive ? colors.brand.cyan : colors.text.muted}
                    size={16}
                  />
                  <Text
                    style={[
                      styles.positionButtonText,
                      isActive && styles.positionButtonTextActive,
                    ]}
                  >
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
                    style={[
                      styles.fontScaleButton,
                      isActive && styles.fontScaleButtonActive,
                    ]}
                    onPress={() => setOverlayFontScale(scale)}
                  >
                    <Text
                      style={[
                        styles.fontScaleText,
                        isActive && styles.fontScaleTextActive,
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

        {/* Resolution Picker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Maximize color={colors.brand.active} size={18} />
            <Text style={styles.sectionTitle}>Resolution</Text>
          </View>
          <View style={styles.resolutionRow}>
            {(Object.keys(RESOLUTIONS) as Resolution[]).map((res) => (
              <Pressable
                key={res}
                style={[
                  styles.resolutionButton,
                  selectedResolution === res && styles.resolutionButtonActive,
                ]}
                onPress={() => setSelectedResolution(res)}
              >
                <Text
                  style={[
                    styles.resolutionText,
                    selectedResolution === res && styles.resolutionTextActive,
                  ]}
                >
                  {res}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Error */}
        {lastError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{lastError}</Text>
          </View>
        )}

        {/* Generate Button */}
        <Pressable
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.surface.primary} />
          ) : (
            <Sparkles color={colors.surface.primary} size={20} />
          )}
          <Text style={styles.generateButtonText}>
            {isGenerating ? "Generating..." : "Generate Meme"}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionHeaderPressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  textArea: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text.primary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.15)",
  },
  input: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.15)",
  },
  overlayControlsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
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
  positionButtonText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: colors.text.muted,
  },
  positionButtonTextActive: {
    color: colors.brand.cyan,
  },
  fontScaleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
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
  fontScaleButton: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: "transparent",
  },
  fontScaleButtonActive: {
    borderColor: colors.brand.cyan,
    backgroundColor: "rgba(6,182,212,0.1)",
  },
  fontScaleText: {
    fontWeight: "700" as const,
    color: colors.text.muted,
  },
  fontScaleTextActive: {
    color: colors.brand.cyan,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  presetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(6,182,212,0.1)",
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.2)",
  },
  presetButtonText: {
    fontSize: 13,
    color: colors.brand.cyan,
    fontWeight: "500",
  },
  thumbnailStrip: {
    marginBottom: 10,
  },
  thumbnailStripContent: {
    gap: 10,
  },
  thumbnailContainer: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: "hidden" as const,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  thumbnailBadge: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 2,
    alignItems: "center" as const,
  },
  thumbnailBadgeText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: colors.brand.cyan,
  },
  thumbnailRemove: {
    position: "absolute" as const,
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.8)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  resolutionRow: {
    flexDirection: "row",
    gap: 10,
  },
  resolutionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface.card,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  resolutionButtonActive: {
    borderColor: colors.brand.cyan,
    backgroundColor: "rgba(6,182,212,0.1)",
  },
  resolutionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.muted,
  },
  resolutionTextActive: {
    color: colors.brand.cyan,
  },
  errorCard: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.brand.cyan,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: colors.brand.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.surface.primary,
  },
});
