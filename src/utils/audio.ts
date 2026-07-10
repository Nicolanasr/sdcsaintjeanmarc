class CyberAudioSynthesizer {
  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    return new AudioContextClass();
  }

  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Double chirp
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playFailure() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playSiege() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    // Alarm sweep (siren effect)
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(700, now + 0.2);
    osc.frequency.linearRampToValueAtTime(400, now + 0.4);
    osc.frequency.linearRampToValueAtTime(700, now + 0.6);
    osc.frequency.linearRampToValueAtTime(400, now + 0.8);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.95);

    osc.start(now);
    osc.stop(now + 0.95);
  }

  playScan() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.08);
  }
}

export const cyberAudio = new CyberAudioSynthesizer();
