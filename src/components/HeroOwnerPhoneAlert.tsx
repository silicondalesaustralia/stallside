"use client";

import { useEffect, useRef, useState } from "react";
import DemoOwnerPhoneScreen from "@/components/DemoOwnerPhoneScreen";
import DemoPhoneFrame from "@/components/DemoPhoneFrame";
import DemoSaleBanner from "@/components/DemoSaleBanner";
import {
  bindHeroSaleDingUnlock,
  playHeroSaleDing,
  unlockHeroSaleDing,
} from "@/lib/hero-sale-ding";

const STAND_NAME = "Green Valley Eggs";

export default function HeroOwnerPhoneAlert() {
  const [visible, setVisible] = useState(false);
  const hasPlayedDing = useRef(false);
  const audioReady = useRef(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return bindHeroSaleDingUnlock();
  }, []);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setVisible(true);
      return;
    }

    async function tryDing() {
      if (hasPlayedDing.current) return;
      if (!audioReady.current) return;
      const ok = await playHeroSaleDing();
      if (ok) hasPlayedDing.current = true;
    }

    function scheduleNext() {
      const delay = 5500 + Math.random() * 1500;
      loopTimer.current = setTimeout(play, delay);
    }

    function play() {
      setVisible(false);
      if (revealTimer.current) clearTimeout(revealTimer.current);
      revealTimer.current = setTimeout(() => {
        setVisible(true);
        void tryDing();
        scheduleNext();
      }, 400);
    }

    // Unlock on gesture only — ding plays with the next notification reveal.
    function onGesture() {
      unlockHeroSaleDing();
      audioReady.current = true;
    }
    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture);

    // Attempt autoplay once (works if the browser already allows it).
    void playHeroSaleDing().then((ok) => {
      if (ok) {
        audioReady.current = true;
        hasPlayedDing.current = true;
      }
    });

    play();

    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
      if (loopTimer.current) clearTimeout(loopTimer.current);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);

  return (
    <div className="flex w-full max-w-[220px] flex-col items-center gap-1.5">
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
