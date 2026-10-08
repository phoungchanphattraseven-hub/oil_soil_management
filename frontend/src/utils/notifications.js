export function playSuccessSound() {
  if (typeof window === 'undefined') return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const audioContext = new AudioContextClass();
    const gain = audioContext.createGain();
    gain.connect(audioContext.destination);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.09, audioContext.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.32);

    [660, 880].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const startAt = audioContext.currentTime + (index * 0.1);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startAt);
      oscillator.connect(gain);
      oscillator.start(startAt);
      oscillator.stop(startAt + 0.18);
    });

    window.setTimeout(() => audioContext.close(), 450);
  } catch {
    // Sound is optional: browser or device audio settings may prevent playback.
  }
}
