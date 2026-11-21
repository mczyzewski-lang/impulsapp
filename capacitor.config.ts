import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Odwrócona domena impuls.app. Po pierwszej publikacji w sklepach nie da się go zmienić.
  appId: "app.impuls.mobile",
  appName: "Impuls",
  webDir: "dist",
  backgroundColor: "#0B1020",
  ios: { contentInset: "never" },
  android: { allowMixedContent: false },
};

export default config;
