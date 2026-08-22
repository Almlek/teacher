import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ailessonexams.smartteacher",
  appName: "المعلم الذكي",
  webDir: "dist/public",
  bundledWebRuntime: false,
  server: {
    // The Android shell loads the published full-stack site so OAuth, AI, database,
    // cloud storage, and server-side exports continue to work without duplication.
    url: "https://smartplan-ppvujobi.manus.space",
    cleartext: false,
    allowNavigation: ["smartplan-ppvujobi.manus.space", "api.manus.im"],
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#242326",
  },
};

export default config;
