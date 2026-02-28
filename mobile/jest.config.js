module.exports = {
  projects: [
    // Pure TypeScript tests (utils, stores, services)
    {
      displayName: "unit",
      testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts", "<rootDir>/app/__tests__/**/*.test.ts", "<rootDir>/__tests__/**/*.test.ts"],
      transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
    // React Native component tests
    {
      displayName: "components",
      preset: "jest-expo",
      testMatch: ["<rootDir>/src/**/__tests__/**/*.test.tsx", "<rootDir>/__tests__/**/*.test.tsx"],
      transformIgnorePatterns: [
        "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|react-native-svg|lucide-react-native|nativewind))",
      ],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
  ],
};
