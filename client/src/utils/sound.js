/**
 * Web Audio API Notification Synthesizer
 * Generates an instant, pleasant notification chime without external asset dependencies.
 */

let audioContext = null;

export const playNotificationBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    const ctx = audioContext;
    const now = ctx.currentTime;

    // Master gain for controlled, comfortable volume
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.15, now);
    masterGain.connect(ctx.destination);

    // Tone 1: E5 (659.25 Hz) - subtle warm chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(1, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.28);

    // Tone 2: B5 (987.77 Hz) - crisp harmonic resolution
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.08);
    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.9, now + 0.095);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.38);
  } catch {
    // Gracefully ignore audio constraints if document is un-interacted
  }
};
