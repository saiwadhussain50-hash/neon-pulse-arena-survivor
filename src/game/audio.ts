export type SoundEvent =
  | 'weapon_fire'
  | 'xp_collect'
  | 'player_death'
  | 'player_hit'
  | 'enemy_kill'
  | 'level_up'
  | 'upgrade_select';

const MUTE_STORAGE_KEY = 'neon_pulse_muted';

interface ClipConfig {
  minIntervalMs: number;
  volume: number;
}

const CLIP_CONFIG: Record<SoundEvent, ClipConfig> = {
  weapon_fire: { minIntervalMs: 40, volume: 0.28 },
  xp_collect: { minIntervalMs: 30, volume: 0.3 },
  player_death: { minIntervalMs: 250, volume: 0.65 },
  player_hit: { minIntervalMs: 80, volume: 0.45 },
  enemy_kill: { minIntervalMs: 30, volume: 0.24 },
  level_up: { minIntervalMs: 150, volume: 0.45 },
  upgrade_select: { minIntervalMs: 60, volume: 0.35 },
};

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private clips = new Map<SoundEvent, AudioBuffer>();
  private lastPlayedAt = new Map<SoundEvent, number>();
  private xpStreakCount = 0;
  private lastXpTime = 0;
  private muted = false;

  constructor() {
    try {
      this.muted = localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
    } catch {
      this.muted = false;
    }
  }

  public init(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(6, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.85, this.ctx.currentTime);

      compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.buildClipBank(this.ctx);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
    } catch {
      // Ignore storage errors
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.015);
    }
  }

  public playWeaponFire(): void {
    const jitter = 0.94 + Math.random() * 0.12;
    this.playClip('weapon_fire', jitter);
  }

  public playXpCollect(): void {
    const now = performance.now();
    if (now - this.lastXpTime < 450) {
      this.xpStreakCount = Math.min(10, this.xpStreakCount + 1);
    } else {
      this.xpStreakCount = 0;
    }
    this.lastXpTime = now;
    const rate = 1 + this.xpStreakCount * 0.045;
    this.playClip('xp_collect', rate);
  }

  public playPlayerDeath(): void {
    this.playClip('player_death', 1);
  }

  public playPlayerHit(): void {
    this.playClip('player_hit', 0.96 + Math.random() * 0.08);
  }

  public playEnemyKill(): void {
    this.playClip('enemy_kill', 0.9 + Math.random() * 0.2);
  }

  public playLevelUp(): void {
    this.playClip('level_up', 1);
  }

  public playUpgradeSelect(): void {
    this.playClip('upgrade_select', 1);
  }

  public playClip(event: SoundEvent, playbackRate = 1): void {
    if (this.muted) return;
    if (!this.ctx || !this.masterGain) {
      this.init();
    }
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    const nowMs = performance.now();
    const cfg = CLIP_CONFIG[event];
    const lastMs = this.lastPlayedAt.get(event) ?? -Infinity;
    if (nowMs - lastMs < cfg.minIntervalMs) return;
    this.lastPlayedAt.set(event, nowMs);

    const buffer = this.clips.get(event);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(playbackRate, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(cfg.volume, this.ctx.currentTime);

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(this.ctx.currentTime);
  }

  private buildClipBank(ctx: AudioContext): void {
    const sr = ctx.sampleRate;
    this.clips.set('weapon_fire', this.createWeaponFireBuffer(ctx, sr));
    this.clips.set('xp_collect', this.createXpCollectBuffer(ctx, sr));
    this.clips.set('player_death', this.createPlayerDeathBuffer(ctx, sr));
    this.clips.set('player_hit', this.createPlayerHitBuffer(ctx, sr));
    this.clips.set('enemy_kill', this.createEnemyKillBuffer(ctx, sr));
    this.clips.set('level_up', this.createLevelUpBuffer(ctx, sr));
    this.clips.set('upgrade_select', this.createUpgradeSelectBuffer(ctx, sr));
  }

  private createWeaponFireBuffer(ctx: AudioContext, sr: number): AudioBuffer {
    const duration = 0.075;
    const len = Math.floor(sr * duration);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);

    let phase = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const progress = t / duration;
      const freq = 640 * Math.pow(190 / 640, progress);
      phase += (2 * Math.PI * freq) / sr;
      const tri = (2 / Math.PI) * Math.asin(Math.sin(phase));
      const punch = Math.sin(phase * 0.5) * 0.35;
      const env = Math.pow(1 - progress, 1.8);
      data[i] = (tri * 0.65 + punch) * env;
    }
    return buf;
  }

  private createXpCollectBuffer(ctx: AudioContext, sr: number): AudioBuffer {
    const duration = 0.09;
    const len = Math.floor(sr * duration);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);

    let phaseA = 0;
    let phaseB = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const progress = t / duration;
      const freqA = 780 + progress * 340;
      const freqB = freqA * 1.5;
      phaseA += (2 * Math.PI * freqA) / sr;
      phaseB += (2 * Math.PI * freqB) / sr;
      const attack = Math.min(1, t / 0.005);
      const decay = Math.pow(1 - progress, 1.5);
      data[i] = (Math.sin(phaseA) * 0.7 + Math.sin(phaseB) * 0.3) * attack * decay;
    }
    return buf;
  }

  private createPlayerDeathBuffer(ctx: AudioContext, sr: number): AudioBuffer {
    const duration = 0.58;
    const len = Math.floor(sr * duration);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);

    let subPhase = 0;
    let sawPhase = 0;
    let noiseState = 0;

    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const progress = t / duration;

      // Sub-bass core collapse sweep
      const subFreq = 165 * Math.pow(32 / 165, Math.min(1, progress * 1.1));
      subPhase += (2 * Math.PI * subFreq) / sr;
      const sub = Math.sin(subPhase);

      // Descending distorted alarm harmonic
      const sawFreq = 260 * Math.pow(55 / 260, progress);
      sawPhase += sawFreq / sr;
      const saw = 2 * (sawPhase - Math.floor(sawPhase + 0.5));

      // Filtered white-noise shatter burst
      const white = Math.random() * 2 - 1;
      noiseState = noiseState * 0.86 + white * 0.14;
      const noiseEnv = Math.pow(Math.max(0, 1 - progress * 1.35), 2);

      const masterEnv = Math.pow(1 - progress, 1.4);
      data[i] = Math.tanh((sub * 0.75 + saw * 0.32 + noiseState * noiseEnv * 1.6) * masterEnv);
    }
    return buf;
  }

  private createPlayerHitBuffer(ctx: AudioContext, sr: number): AudioBuffer {
    const duration = 0.14;
    const len = Math.floor(sr * duration);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);

    let phase = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const progress = t / duration;
      const freq = 140 * Math.pow(48 / 140, progress);
      phase += freq / sr;
      const saw = 2 * (phase - Math.floor(phase + 0.5));
      const env = Math.pow(1 - progress, 1.6);
      data[i] = saw * 0.7 * env;
    }
    return buf;
  }

  private createEnemyKillBuffer(ctx: AudioContext, sr: number): AudioBuffer {
    const duration = 0.075;
    const len = Math.floor(sr * duration);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);

    let phase = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const progress = t / duration;
      const freq = 190 * Math.pow(65 / 190, progress);
      phase += (2 * Math.PI * freq) / sr;
      const sq = Math.sin(phase) >= 0 ? 1 : -1;
      const pop = (Math.random() * 2 - 1) * 0.25 * (1 - progress);
      const env = Math.pow(1 - progress, 2);
      data[i] = (sq * 0.55 + pop) * env;
    }
    return buf;
  }

  private createLevelUpBuffer(ctx: AudioContext, sr: number): AudioBuffer {
    const duration = 0.34;
    const len = Math.floor(sr * duration);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);

    const notes = [440, 554.37, 659.25, 880];
    const stepDur = duration / notes.length;
    let phase = 0;

    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const noteIdx = Math.min(notes.length - 1, Math.floor(t / stepDur));
      const noteLocal = (t - noteIdx * stepDur) / stepDur;
      const freq = notes[noteIdx];
      phase += (2 * Math.PI * freq) / sr;
      const env = Math.min(1, noteLocal / 0.08) * Math.pow(1 - noteLocal * 0.75, 1.4);
      const tail = Math.pow(1 - t / duration, 0.7);
      data[i] = (Math.sin(phase) * 0.75 + Math.sin(phase * 2) * 0.25) * env * tail;
    }
    return buf;
  }

  private createUpgradeSelectBuffer(ctx: AudioContext, sr: number): AudioBuffer {
    const duration = 0.11;
    const len = Math.floor(sr * duration);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);

    let phase = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const progress = t / duration;
      const freq = 600 + progress * 320;
      phase += (2 * Math.PI * freq) / sr;
      const env = Math.pow(1 - progress, 1.5);
      data[i] = Math.sin(phase) * 0.75 * env;
    }
    return buf;
  }
}

export const soundManager = new SoundManager();
