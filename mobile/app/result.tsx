import { useState, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { Share2, Download, ArrowLeft, Heart, Type } from "lucide-react-native";
import { MemeComposite } from "../src/features/meme/textOverlayRenderer";
import { captureComposite } from "../src/hooks/useOverlayCapture";
import { useMemeStore } from "../src/stores/memeStore";
import { colors } from "../src/utils/colors";

export default function ResultScreen() {
  const { currentImageUri, currentBaseImageUri, overlayText, overlayConfig, history } = useMemeStore();
  const latestItem = history[0];
  const compositeRef = useRef<View>(null);
  const [imageSize, setImageSize] = useState({ width: 320, height: 320 });

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

  const handleEditText = () => {
    if (latestItem) {
      router.navigate(`/edit-overlay?id=${latestItem.id}`);
    }
  };

  const canEdit = latestItem?.baseImageUri != null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.navigate("/")} hitSlop={12}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </Pressable>
          <Text style={styles.title}>Your Meme</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Image Preview with Overlay */}
        <View
          style={styles.imageContainer}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            if (width > 0 && height > 0) setImageSize({ width, height });
          }}
        >
          <View style={styles.glowOuter} />
          <View style={styles.glowInner} />
          <MemeComposite
            ref={compositeRef}
            baseImageUri={currentBaseImageUri ?? currentImageUri!}
            overlayText={overlayText}
            overlayConfig={overlayConfig}
            imageWidth={imageSize.width}
            imageHeight={imageSize.height}
            style={styles.image}
          />
        </View>

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
            <Pressable style={styles.actionButton} onPress={handleEditText}>
              <Type color={colors.brand.magenta} size={22} />
              <Text style={styles.actionText}>Edit Text</Text>
            </Pressable>
          )}

          {latestItem && (
            <Pressable
              style={styles.actionButton}
              onPress={() => useMemeStore.getState().toggleFavorite(latestItem.id)}
            >
              <Heart
                color={colors.brand.magenta}
                size={22}
                fill={latestItem.isFavorite ? colors.brand.magenta : "none"}
              />
              <Text style={styles.actionText}>Favorite</Text>
            </Pressable>
          )}
        </View>

        {/* Generate Another */}
        <Pressable
          style={styles.generateAnotherButton}
          onPress={() => router.navigate("/")}
        >
          <Text style={styles.generateAnotherText}>Generate Another</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  content: {
    flex: 1,
    padding: 20,
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
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 16,
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
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 20,
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
  actionText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "500",
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
