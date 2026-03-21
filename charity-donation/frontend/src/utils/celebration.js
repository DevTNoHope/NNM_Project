import confetti from "canvas-confetti";

export function launchCelebration() {
  const duration = 4000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
    });

    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

export function playSuccessSound() {
  const audio = new Audio("/sounds/success.mp3");
  audio.volume = 0.6;
  audio.loop = false;

  const playPromise = audio.play();
  if (playPromise?.catch) {
    playPromise.catch((err) => {
      console.warn("Autoplay blocked:", err);
    });
  }

  return audio;
}

export function runCelebration({ withSound = true } = {}) {
  launchCelebration();
  if (withSound) {
    playSuccessSound();
  }
}
