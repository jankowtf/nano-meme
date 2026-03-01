const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;

export const AUTH_BASE_URL = isDev
  ? "http://localhost:3100"
  : "https://cortex.kaosmaps.com";

export const DEMO_EMAIL = "demo@kaosmaps.com";
