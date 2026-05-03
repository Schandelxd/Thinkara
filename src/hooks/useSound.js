import { useCallback } from 'react';
import { useStore } from '../store/useStore.js';

const SOUNDS = {
  correct: 'https://raw.githubusercontent.com/cadecomposer/modern-minimal-ui-sounds/main/sounds/freedesktop/dialog-information.mp3',
  incorrect: 'https://raw.githubusercontent.com/cadecomposer/modern-minimal-ui-sounds/main/sounds/freedesktop/window-question.mp3',
  flip: 'https://raw.githubusercontent.com/cadecomposer/modern-minimal-ui-sounds/main/sounds/freedesktop/message-info.mp3',
  success: 'https://raw.githubusercontent.com/cadecomposer/modern-minimal-ui-sounds/main/sounds/freedesktop/dialog-information.mp3',
};

// Simple AudioContext synthesizer for an Apple Pay-like "Ding" notification sound
function playApplePayDing(volume = 0.4) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const t = ctx.currentTime;
    
    // Apple Pay sound is two quick, high-pitched, pure tones.
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1400, t);
    osc1.frequency.exponentialRampToValueAtTime(1600, t + 0.1);
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(volume, t + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.15);

    // Tone 2 (higher and slightly delayed)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2000, t + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(2200, t + 0.2);
    gain2.gain.setValueAtTime(0, t + 0.08);
    gain2.gain.linearRampToValueAtTime(volume, t + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.3);
    
  } catch (e) {
    console.warn('AudioContext not supported or failed', e);
  }
}

export function useSound() {
  const { settings } = useStore();

  const playSound = useCallback((soundName) => {
    if (!settings.soundEffects) return;
    
    if (soundName === 'notification') {
      playApplePayDing();
      return;
    }
    
    const url = SOUNDS[soundName];
    if (!url) return;

    const audio = new Audio(url);
    audio.volume = 0.4; // Slightly louder but still minimalist
    audio.play()
      .then(() => console.log(`Sound played: ${soundName}`))
      .catch(err => {
        if (err.name === 'NotAllowedError') {
          console.warn('Playback blocked: User interaction required.');
        } else {
          console.error(`Audio error (${soundName}):`, err);
        }
      });
  }, [settings.soundEffects]);

  return { playSound };
}
