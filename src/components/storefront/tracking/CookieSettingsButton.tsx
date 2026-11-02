"use client";

import { openConsentSettings } from "@/lib/website/tracking/browser";

export default function CookieSettingsButton() {
  return (
    <button type="button" onClick={openConsentSettings} className="underline">
      Change cookie settings
    </button>
  );
}
