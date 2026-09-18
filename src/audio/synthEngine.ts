/**
 * Web Audio API Synthesizer & Procedural Rhythm Engine
 * Completely self-contained - zero external audio assets required.
 */

class SynthAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Music sequencer state
  private isPlayingMusic: boolean = false;
  private bpm: number = 120;
  private nextBeatTime: number = 0;
  private step: number = 0;
  private timerId: number | null = null;

  // Scale frequencies for procedural cyberpunk chiptune (A minor / Cyber Phrygian)
  private readonly BASS_SCALE = [110, 110, 130.81, 146.83, 110, 164.81, 146.83, 123.47]; // A2, C3, D3, E3...
  private readonly LEAD_SCALE = [440, 523.25, 587.33, 659.25, 783.99, 659.25, 880, 587.33];

  constructor() {
    // Lazy initialized on first user interaction
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.75, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getCurrentTime(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  /**
   * Start procedural background rhythm track synced to current BPM
   */
  public startMusic(bpm: number) {
    this.init();
    if (!this.ctx) return;
    this.bpm = bpm;
    this.isPlayingMusic = true;
    this.step = 0;
    this.nextBeatTime = this.ctx.currentTime + 0.05;

    this.scheduleMusicLoop();
  }

  public setBpm(newBpm: number) {
    this.bpm = newBpm;
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleMusicLoop = () => {
    if (!this.isPlayingMusic || !this.ctx || !this.musicGain) return;

    const lookAhead = 0.15; // seconds
    const secondsPerBeat = 60.0 / this.bpm;
    const secondsPerSixteenth = secondsPerBeat / 4;

    while (this.nextBeatTime < this.ctx.currentTime + lookAhead) {
      const time = this.nextBeatTime;
      const step16 = this.step % 16;
      const beat = Math.floor(step16 / 4);
      const isQuarter = step16 % 4 === 0;

      // 1. Kick Drum on beats 0, 1, 2, 3 (Four-on-the-floor electro drive)
      if (isQuarter) {
        this.playKick(time);
      }

      // 2. Snare on beats 1 and 3 (2 and 4 in standard 4/4)
      if (step16 === 4 || step16 === 12) {
        this.playSnare(time);
      }

      // 3. Hi-Hats on 8th or 16th notes
      if (step16 % 2 === 0) {
        this.playHiHat(time, step16 % 4 === 2 ? 0.08 : 0.04);
      }

      // 4. Bassline arpeggio
      if (step16 % 2 === 0) {
        const bassFreq = this.BASS_SCALE[(Math.floor(this.step / 2)) % this.BASS_SCALE.length];
        this.playBassNote(time, bassFreq, secondsPerSixteenth * 1.5);
      }

      // 5. Synth Lead melody accent
      if (step16 === 0 || step16 === 3 || step16 === 6 || step16 === 10 || step16 === 14) {
        const leadFreq = this.LEAD_SCALE[Math.floor(this.step / 4) % this.LEAD_SCALE.length];
        this.playLeadNote(time, leadFreq, secondsPerSixteenth * 1.8);
      }

      this.step++;
      this.nextBeatTime += secondsPerSixteenth;
    }

    this.timerId = window.setTimeout(this.scheduleMusicLoop, 25);
  };

  // Drum synthesis: Sub Sine Pitch Drop Kick
  private playKick(time: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(36, time + 0.12);

      gain.gain.setValueAtTime(0.9, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.18);
    } catch {
      // Audio node cleanup
    }
  }

  // Snare synthesis: White Noise burst + 180Hz blip
  private playSnare(time: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.6, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(time);
      noise.stop(time + 0.14);

      // Body tone
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, time);
      osc.frequency.exponentialRampToValueAtTime(60, time + 0.08);

      oscGain.gain.setValueAtTime(0.4, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      osc.connect(oscGain);
      oscGain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.08);
    } catch {
      // Ignore
    }
  }

  // Hi-Hat synthesis
  private playHiHat(time: number, duration: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(time);
      noise.stop(time + duration);
    } catch {
      // Ignore
    }
  }

  // Synth Bass note (Sawtooth with low-pass filter envelope)
  private playBassNote(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, time);
      filter.frequency.exponentialRampToValueAtTime(180, time + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + duration);
    } catch {
      // Ignore
    }
  }

  // Synth Lead note (Chiptune Square wave pulse)
  private playLeadNote(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.16, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + duration);
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // SOUND EFFECTS (SFX)
  // ==========================================

  /**
   * Sound effect for hitting regular arrow note (Perfect / Great)
   */
  public playHitSfx(isPerfect: boolean = true) {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const time = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isPerfect ? 'square' : 'triangle';
      const startFreq = isPerfect ? 659.25 : 523.25; // E5 or C5
      const endFreq = isPerfect ? 987.77 : 659.25; // B5 or E5

      osc.frequency.setValueAtTime(startFreq, time);
      osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.08);

      gain.gain.setValueAtTime(isPerfect ? 0.35 : 0.22, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(time);
      osc.stop(time + 0.12);
    } catch {
      // Safe fallback
    }
  }

  /**
   * Heavy crunchy finisher sound for Spacebar Strike
   */
  public playFinisherSfx() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const time = this.ctx.currentTime;

      // Deep sub blast
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(220, time);
      subOsc.frequency.exponentialRampToValueAtTime(45, time + 0.35);

      subGain.gain.setValueAtTime(0.6, time);
      subGain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(time);
      subOsc.stop(time + 0.35);

      // High laser sweep
      const laserOsc = this.ctx.createOscillator();
      const laserGain = this.ctx.createGain();
      laserOsc.type = 'square';
      laserOsc.frequency.setValueAtTime(1400, time);
      laserOsc.frequency.exponentialRampToValueAtTime(320, time + 0.25);

      laserGain.gain.setValueAtTime(0.4, time);
      laserGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      laserOsc.connect(laserGain);
      laserGain.connect(this.sfxGain);
      laserOsc.start(time);
      laserOsc.stop(time + 0.25);
    } catch {
      // Safe fallback
    }
  }

  /**
   * Sound effect for Miss / Error
   */
  public playMissSfx() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const time = this.ctx.currentTime;
      // Dissonant dual saw tones
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(130.81, time); // C3
      osc2.frequency.setValueAtTime(138.59, time); // C#3 (clashing semitone!)

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + 0.2);
      osc2.stop(time + 0.2);
    } catch {
      // Safe fallback
    }
  }

  /**
   * Powerup / Item pickup sound
   */
  public playPowerupSfx() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const time = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const noteTime = time + idx * 0.055;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.3, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(noteTime);
        osc.stop(noteTime + 0.12);
      });
    } catch {
      // Safe fallback
    }
  }

  /**
   * Bug Special Glitch Attack screech
   */
  public playGlitchAttackSfx() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const time = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const mod = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      mod.type = 'square';

      osc.frequency.setValueAtTime(320, time);
      osc.frequency.linearRampToValueAtTime(650, time + 0.3);

      mod.frequency.setValueAtTime(80, time);
      modGain.gain.setValueAtTime(150, time);

      mod.connect(osc.frequency);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      mod.start(time);
      osc.start(time);
      mod.stop(time + 0.35);
      osc.stop(time + 0.35);
    } catch {
      // Safe fallback
    }
  }

  /**
   * Victory Fanfare
   */
  public playVictorySfx() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const time = this.ctx.currentTime;
      const fanfare = [
        { f: 523.25, d: 0.15 },
        { f: 659.25, d: 0.15 },
        { f: 783.99, d: 0.15 },
        { f: 1046.5, d: 0.45 },
      ];

      let offset = 0;
      fanfare.forEach(item => {
        const noteTime = time + offset;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(item.f, noteTime);

        gain.gain.setValueAtTime(0.3, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + item.d);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(noteTime);
        osc.stop(noteTime + item.d);
        offset += item.d * 0.9;
      });
    } catch {
      // Safe fallback
    }
  }
}

export const audioSynth = new SynthAudioEngine();
