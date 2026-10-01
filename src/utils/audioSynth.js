// Web Audio API Ambient Soundscape Generator
class SoundscapeEngine {
  constructor() {
    this.ctx = null;
    this.currentType = null;
    this.gainNode = null;
    this.noiseNode = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  start(type = 'rain', volume = 0.3) {
    this.stop();
    this.init();

    this.currentType = type;
    this.isPlaying = true;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    if (type === 'rain') {
      // Pink/Brownian noise for rain simulation
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // boost gain
      }
    } else if (type === 'lofi') {
      // Warm low-pass filtered noise with periodic swell
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }
    } else if (type === 'waves') {
      // Ocean wave simulator using modulated noise
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.01 * white)) / 1.01;
        lastOut = output[i];
        output[i] *= 2.0;
      }
    } else {
      // Deep focus binaural white noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.1;
      }
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Filter node to shape the sound character
    const filter = this.ctx.createBiquadFilter();
    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    } else if (type === 'lofi') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
    } else if (type === 'waves') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    }

    this.noiseNode.connect(filter);
    filter.connect(this.gainNode);
    this.noiseNode.start();
  }

  setVolume(vol) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  stop() {
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch (e) {
        // Ignored
      }
      this.noiseNode = null;
    }
    this.isPlaying = false;
  }
}

export const soundscapeEngine = new SoundscapeEngine();
