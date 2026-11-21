import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // TODO: podmień na docelowy bundle identifier przed publikacją w sklepach.
  appId: "app.impuls.mobile",
  appName: "Impuls",
  webDir: "dist",
  backgroundColor: "#0B1020",
  ios: { contentInset: "never" },
};

export default config;
