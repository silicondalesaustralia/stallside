/** Opening-bell ding for the homepage hero notification. */

const DING_SRC = "/sounds/sale-ding.mp3";

let sharedAudio: HTMLAudioElement | null = null;
let unlockBound = false;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (sharedAudio) return sharedAudio;

  const audio = new Audio(DING_SRC);
  audio.preload = "auto";
  audio.volume = 0.7;
  sharedAudio = audio;
  return audio;
}

/** Warm up / unlock after a click or tap so play() is allowed. */
export function unlockHeroSaleDing(): void {
  if (typeof window === "undefined") return;
  try {
    const audio = getAudio();
    if (!audio) return;
    // Mute-play-pause unlocks autoplay without an audible blip.
    const wasMuted = audio.muted;
    audio.muted = true;
    void audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = wasMuted;
      })
      .catch(() => {
        audio.muted = wasMuted;
      });
  } catch {
    // ignore
  }
}

export function bindHeroSaleDingUnlock(): () => void {
  if (typeof window === "undefined" || unlockBound) {
    return () => undefined;
  }
  unlockBound = true;

  const onGesture = () => {
    unlockHeroSaleDing();
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
