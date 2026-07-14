"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { registerOwnerPush } from "@/lib/register-owner-push";

export default function OwnerPushRegister() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    void registerOwnerPush();
  }, []);

  return null;
}
