/**
 * Audio synthesis & soothing ambient sound generator for Amma companion
 */

// Web Speech API text-to-speech for maternal voice
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopMaternalVoice(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function speakMaternalVoice(
  text: string,
  onEnd?: () => void,
  pitch = 1.05,
  rate = 0.92
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  stopMaternalVoice();

  // Strip markdown symbols for natural reading
  const cleanText = text
    .replace(/[#*_`~[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return false;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.pitch = pitch;
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  // Find a warm, gentle voice if possible
  const gentleVoice = voices.find(
    (v) =>
      v.name.includes('Natural') ||
      v.name.includes('Samantha') ||
      v.name.includes('Victoria') ||
      v.name.includes('Google UK English Female') ||
      v.name.includes('Female') ||
      (v.lang.startsWith('en') && !v.name.toLowerCase().includes('male'))
  );

  if (gentleVoice) {
    utterance.voice = gentleVoice;
  }

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function isSpeakingVoice(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

// Web Audio API Ambient Sound Generator
class AmbientSoundGenerator {
  private ctx: AudioContext | null = null;
  private currentType: string | null = null;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private timer: any = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(type: 'rain' | 'fireplace' | 'chimes' | 'lullaby'): void {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;
    this.currentType = type;

    switch (type) {
      case 'rain':
        this.playRain();
        break;
      case 'fireplace':
        this.playFireplace();
        break;
      case 'chimes':
        this.playChimes();
        break;
      case 'lullaby':
        this.playLullaby();
        break;
    }
  }

  private playRain(): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, gain);
  }

  private playFireplace(): void {
    if (!this.ctx) return;
    // Low rumble + periodic crackle
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, this.ctx.currentTime);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start();
    this.activeNodes.push(osc, oscGain);

    // Crackle generator
    const crackleInterval = setInterval(() => {
      if (!this.ctx || this.currentType !== 'fireplace') {
        clearInterval(crackleInterval);
        return;
      }
      if (Math.random() > 0.45) {
        const crackle = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        crackle.frequency.setValueAtTime(150 + Math.random() * 600, this.ctx.currentTime);
        crackle.type = 'sawtooth';
        cGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        cGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

        crackle.connect(cGain);
        cGain.connect(this.ctx.destination);
        crackle.start();
        crackle.stop(this.ctx.currentTime + 0.09);
      }
    }, 180);

    this.timer = crackleInterval;
  }

  private playChimes(): void {
    if (!this.ctx) return;
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C5, D5, E5, G5, A5, C6

    const triggerChime = () => {
      if (!this.ctx || this.currentType !== 'chimes') return;
      const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.9);
    };

    triggerChime();
    this.timer = setInterval(triggerChime, 1400);
  }

  private playLullaby(): void {
    if (!this.ctx) return;
    // Soothing 432 Hz warm binaural drone
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(216, this.ctx.currentTime); // A3 harmonic

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(218, this.ctx.currentTime); // gentle 2Hz beat

    gain.gain.setValueAtTime(0.07, this.ctx.currentTime);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    this.activeNodes.push(osc1, osc2, gain);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeNodes = [];
    this.currentType = null;
  }

  public getCurrent(): string | null {
    return this.currentType;
  }
}

export const ambientSound = new AmbientSoundGenerator();
