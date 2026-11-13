import type { UpgradeDef } from './types';

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'firerate',
    title: 'Overclocked Core',
    desc: '+22% Attack Speed',
    accent: 'text-amber-400',
    apply: (p) => {
      p.fireDelay *= 0.8;
    },
  },
  {
    id: 'multishot',
    title: 'Split Emitter',
    desc: '+1 Extra Projectile per shot',
    accent: 'text-cyan-400',
    apply: (p) => {
      p.multishot += 1;
    },
  },
  {
    id: 'damage',
    title: 'Plasma Density',
    desc: '+35% Bullet Damage',
    accent: 'text-rose-400',
    apply: (p) => {
      p.damage = Math.round(p.damage * 1.35);
    },
  },
  {
    id: 'pierce',
    title: 'Railgun Tip',
    desc: 'Bullets pierce +1 extra enemy',
    accent: 'text-sky-400',
    apply: (p) => {
      p.pierce += 1;
    },
  },
  {
    id: 'speed',
    title: 'Thruster Boost',
    desc: '+18% Move Speed & +25% Magnet',
    accent: 'text-indigo-400',
    apply: (p) => {
      p.speed *= 1.18;
      p.magnet *= 1.25;
    },
  },
  {
    id: 'orbit',
    title: 'Orbital Blade',
    desc: 'Adds a spinning energy orb',
    accent: 'text-emerald-400',
    apply: (p) => {
      p.orbitals += 1;
    },
  },
  {
    id: 'vitality',
    title: 'Nano Repair',
    desc: '+30 Max HP & full heal',
    accent: 'text-pink-400',
    apply: (p) => {
      p.maxHp += 30;
      p.hp = p.maxHp;
    },
  },
];

export function pickRandomUpgrades(count = 3): UpgradeDef[] {
  return [...UPGRADES].sort(() => Math.random() - 0.5).slice(0, count);
}
