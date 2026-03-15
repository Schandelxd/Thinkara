import { useCallback } from 'react';
import { useStore } from '../store/useStore.js';

const SOUNDS = {
  correct: 'https://raw.githubusercontent.com/cadecomposer/modern-minimal-ui-sounds/main/sounds/freedesktop/dialog-information.mp3',
  incorrect: 'https://raw.githubusercontent.com/cadecomposer/modern-minimal-ui-sounds/main/sounds/freedesktop/window-question.mp3',
  flip: 'https://raw.githubusercontent.com/cadecomposer/modern-minimal-ui-sounds/main/sounds/freedesktop/message-info.mp3',
  success: 'https://raw.githubusercontent.com/cadecomposer/modern-minimal-ui-sounds/main/sounds/freedesktop/dialog-information.mp3',
};

export function useSound() {
  const { settings } = useStore();

  const playSound = useCallback((soundName) => {
    if (!settings.soundEffects) return;
    
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
