import "dotenv/config";
import type { CapacitorConfig } from "@capacitor/cli";

const appUrl =
  process.env.CAPACITOR_SERVER_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://127.0.0.1:3000";

const config: CapacitorConfig = {
  appId: "com.myfarmstand.owner",
  appName: "Stallside",
  webDir: "mobile/www",
  server: {
    // Owner shell loads the hosted Next.js app (not a static export).
    // Prefer 127.0.0.1 over localhost for iOS Simulator reliability.
    url: `${appUrl.replace(/\/$/, "").replace("://localhost", "://127.0.0.1")}/login`,
    cleartext: true,
    allowNavigation: [
      "localhost",
      "127.0.0.1",
      "10.0.2.2",
      "*.stallside.app",
      "*.vercel.app",
      "*.stripe.com",
      "accounts.google.com",
    ],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#e8efe4",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#e8efe4",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "banner", "list"],
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "Stallside",
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#e8efe4",
  },
};

export default config;
