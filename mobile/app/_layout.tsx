import { LogBox } from "react-native";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Image, Sparkles, GalleryHorizontalEnd, Settings } from "lucide-react-native";
import { colors } from "../src/utils/colors";

import "../global.css";

// Suppress non-critical dev warnings in the UI
LogBox.ignoreLogs([
  "Require cycle:",
  "ViewManagerPropertyUpdater",
  "StatusBarModule",
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brand.cyan,
          tabBarInactiveTintColor: colors.text.muted,
          tabBarStyle: {
            backgroundColor: colors.surface.secondary,
            borderTopColor: colors.surface.card,
            height: 85,
            paddingBottom: 20,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Generate",
            tabBarIcon: ({ color, size }) => (
              <Sparkles color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="result"
          options={{
            title: "Result",
            tabBarIcon: ({ color, size }) => (
              <Image color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="gallery"
          options={{
            title: "Gallery",
            tabBarIcon: ({ color, size }) => (
              <GalleryHorizontalEnd color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <Settings color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="edit-overlay"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </QueryClientProvider>
  );
}
