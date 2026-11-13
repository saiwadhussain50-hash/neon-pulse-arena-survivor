export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'LEVEL_UP' | 'GAME_OVER';

export type EnemyType = 'chaser' | 'dasher' | 'tank';

export type UpgradeId =
  | 'firerate'
  | 'multishot'
  | 'damage'
  | 'pierce'
  | 'speed'
  | 'orbit'
  | 'vitality';

export interface Player {
  x: number;
  y: number;
  r: number;
  speed: number;
  hp: number;
  maxHp: number;
  xp: number;
  nextXp: number;
  level: number;
  fireDelay: number;
  damage: number;
  multishot: number;
  pierce: number;
  magnet: number;
  orbitals: number;
  invuln: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  damage: number;
  pierce: number;
  hitSet: Set<Enemy>;
}

export interface Enemy {
  x: number;
  y: number;
  r: number;
  speed: number;
  hp: number;
  maxHp: number;
  color: string;
  type: EnemyType;
  xpVal: number;
  hitFlash: number;
}

export interface Gem {
  x: number;
  y: number;
  val: number;
  r: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  color: string;
}

export interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface UpgradeDef {
  id: UpgradeId;
  title: string;
  desc: string;
  accent: string;
  apply: (player: Player) => void;
}

export interface HudSnapshot {
  hp: number;
  maxHp: number;
  xp: number;
  nextXp: number;
  level: number;
  elapsed: number;
  score: number;
  bestScore: number;
  kills: number;
}
