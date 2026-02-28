import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Settings as SettingsIcon,
  Key,
  Sliders,
  Info,
  Check,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { useSettingsStore } from "../src/stores/settingsStore";
import { getApiKey, setApiKey, deleteApiKey } from "../src/hooks/useSecureStorage";
import { colors } from "../src/utils/colors";
import {
  RESOLUTIONS,
  ASPECT_RATIOS,
  type Resolution,
  type AspectRatio,
  APP_NAME,
} from "../src/utils/constants";

export default function SettingsScreen() {
  const {
    defaultResolution,
    defaultAspectRatio,
    autoOverlayText,
    setDefaultResolution,
    setDefaultAspectRatio,
    setAutoOverlayText,
  } = useSettingsStore();

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    getApiKey().then((key) => {
      if (key) {
        setHasApiKey(true);
        setApiKeyInput(key);
      }
    });
  }, []);

  const handleSaveApiKey = useCallback(async () => {
    if (apiKeyInput.trim()) {
      await setApiKey(apiKeyInput.trim());
      setHasApiKey(true);
      Alert.alert("Saved", "API key saved to secure storage.");
    }
  }, [apiKeyInput]);

  const handleDeleteApiKey = useCallback(async () => {
    await deleteApiKey();
    setApiKeyInput("");
    setHasApiKey(false);
    Alert.alert("Removed", "API key removed from secure storage.");
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <SettingsIcon color={colors.brand.cyan} size={24} />
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* API Key Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Key color={colors.brand.teal} size={18} />
            <Text style={styles.sectionTitle}>API Key</Text>
            {hasApiKey && <Check color={colors.brand.success} size={16} />}
          </View>

          <View style={styles.apiKeyRow}>
            <TextInput
              style={styles.apiKeyInput}
              placeholder="Enter Gemini API key..."
              placeholderTextColor={colors.text.muted}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowKey(!showKey)}
              hitSlop={8}
            >
              {showKey ? (
                <EyeOff color={colors.text.muted} size={18} />
              ) : (
                <Eye color={colors.text.muted} size={18} />
              )}
            </Pressable>
          </View>

          <View style={styles.apiKeyActions}>
            <Pressable style={styles.saveButton} onPress={handleSaveApiKey}>
              <Text style={styles.saveButtonText}>Save to Keychain</Text>
            </Pressable>
            {hasApiKey && (
              <Pressable style={styles.deleteButton} onPress={handleDeleteApiKey}>
                <Text style={styles.deleteButtonText}>Remove</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Generation Defaults */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sliders color={colors.brand.magenta} size={18} />
            <Text style={styles.sectionTitle}>Generation</Text>
          </View>

          <Text style={styles.fieldLabel}>Default Resolution</Text>
          <View style={styles.optionRow}>
            {(Object.keys(RESOLUTIONS) as Resolution[]).map((res) => (
              <Pressable
                key={res}
                style={[
                  styles.optionButton,
                  defaultResolution === res && styles.optionButtonActive,
                ]}
                onPress={() => setDefaultResolution(res)}
              >
                <Text
                  style={[
                    styles.optionText,
                    defaultResolution === res && styles.optionTextActive,
                  ]}
                >
                  {res}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Default Aspect Ratio</Text>
          <View style={styles.optionRow}>
            {(Object.keys(ASPECT_RATIOS) as AspectRatio[]).map((ratio) => (
              <Pressable
                key={ratio}
                style={[
                  styles.optionButton,
                  defaultAspectRatio === ratio && styles.optionButtonActive,
                ]}
                onPress={() => setDefaultAspectRatio(ratio)}
              >
                <Text
                  style={[
                    styles.optionText,
                    defaultAspectRatio === ratio && styles.optionTextActive,
                  ]}
                >
                  {ratio}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Auto Overlay Text</Text>
            <Switch
              value={autoOverlayText}
              onValueChange={setAutoOverlayText}
              trackColor={{
                false: colors.surface.card,
                true: "rgba(6,182,212,0.4)",
              }}
              thumbColor={autoOverlayText ? colors.brand.cyan : colors.text.muted}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info color={colors.text.secondary} size={18} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App</Text>
            <Text style={styles.aboutValue}>{APP_NAME}</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>0.1.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Model</Text>
            <Text style={styles.aboutValue}>Nano Banana 2</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>By</Text>
            <Text style={styles.aboutValue}>KaosMaps</Text>
          </View>
        </View>
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
    gap: 10,
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  apiKeyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  apiKeyInput: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.15)",
  },
  eyeButton: {
    padding: 10,
  },
  apiKeyActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.brand.cyan,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.surface.primary,
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.15)",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionButtonActive: {
    borderColor: colors.brand.cyan,
    backgroundColor: "rgba(6,182,212,0.1)",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.muted,
  },
  optionTextActive: {
    color: colors.brand.cyan,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    padding: 14,
  },
  switchLabel: {
    fontSize: 15,
    color: colors.text.primary,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(6,182,212,0.05)",
  },
  aboutLabel: {
    fontSize: 14,
    color: colors.text.muted,
  },
  aboutValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: "500",
  },
});
