/**
 * The Ivory Table - Ambient Seaside & Lounge Soundscape Generator
 * Synthesized using the Web Audio API for 100% offline, zero-dependency,
 * realistic seaside waves and gentle warm lounge chords.
 */

class SeasideAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.waveGain = null;
    this.loungeGain = null;
    this.lfo = null;
    this.timer = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master Seaside Wave Noise Generator (Pink Noise + Lowpass Filter + LFO)
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter simulating ocean wave wash
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;
    filter.Q.value = 3.0;

    // LFO for wave ebb and flow (every ~6-7 seconds)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.14; // ~7 second wave cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    this.waveGain = this.ctx.createGain();
    this.waveGain.gain.value = 0.0;

    whiteNoise.connect(filter);
    filter.connect(this.waveGain);
    this.waveGain.connect(this.ctx.destination);

    whiteNoise.start();
    lfo.start();

    // Lounge Warm Chords Generator (occasional ambient harmonic pads)
    this.loungeGain = this.ctx.createGain();
    this.loungeGain.gain.value = 0.0;
    this.loungeGain.connect(this.ctx.destination);
  }

  playGentleChime() {
    if (!this.ctx || !this.isPlaying) return;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C Major 9 pentatonic
    const note = notes[Math.floor(Math.random() * notes.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, this.ctx.currentTime);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.5);

    osc.connect(gain);
    gain.connect(this.loungeGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 4.6);
  }

  toggle() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.waveGain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 2);
      this.loungeGain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 2);
      this.timer = setInterval(() => this.playGentleChime(), 4500);
    } else {
      this.waveGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 1);
      this.loungeGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 1);
      clearInterval(this.timer);
    }

    return this.isPlaying;
  }
}

window.SeasideAudio = new SeasideAudioEngine();
