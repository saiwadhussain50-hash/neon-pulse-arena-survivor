import { soundManager, type SoundManager } from './audio';
import type {
  Bullet,
  Enemy,
  EnemyType,
  FloatText,
  GameState,
  Gem,
  HudSnapshot,
  Particle,
  Player,
  UpgradeDef,
} from './types';
import { pickRandomUpgrades } from './upgrades';

const BEST_SCORE_KEY = 'neon_pulse_best';

export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export interface EngineCallbacks {
  onStateChange: (state: GameState) => void;
  onHudUpdate: (hud: HudSnapshot) => void;
  onLevelUpChoices: (choices: UpgradeDef[]) => void;
}

export class NeonPulseEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: EngineCallbacks;
  private sound: SoundManager;

  private W = 0;
  private H = 0;
  private dpr = 1;

  private state: GameState = 'TITLE_MENU';
  private rafId: number | null = null;
  private lastTime = 0;
  private hudAccumulator = 0;
  private menuDrift = 0;

  private keys: Record<string, boolean> = {};
  private pointer = { active: false, startX: 0, startY: 0, curX: 0, curY: 0 };

  private player!: Player;
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private gems: Gem[] = [];
  private particles: Particle[] = [];
  private floatTexts: FloatText[] = [];

  private elapsed = 0;
  private score = 0;
  private kills = 0;
  private bestScore = 0;
  private spawnTimer = 0;
  private shootTimer = 0;
  private shakeTime = 0;
  private camX = 0;
  private camY = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not acquire 2D rendering context');
    }
    this.ctx = context;
    this.callbacks = callbacks;
    this.sound = soundManager;

    try {
      this.bestScore = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
    } catch {
      this.bestScore = 0;
    }

    this.resetWorld();
    this.handleResize();
    this.bindEvents();
    this.emitHud();
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  private resetWorld(): void {
    this.player = {
      x: 0,
      y: 0,
      r: 14,
      speed: 230,
      hp: 100,
      maxHp: 100,
      xp: 0,
      nextXp: 10,
      level: 1,
      fireDelay: 0.42,
      damage: 20,
      multishot: 1,
      pierce: 1,
      magnet: 110,
      orbitals: 0,
      invuln: 0,
    };
    this.bullets = [];
    this.enemies = [];
    this.gems = [];
    this.particles = [];
    this.floatTexts = [];
    this.elapsed = 0;
    this.score = 0;
    this.kills = 0;
    this.spawnTimer = 0;
    this.shootTimer = 0;
    this.shakeTime = 0;
    this.camX = this.player.x - this.W / 2;
    this.camY = this.player.y - this.H / 2;
    this.pointer.active = false;
  }

  public startNewGame(): void {
    this.sound.init();
    this.resetWorld();
    this.setState('PLAYING');
    this.emitHud();
  }

  public setMuted(muted: boolean): void {
    this.sound.setMuted(muted);
  }

  public isMuted(): boolean {
    return this.sound.isMuted();
  }

  public pause(): void {
    if (this.state === 'PLAYING') {
      this.pointer.active = false;
      this.setState('PAUSED');
    }
  }

  public resume(): void {
    if (this.state === 'PAUSED') {
      this.lastTime = performance.now();
      this.setState('PLAYING');
    }
  }

  public togglePause(): void {
    if (this.state === 'PLAYING') {
      this.pause();
    } else if (this.state === 'PAUSED') {
      this.resume();
    }
  }

  public selectUpgrade(upgrade: UpgradeDef): void {
    if (this.state !== 'LEVEL_UP') return;
    upgrade.apply(this.player);
    this.sound.playUpgradeSelect();
    this.lastTime = performance.now();
    this.setState('PLAYING');
    this.emitHud();
  }

  public getBestScore(): number {
    return this.bestScore;
  }

  private setState(next: GameState): void {
    this.state = next;
    this.callbacks.onStateChange(next);
  }

  private emitHud(): void {
    this.callbacks.onHudUpdate({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      xp: this.player.xp,
      nextXp: this.player.nextXp,
      level: this.player.level,
      elapsed: this.elapsed,
      score: this.score,
      bestScore: this.bestScore,
      kills: this.kills,
    });
  }

  private handleResize = (): void => {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = Math.floor(this.W * this.dpr);
    this.canvas.height = Math.floor(this.H * this.dpr);
    this.canvas.style.width = `${this.W}px`;
    this.canvas.style.height = `${this.H}px`;
    if (this.state === 'TITLE_MENU') {
      this.camX = this.player.x - this.W / 2;
      this.camY = this.player.y - this.H / 2;
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    const k = e.key.toLowerCase();
    this.keys[k] = true;
    if (k === 'escape' || k === 'p') {
      if (this.state === 'PLAYING' || this.state === 'PAUSED') {
        e.preventDefault();
        this.togglePause();
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.key.toLowerCase()] = false;
  };

  private handlePointerDown = (e: PointerEvent): void => {
    if (this.state !== 'PLAYING') return;
    this.pointer.active = true;
    this.pointer.startX = e.clientX;
    this.pointer.startY = e.clientY;
    this.pointer.curX = e.clientX;
    this.pointer.curY = e.clientY;
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (!this.pointer.active) return;
    this.pointer.curX = e.clientX;
    this.pointer.curY = e.clientY;
  };

  private handlePointerUp = (): void => {
    this.pointer.active = false;
  };

  private bindEvents(): void {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
  }

  public destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
  }

  private spawnParticles(x: number, y: number, color: string, count = 8, speed = 160): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = (0.3 + Math.random() * 0.7) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.6,
        r: 2 + Math.random() * 2.5,
        color,
      });
    }
  }

  private addFloatText(x: number, y: number, text: string, color = '#e2e8f0'): void {
    this.floatTexts.push({ x, y, text, color, life: 0.65 });
  }

  private spawnEnemy(): void {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.hypot(this.W, this.H) * 0.55 + 60;
    const x = this.player.x + Math.cos(angle) * dist;
    const y = this.player.y + Math.sin(angle) * dist;

    const difficulty = 1 + this.elapsed / 35;
    const roll = Math.random();

    let type: EnemyType = 'chaser';
    let r = 13;
    let speed = 95 + Math.random() * 25;
    let hp = 24 * difficulty;
    let color = '#f43f5e';
    let xpVal = 2;

    if (this.elapsed > 20 && roll < 0.25) {
      type = 'dasher';
      r = 10;
      speed = 165 + Math.random() * 30;
      hp = 14 * difficulty;
      color = '#facc15';
      xpVal = 3;
    } else if (this.elapsed > 45 && roll > 0.82) {
      type = 'tank';
      r = 22;
      speed = 62;
      hp = 85 * difficulty;
      color = '#a855f7';
      xpVal = 7;
    }

    this.enemies.push({
      x,
      y,
      r,
      speed,
      hp,
      maxHp: hp,
      color,
      type,
      xpVal,
      hitFlash: 0,
    });
  }

  private fireWeapon(): void {
    if (this.enemies.length === 0) return;

    let nearest: Enemy | null = null;
    let bestD = Infinity;
    for (const e of this.enemies) {
      const d = (e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2;
      if (d < bestD) {
        bestD = d;
        nearest = e;
      }
    }
    if (!nearest || bestD > 750 * 750) return;

    const baseAngle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
    const count = this.player.multishot;
    const spread = 0.16;

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * spread;
      const a = baseAngle + offset;
      this.bullets.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(a) * 560,
        vy: Math.sin(a) * 560,
        r: 5,
        life: 1.4,
        damage: this.player.damage,
        pierce: this.player.pierce,
        hitSet: new Set(),
      });
    }
    this.sound.playWeaponFire();
  }

  private triggerLevelUp(): void {
    this.pointer.active = false;
    this.setState('LEVEL_UP');
    this.sound.playLevelUp();

    const choices = pickRandomUpgrades(3);
    this.callbacks.onLevelUpChoices(choices);
    this.emitHud();
  }

  private endGame(): void {
    this.pointer.active = false;
    this.sound.playPlayerDeath();
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      try {
        localStorage.setItem(BEST_SCORE_KEY, String(this.bestScore));
      } catch {
        // Ignore storage errors in restricted environments
      }
    }
    this.emitHud();
    this.setState('GAME_OVER');
  }

  private update(dt: number): void {
    if (this.state === 'TITLE_MENU') {
      this.menuDrift += dt;
      this.camX = Math.sin(this.menuDrift * 0.25) * 90 - this.W / 2;
      this.camY = Math.cos(this.menuDrift * 0.2) * 70 - this.H / 2;
      return;
    }

    if (this.state !== 'PLAYING') return;

    this.elapsed += dt;
    if (this.player.invuln > 0) this.player.invuln -= dt;
    if (this.shakeTime > 0) this.shakeTime -= dt;

    // Movement
    let mx = 0;
    let my = 0;
    if (this.keys['w'] || this.keys['arrowup']) my -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) my += 1;
    if (this.keys['a'] || this.keys['arrowleft']) mx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) mx += 1;

    if (mx === 0 && my === 0 && this.pointer.active) {
      const dx = this.pointer.curX - this.pointer.startX;
      const dy = this.pointer.curY - this.pointer.startY;
      const dist = Math.hypot(dx, dy);
      if (dist > 8) {
        mx = dx / dist;
        my = dy / dist;
      }
    }

    const mLen = Math.hypot(mx, my);
    if (mLen > 0) {
      this.player.x += (mx / mLen) * this.player.speed * dt;
      this.player.y += (my / mLen) * this.player.speed * dt;
      if (Math.random() < 0.35) {
        this.particles.push({
          x: this.player.x - (mx / mLen) * 10 + (Math.random() - 0.5) * 6,
          y: this.player.y - (my / mLen) * 10 + (Math.random() - 0.5) * 6,
          vx: -(mx / mLen) * 35,
          vy: -(my / mLen) * 35,
          life: 0.22,
          maxLife: 0.25,
          r: 2,
          color: '#06b6d4',
        });
      }
    }

    // Smooth camera
    const targetCamX = this.player.x - this.W / 2;
    const targetCamY = this.player.y - this.H / 2;
    this.camX += (targetCamX - this.camX) * Math.min(1, dt * 10);
    this.camY += (targetCamY - this.camY) * Math.min(1, dt * 10);

    // Spawning
    const spawnInterval = Math.max(0.16, 0.95 - this.elapsed * 0.008);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnEnemy();
      if (this.elapsed > 30 && Math.random() < 0.35) this.spawnEnemy();
      this.spawnTimer = spawnInterval;
    }

    // Auto-shooting
    this.shootTimer -= dt;
    if (this.shootTimer <= 0) {
      this.fireWeapon();
      this.shootTimer = this.player.fireDelay;
    }

    // Orbitals
    const orbitAngles: number[] = [];
    for (let i = 0; i < this.player.orbitals; i++) {
      orbitAngles.push(this.elapsed * 3.4 + (i * Math.PI * 2) / this.player.orbitals);
    }

    // Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0) this.bullets.splice(i, 1);
    }

    // Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hitFlash > 0) e.hitFlash -= dt;

      const ang = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      e.x += Math.cos(ang) * e.speed * dt;
      e.y += Math.sin(ang) * e.speed * dt;

      // Orbital collision
      for (const oa of orbitAngles) {
        const ox = this.player.x + Math.cos(oa) * 62;
        const oy = this.player.y + Math.sin(oa) * 62;
        if (Math.hypot(e.x - ox, e.y - oy) < e.r + 10) {
          e.hp -= 65 * dt;
          e.hitFlash = 0.08;
        }
      }

      // Bullet collision
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        const b = this.bullets[j];
        if (b.hitSet.has(e)) continue;
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
          e.hp -= b.damage;
          e.hitFlash = 0.1;
          b.hitSet.add(e);
          b.pierce -= 1;
          this.spawnParticles(b.x, b.y, '#38bdf8', 4, 90);
          this.addFloatText(e.x, e.y - e.r, String(b.damage), '#e2e8f0');
          if (b.pierce <= 0) this.bullets.splice(j, 1);
        }
      }

      // Enemy death
      if (e.hp <= 0) {
        this.spawnParticles(e.x, e.y, e.color, 12, 180);
        this.sound.playEnemyKill();
        this.score += e.xpVal * 10;
        this.kills += 1;
        this.gems.push({ x: e.x, y: e.y, val: e.xpVal, r: 5 });
        this.enemies.splice(i, 1);
        continue;
      }

      // Player collision
      if (Math.hypot(e.x - this.player.x, e.y - this.player.y) < e.r + this.player.r) {
        if (this.player.invuln <= 0) {
          this.player.hp -= 15;
          this.player.invuln = 0.45;
          this.shakeTime = 0.18;
          this.spawnParticles(this.player.x, this.player.y, '#ef4444', 10, 200);
          if (this.player.hp <= 0) {
            this.player.hp = 0;
            this.endGame();
            return;
          }
          this.sound.playPlayerHit();
          this.emitHud();
        }
      }
    }

    // XP Gems
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const g = this.gems[i];
      const dx = this.player.x - g.x;
      const dy = this.player.y - g.y;
      const d = Math.hypot(dx, dy);
      if (d < this.player.magnet && d > 0.001) {
        const pull = 360 * (1 - d / this.player.magnet) + 120;
        g.x += (dx / d) * pull * dt;
        g.y += (dy / d) * pull * dt;
      }
      if (d < this.player.r + g.r + 6) {
        this.player.xp += g.val;
        this.sound.playXpCollect();
        this.gems.splice(i, 1);
        if (this.player.xp >= this.player.nextXp) {
          this.player.xp -= this.player.nextXp;
          this.player.level += 1;
          this.player.nextXp = Math.round(this.player.nextXp * 1.35 + 6);
          this.triggerLevelUp();
          return;
        }
      }
    }

    // Particles & floating text
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const f = this.floatTexts[i];
      f.y -= 32 * dt;
      f.life -= dt;
      if (f.life <= 0) this.floatTexts.splice(i, 1);
    }

    this.hudAccumulator += dt;
    if (this.hudAccumulator >= 0.08) {
      this.hudAccumulator = 0;
      this.emitHud();
    }
  }

  private draw(): void {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    ctx.fillStyle = '#07080f';
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.save();
    let sx = 0;
    let sy = 0;
    if (this.shakeTime > 0) {
      sx = (Math.random() - 0.5) * 10;
      sy = (Math.random() - 0.5) * 10;
    }
    ctx.translate(-this.camX + sx, -this.camY + sy);

    // Background Grid
    const gridSize = 70;
    const startX = Math.floor(this.camX / gridSize) * gridSize;
    const startY = Math.floor(this.camY / gridSize) * gridSize;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.065)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x < this.camX + this.W + gridSize; x += gridSize) {
      ctx.moveTo(x, this.camY);
      ctx.lineTo(x, this.camY + this.H);
    }
    for (let y = startY; y < this.camY + this.H + gridSize; y += gridSize) {
      ctx.moveTo(this.camX, y);
      ctx.lineTo(this.camX + this.W, y);
    }
    ctx.stroke();

    // Origin pulse ring on menu/world center
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 120, 0, Math.PI * 2);
    ctx.stroke();

    if (this.state !== 'TITLE_MENU') {
      // Gems
      for (const g of this.gems) {
        ctx.fillStyle = '#22d3ee';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(g.x, g.y - g.r);
        ctx.lineTo(g.x + g.r, g.y);
        ctx.lineTo(g.x, g.y + g.r);
        ctx.lineTo(g.x - g.r, g.y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Bullets
      ctx.fillStyle = '#bae6fd';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      for (const b of this.bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Enemies
      for (const e of this.enemies) {
        ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        if (e.type === 'dasher') {
          const ang = Math.atan2(this.player.y - e.y, this.player.x - e.x);
          ctx.moveTo(e.x + Math.cos(ang) * e.r * 1.4, e.y + Math.sin(ang) * e.r * 1.4);
          ctx.lineTo(e.x + Math.cos(ang + 2.3) * e.r, e.y + Math.sin(ang + 2.3) * e.r);
          ctx.lineTo(e.x + Math.cos(ang - 2.3) * e.r, e.y + Math.sin(ang - 2.3) * e.r);
          ctx.closePath();
        } else if (e.type === 'tank') {
          ctx.rect(e.x - e.r, e.y - e.r, e.r * 2, e.r * 2);
        } else {
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Orbitals
      for (let i = 0; i < this.player.orbitals; i++) {
        const oa = this.elapsed * 3.4 + (i * Math.PI * 2) / this.player.orbitals;
        const ox = this.player.x + Math.cos(oa) * 62;
        const oy = this.player.y + Math.sin(oa) * 62;
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(ox, oy, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Player
      const blink = this.player.invuln > 0 && Math.floor(this.elapsed * 20) % 2 === 0;
      if (!blink) {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Particles
      for (const p of this.particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Floating Damage Text
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (const f of this.floatTexts) {
        ctx.globalAlpha = Math.max(0, f.life / 0.65);
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    // Virtual Touch Joystick Visual
    if (this.state === 'PLAYING' && this.pointer.active) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.pointer.startX, this.pointer.startY, 36, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.beginPath();
      ctx.arc(this.pointer.curX, this.pointer.curY, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private loop = (now: number): void => {
    const dt = Math.min(0.05, Math.max(0, (now - this.lastTime) / 1000));
    this.lastTime = now;
    this.update(dt);
    this.draw();
    this.rafId = requestAnimationFrame(this.loop);
  };
}
