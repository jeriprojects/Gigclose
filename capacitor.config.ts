import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gigsclose.app",
  appName: "GigsClose",
  webDir: "dist",
  bundledWebRuntime: false,
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#F8FAFC",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      smallIcon: "ic_launcher_foreground",
      iconColor: "#0EA5E9",
    },
  },
};

export default config;
