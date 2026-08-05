"use client";

import { useLayoutEffect, useState } from "react";
import {
  AD_ATTR_COOKIE,
  mergeAttribution,
  normalizeAttribution,
  type AdAttribution,
} from "@/lib/ad-attribution";

function readCookie(): AdAttribution | null {
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${AD_ATTR_COOKIE}=([^;]*)`),
    );
    if (!match?.[1]) return null;
    return normalizeAttribution(JSON.parse(decodeURIComponent(match[1])));
  } catch {
    return null;
  }
}

function fromUrl(): AdAttribution | null {
  try {
    const q = new URLSearchParams(window.location.search);
    const raw: Record<string, string> = {};
    q.forEach((v, k) => {
      raw[k] = v;
    });
    return normalizeAttribution(raw);
  } catch {
    return null;
  }
}

function currentPayload(): string {
  const merged = mergeAttribution(fromUrl(), readCookie());
  return merged ? JSON.stringify(merged) : "";
}

/** Hidden JSON field so signup/login posts carry fbclid into SignupIntent. */
export default function AdAttributionFields() {
  const [payload, setPayload] = useState("");

  useLayoutEffect(() => {
    setPayload(currentPayload());
  }, []);

  if (!payload) return null;
  return <input type="hidden" name="adAttribution" value={payload} />;
}
