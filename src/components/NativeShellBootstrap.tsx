"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export default function NativeShellBootstrap() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    if (window.location.pathname.startsWith("/admin")) {
      window.location.replace("/dashboard");
      return;
    }

    let disposed = false;
    let removeListener: (() => void) | undefined;

    void (async () => {
      const [{ StatusBar, Style }, { SplashScreen }, { App }] = await Promise.all([
        import("@capacitor/status-bar"),
        import("@capacitor/splash-screen"),
        import("@capacitor/app"),
      ]);

      if (disposed) return;

      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#17361f" });
      } catch {
        // unsupported on some devices
      }

      try {
        await SplashScreen.hide();
      } catch {
        // ignore
      }

      const handle = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else void App.exitApp();
      });
      removeListener = () => {
        void handle.remove();
      };
    })();

    return () => {
      disposed = true;
      removeListener?.();
    };
  }, []);

  return null;
}
