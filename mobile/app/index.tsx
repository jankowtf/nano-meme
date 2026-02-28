import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Sparkles, Wand2, Type, Maximize } from "lucide-react-native";
import { useMemeStore } from "../src/stores/memeStore";
import { useSettingsStore } from "../src/stores/settingsStore";
import { getApiKey } from "../src/hooks/useSecureStorage";
import { generateAndSaveMeme } from "../src/features/meme/memeService";
import { colors } from "../src/utils/colors";
import {
  DEFAULT_YODA_PROMPT,
  DEFAULT_OVERLAY_TEXT,
  RESOLUTIONS,
  type Resolution,
} from "../src/utils/constants";

export default function HomeScreen() {
  const {
    currentPrompt,
    overlayText,
    isGenerating,
    lastError,
    setPrompt,
    setOverlayText,
    startGeneration,
    completeGeneration,
    failGeneration,
  } = useMemeStore();

  const { defaultResolution } = useSettingsStore();
  const [selectedResolution, setSelectedResolution] =
    useState<Resolution>(defaultResolution);

  const handleGenerate = useCallback(async () => {
    const apiKey = await getApiKey();
    if (!apiKey) {
      failGeneration("No API key configured. Go to Settings to add one.");
      router.navigate("/settings");
      return;
    }

    startGeneration();
    try {
      const result = await generateAndSaveMeme(
        apiKey,
        currentPrompt || DEFAULT_YODA_PROMPT,
        overlayText || DEFAULT_OVERLAY_TEXT,
      );
      completeGeneration(result.imageUri);
      router.navigate("/result");
    } catch (error) {
      failGeneration(
        error instanceof Error ? error.message : "Generation failed",
      );
    }
  }, [currentPrompt, overlayText, startGeneration, completeGeneration, failGeneration]);

  const handleLoadYodaPreset = useCallback(() => {
    setPrompt(DEFAULT_YODA_PROMPT);
    setOverlayText(DEFAULT_OVERLAY_TEXT);
  }, [setPrompt, setOverlayText]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Sparkles color={colors.brand.cyan} size={28} />
          <Text style={styles.title}>NanoMeme</Text>
        </View>
        <Text style={styles.subtitle}>
          Generate memes with Nano Banana 2
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
          <Pressable style={styles.presetButton} onPress={handleLoadYodaPreset}>
            <Text style={styles.presetButtonText}>Load Yoda Preset</Text>
          </Pressable>
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
  presetButton: {
    marginTop: 8,
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
