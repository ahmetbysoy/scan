/**
 * Web Audio API Sound Synthesizer & Vibration helper for mobile & desktop alerts.
 * Uses Web Audio API so no external audio file downloads are required.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a pleasant dual-tone alert chime (ascending frequency for pump, descending for dump).
 */
export function playAlertSound(type: 'pump' | 'dump' | 'neutral' = 'pump'): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'pump') {
      // Ascending chime: 587Hz (D5) -> 880Hz (A5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'dump') {
      // Descending warning chime: 784Hz (G5) -> 440Hz (A4)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(783.99, now);
      osc.frequency.exponentialRampToValueAtTime(440.00, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // Neutral notification blip
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (err) {
    console.warn('Audio play failed or disabled:', err);
  }
}

/**
 * Triggers mobile device vibration if supported.
 * Pattern: [duration, pause, duration] in ms.
 */
export function triggerVibration(pattern: number | number[] = [100, 50, 100]): void {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }
}
