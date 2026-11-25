// Tiny synthesized sound for the kitchen: no audio files, every effect is an oscillator or a
// puff of filtered noise made on the spot with WebAudio — a chop, a pop, the serve bell, the
// burnt buzz. Sounds start only after the first player gesture, as browsers require.

export class KitchenSounds {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  /** Create the context on first use (from a click or key press) and keep it running. */
  unlock() {
    if (this.context === null) {
      const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
      if (AudioCtor) this.context = new AudioCtor();
    }
    if (this.context?.state === 'suspended') void this.context.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  /** One short tone; `slide` bends its pitch down over the burst when set. */
  tone(freq, seconds, type = 'sine', volume = 0.16, slide = 0) {
    if (this.context === null || this.muted) return;
    const ctx = this.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide !== 0) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), ctx.currentTime + seconds);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + seconds);
  }

  /** A burst of white noise through a band filter — the chop, the sizzle tick, the trash thud. */
  noise(seconds, freq, volume = 0.2) {
    if (this.context === null || this.muted) return;
    const ctx = this.context;
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 0.9;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  }

  pickup() { this.tone(520, 0.07, 'triangle', 0.12, 160); }
  place() { this.noise(0.06, 700, 0.14); }
  chop() { this.noise(0.05, 1800, 0.22); }
  addToBowl() { this.tone(340, 0.06, 'sine', 0.12, -60); }
  stoveOn() { this.noise(0.18, 300, 0.12); this.tone(120, 0.15, 'sawtooth', 0.05); }
  cooked() { this.tone(880, 0.1, 'sine', 0.14); this.tone(1318, 0.14, 'sine', 0.12); }
  serve() { this.tone(1568, 0.22, 'sine', 0.16); this.tone(2093, 0.3, 'sine', 0.1); }
  refuse() { this.tone(196, 0.18, 'square', 0.1, -70); }
  expire() { this.tone(392, 0.16, 'triangle', 0.14, -120); this.tone(311, 0.22, 'triangle', 0.12, -80); }
  trash() { this.noise(0.12, 240, 0.18); }
  click() { this.tone(660, 0.05, 'sine', 0.08); }
}
