/** Opening-bell ding for the homepage hero notification. */

const DING_SRC = "/sounds/sale-ding.mp3";

let sharedAudio: HTMLAudioElement | null = null;
let unlockBound = false;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (sharedAudio) return sharedAudio;

  const audio = new Audio(DING_SRC);
  audio.preload = "auto";
  audio.volume = 0.75;
  sharedAudio = audio;
  return audio;
}

/** Prefetch the MP3 so the first real play is instant. */
export function prefetchHeroSaleDing(): void {
  getAudio()?.load();
}

/** Unlock autoplay after a click/tap (silent). Returns true when unlocked. */
export async function unlockHeroSaleDing(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const audio = getAudio();
    if (!audio) return false;

    audio.muted = true;
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    return true;
  } catch {
    try {
      const audio = getAudio();
      if (audio) audio.muted = false;
    } catch {
      // ignore
    }
    return false;
  }
}

export function bindHeroSaleDingUnlock(): () => void {
  if (typeof window === "undefined" || unlockBound) {
    return () => undefined;
  }
  unlockBound = true;

  const onGesture = () => {
    void unlockHeroSaleDing();
  };

  window.addEventListener("pointerdown", onGesture, { once: true, passive: true });
  window.addEventListener("keydown", onGesture, { once: true });

  return () => {
    window.removeEventListener("pointerdown", onGesture);
    window.removeEventListener("keydown", onGesture);
    unlockBound = false;
  };
}

/** Returns true when the MP3 actually started. */
export async function playHeroSaleDing(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }

    const audio = getAudio();
    if (!audio) return false;

    audio.muted = false;
    audio.currentTime = 0;
    await audio.play();
    return true;
  } catch {
    return false;
  }
}
