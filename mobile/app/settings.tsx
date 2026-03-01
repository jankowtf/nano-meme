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
  ActivityIndicator,
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
  LogIn,
  LogOut,
  Shield,
} from "lucide-react-native";
import { useSettingsStore } from "../src/stores/settingsStore";
import { useAuthStore } from "../src/stores/authStore";
import { getApiKey, setApiKey, deleteApiKey } from "../src/hooks/useSecureStorage";
import { colors } from "../src/utils/colors";
import {
  RESOLUTIONS,
  ASPECT_RATIOS,
  type Resolution,
  type AspectRatio,
  APP_NAME,
} from "../src/utils/constants";
import { DEMO_EMAIL } from "../src/utils/authConstants";

export default function SettingsScreen() {
  const {
    defaultResolution,
    defaultAspectRatio,
    autoOverlayText,
    setDefaultResolution,
    setDefaultAspectRatio,
    setAutoOverlayText,
  } = useSettingsStore();

  const { session, isAuthenticated, isLoading: authLoading, error: authError, login, logout } = useAuthStore();

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

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

  const handleLogin = useCallback(async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    await login(loginEmail.trim(), loginPassword.trim());
    if (useAuthStore.getState().isAuthenticated) {
      setLoginEmail("");
      setLoginPassword("");
    }
  }, [loginEmail, loginPassword, login]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleDemoLogin = useCallback(async () => {
    setLoginEmail(DEMO_EMAIL);
    setLoginPassword("Demo.nanomeme.42");
    await login(DEMO_EMAIL, "Demo.nanomeme.42");
    if (useAuthStore.getState().isAuthenticated) {
      setLoginEmail("");
      setLoginPassword("");
    }
  }, [login]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <SettingsIcon color={colors.brand.cyan} size={24} />
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Cortex Auth Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield color={colors.brand.active} size={18} />
            <Text style={styles.sectionTitle}>Cortex Account</Text>
            {isAuthenticated && <Check color={colors.brand.success} size={16} />}
          </View>

          {isAuthenticated ? (
            <View>
              <View style={styles.authInfoRow}>
                <Text style={styles.authInfoLabel}>Signed in as</Text>
                <Text style={styles.authInfoValue}>{session?.user.email}</Text>
              </View>
              <View style={styles.cortexBadge}>
                <Key color={colors.brand.teal} size={14} />
                <Text style={styles.cortexBadgeText}>API key managed by Cortex</Text>
              </View>
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <LogOut color="#ef4444" size={16} />
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <TextInput
                style={styles.authInput}
                placeholder="Email"
                placeholderTextColor={colors.text.muted}
                value={loginEmail}
                onChangeText={setLoginEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
              <TextInput
                style={[styles.authInput, { marginTop: 8 }]}
                placeholder="Password"
                placeholderTextColor={colors.text.muted}
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
              />
              {authError && (
                <Text style={styles.authError}>{authError}</Text>
              )}
              <View style={styles.authActions}>
                <Pressable
                  style={[styles.loginButton, authLoading && { opacity: 0.6 }]}
                  onPress={handleLogin}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <ActivityIndicator color={colors.surface.primary} size="small" />
                  ) : (
                    <LogIn color={colors.surface.primary} size={16} />
                  )}
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </Pressable>
                <Pressable
                  style={styles.demoButton}
                  onPress={handleDemoLogin}
                  disabled={authLoading}
                >
                  <Text style={styles.demoButtonText}>Demo</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* API Key Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Key color={colors.brand.teal} size={18} />
            <Text style={styles.sectionTitle}>API Key</Text>
            {hasApiKey && <Check color={colors.brand.success} size={16} />}
          </View>

          {isAuthenticated && (
            <Text style={styles.overrideHint}>
              You can override the Cortex-provided key with your own.
            </Text>
          )}

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
            <Text style={styles.aboutValue}>0.0.3</Text>
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
  // Auth styles
  authInput: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.15)",
  },
  authError: {
    fontSize: 13,
    color: "#ef4444",
    marginTop: 8,
  },
  authActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  loginButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.brand.cyan,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.surface.primary,
  },
  demoButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "rgba(6,182,212,0.1)",
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.2)",
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.brand.cyan,
  },
  authInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  authInfoLabel: {
    fontSize: 14,
    color: colors.text.muted,
  },
  authInfoValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: "500",
  },
  cortexBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(20,184,166,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 8,
  },
  cortexBadgeText: {
    fontSize: 13,
    color: colors.brand.teal,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.1)",
    marginTop: 4,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  overrideHint: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 10,
    fontStyle: "italic",
  },
  // API Key styles
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
  // Generation defaults
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
