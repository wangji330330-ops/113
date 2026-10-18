/* Tiny chiptune synth — all sounds are generated, no audio files. */

const SOUNDS = {
  click: { type: "square", gain: 0.018, notes: [392] },
  nav: { type: "square", gain: 0.014, notes: [294, 392], gap: 0.035 },
  check: { type: "square", gain: 0.022, notes: [523, 659, 784], gap: 0.055 },
  undo: { type: "triangle", gain: 0.018, notes: [330, 247], gap: 0.06 },
  reward: { type: "square", gain: 0.024, notes: [523, 659, 784, 1046, 1318], gap: 0.075 },
  error: { type: "square", gain: 0.016, notes: [174, 130], gap: 0.08 },
  open: { type: "triangle", gain: 0.02, notes: [440, 587], gap: 0.06 },
  breathe: { type: "sine", gain: 0.016, notes: [392, 523], gap: 0.22 },
  claim: { type: "square", gain: 0.022, notes: [659, 784, 1046], gap: 0.08 }
};

class AudioEngine {
  constructor() {
    this.enabled = true;
    this.context = null;
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
    if (this.enabled) this.unlock();
  }

  unlock() {
    if (typeof window === "undefined") return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!this.context) {
      try {
        this.context = new AudioContext();
      } catch {
        return;
      }
    }
    if (this.context.state === "suspended") {
      this.context.resume().catch(() => {});
    }
  }

  tone(freq, start, duration, type, volume) {
    const ctx = this.context;
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  play(name) {
    if (!this.enabled) return;
    this.unlock();
    const ctx = this.context;
    if (!ctx || ctx.state !== "running") return;
    const sound = SOUNDS[name];
    if (!sound) return;
    const base = ctx.currentTime + 0.005;
    const gap = sound.gap || 0.04;
    const duration = name === "breathe" ? 0.35 : 0.09;
    sound.notes.forEach((freq, index) => {
      this.tone(freq, base + index * gap, duration, sound.type, sound.gain);
    });
  }
}

export const audio = new AudioEngine();
