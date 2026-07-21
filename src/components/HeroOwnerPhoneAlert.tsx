"use client";

import { useEffect, useRef, useState } from "react";
import DemoOwnerPhoneScreen from "@/components/DemoOwnerPhoneScreen";
import DemoPhoneFrame from "@/components/DemoPhoneFrame";
import DemoSaleBanner from "@/components/DemoSaleBanner";
import {
  bindHeroSaleDingUnlock,
  playHeroSaleDing,
  prefetchHeroSaleDing,
  unlockHeroSaleDing,
} from "@/lib/hero-sale-ding";

const STAND_NAME = "Green Valley Eggs";
const FIRST_NOTIFICATION_MS = 4000;

export default function HeroOwnerPhoneAlert() {
  const [visible, setVisible] = useState(false);
  const hasPlayedDing = useRef(false);
  const audioReady = useRef(false);
  const bannerVisible = useRef(false);
  const firstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    prefetchHeroSaleDing();
    return bindHeroSaleDingUnlock();
  }, []);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setVisible(true);
      bannerVisible.current = true;
      return;
    }

    async function tryDing() {
      if (hasPlayedDing.current || !audioReady.current) return;
      const ok = await playHeroSaleDing();
      if (ok) hasPlayedDing.current = true;
    }

    function scheduleNext() {
      const delay = 5500 + Math.random() * 1500;
      loopTimer.current = setTimeout(replay, delay);
    }

    function showBanner() {
      setVisible(true);
      bannerVisible.current = true;
      void tryDing();
      scheduleNext();
    }

    function replay() {
      setVisible(false);
      bannerVisible.current = false;
      if (revealTimer.current) clearTimeout(revealTimer.current);
      revealTimer.current = setTimeout(showBanner, 400);
    }

    async function onGesture() {
      const unlocked = await unlockHeroSaleDing();
      if (!unlocked) return;
      audioReady.current = true;
      // If the first alert is already on screen, ding now — don't wait for the next loop.
      if (bannerVisible.current) {
        void tryDing();
      }
    }

    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture);

    // First notification after 4s — gives time for a click to unlock audio first.
    firstTimer.current = setTimeout(showBanner, FIRST_NOTIFICATION_MS);

    return () => {
      if (firstTimer.current) clearTimeout(firstTimer.current);
      if (revealTimer.current) clearTimeout(revealTimer.current);
      if (loopTimer.current) clearTimeout(loopTimer.current);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);

  return (
    <div className="flex w-full max-w-[180px] flex-col items-center gap-1">
      <p className="text-[10px] font-semibold tracking-wide text-[var(--ink-on-dark)]/55 uppercase">
        Owner phone
      </p>
      <DemoPhoneFrame
        size="compact"
        notification={
          <DemoSaleBanner
            visible={visible}
            via="cash"
            totalCents={1200}
            currency="AUD"
            standName={STAND_NAME}
            dismissible={false}
            surface="frosted"
          />
        }
      >
        <DemoOwnerPhoneScreen />
      </DemoPhoneFrame>
    </div>
  );
}
