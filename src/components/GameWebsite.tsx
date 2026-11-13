import { type FormEvent, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, Copy, Play } from 'lucide-react';
import heroArenaImg from '../assets/images/hero_arena_battle_1794555538327.jpg';
import upgradesShowcaseImg from '../assets/images/gameplay_upgrades_showcase_1794555538114.jpg';
import { UPGRADES } from '../game/upgrades';
import { UpgradeIcon } from './Overlays';
import { ParticleBg } from './ParticleBg';

interface GameWebsiteProps {
  bestScore: number;
  onPlayNow: () => void;
}

const ENEMY_CLASSES = [
  {
    name: 'Crimson Chaser',
    entryLabel: 'Wave 1+',
    speed: '95–120 px/s',
    baseHp: '24 HP',
    xpDrop: '2 XP',
    behavior:
      'Relentless swarm units that home directly toward your core. Dangerous in large packs across open lanes.',
    shape: 'circle' as const,
    color: '#f43f5e',
    accentText: 'text-rose-400',
  },
  {
    name: 'Volt Dasher',
    entryLabel: '20s+',
    speed: '165–195 px/s',
    baseHp: '14 HP',
    xpDrop: '3 XP',
    behavior:
      'High-velocity triangular interceptors with low armor and razor-sharp flanking speed. Keep moving.',
    shape: 'triangle' as const,
    color: '#facc15',
    accentText: 'text-amber-300',
  },
  {
    name: 'Void Cube',
    entryLabel: '45s+',
    speed: '62 px/s',
    baseHp: '85 HP',
    xpDrop: '7 XP',
    behavior:
      'Heavy armored monoliths that absorb sustained fire and drop high-value XP crystals when shattered.',
    shape: 'square' as const,
    color: '#a855f7',
    accentText: 'text-purple-400',
  },
];

const CONTROLS = [
  { input: 'WASD / Arrow Keys', action: 'Steer core across the arena (normalized diagonal movement)' },
  { input: 'Click & Drag / Touch', action: 'Activate the dynamic virtual joystick anywhere on screen' },
  { input: 'Keys 1 · 2 · 3', action: 'Install one of three upgrade modules on level-up' },
  { input: 'Esc or P', action: 'Pause or resume the active run' },
];

export function GameWebsite({ bestScore, onPlayNow }: GameWebsiteProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [upgradeImgFailed, setUpgradeImgFailed] = useState(false);

  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [copiedTarget, setCopiedTarget] = useState<'site' | 'play' | null>(null);

  const handleCopyShareLink = async (target: 'site' | 'play') => {
    const base = window.location.origin;
    const url = target === 'play' ? `${base}/#play` : base;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedTarget(target);
      setTimeout(() => setCopiedTarget(null), 2000);
    } catch {
      // Ignore clipboard errors in restricted environments
    }
  };

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!validEmail) {
      setFormError('Enter a valid email address to receive patch dispatches.');
      return;
    }
    setFormError('');
    setSubscribedEmail(trimmed);
    setEmail('');
  };

  return (
    <div className="relative min-h-screen bg-[#05060c] text-slate-200 flex flex-col">
      <ParticleBg />

      {/* Top Bar Contract: 1-line Brand — 4 nav links — 1 primary CTA */}
      <header className="sticky top-0 z-30 border-b border-cyan-500/15 bg-[#05060c]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-display text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
          >
            Neon Pulse
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400"
          >
            <a
              href="#features"
              className="hover:text-cyan-300 transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <a
              href="#enemies"
              className="hover:text-cyan-300 transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              Swarm Intel
            </a>
            <a
              href="#upgrades"
              className="hover:text-cyan-300 transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              Upgrades
            </a>
            <a
              href="#controls"
              className="hover:text-cyan-300 transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              Controls
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onPlayNow}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:brightness-110 transition-[filter] duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Now</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-14 pb-16 lg:pt-20 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-medium text-cyan-400 mb-3">
                Free Browser Arcade · Arena Survivor
              </p>
              <h1
                className="font-display font-extrabold tracking-tight text-white leading-[1.08] mb-5 text-balance"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.75rem)' }}
              >
                Pilot a rogue core against the geometric swarm.
              </h1>
              <p className="text-base text-slate-300 leading-relaxed max-w-xl mb-8">
                Dodge incoming waves, harvest magnetic energy shards, and stack devastating weapon
                evolutions in real time—built for pure flow directly in your browser.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={onPlayNow}
                  className="inline-flex items-center justify-center gap-2.5 min-h-[48px] px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-display font-bold text-base shadow-[0_0_28px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.99] transition-[transform,filter] duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch Game</span>
                </button>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-slate-900/75 border border-slate-700/80 text-slate-200 font-semibold text-sm hover:border-cyan-400/70 hover:text-cyan-300 transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <span>Explore Mechanics</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-slate-400">
                <span>0 MB Instant Play</span>
                <span aria-hidden="true">·</span>
                <span>Desktop &amp; Mobile Touch</span>
                <span aria-hidden="true">·</span>
                <span>Procedural Web Audio</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[260px] rounded-2xl overflow-hidden border border-slate-800/90 bg-[#0d1222]">
                {!heroImgFailed ? (
                  <img
                    src={heroArenaImg}
                    alt="Top-down geometric combat in Neon Pulse showing a cyan core ship firing energy bolts into crimson, amber, and violet enemy waves"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full lg:h-full object-cover aspect-video"
                  />
                ) : (
                  <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-[#05060c] to-cyan-950/30 text-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center mb-3">
                      <div className="w-5 h-5 rounded-full bg-cyan-400" />
                    </div>
                    <p className="font-display font-semibold text-white">Neon Pulse Arena</p>
                    <p className="text-xs text-slate-400 mt-1">60 FPS HTML5 Canvas Simulation</p>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#05060c]/95 via-[#05060c]/65 to-transparent flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-cyan-300 font-medium">Live Arena Build</p>
                    <p className="font-display text-sm sm:text-base font-bold text-white">
                      Auto-targeting pulse emitters &amp; orbital blades
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onPlayNow}
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-slate-950/90 border border-cyan-400/50 text-cyan-300 text-xs font-semibold hover:bg-cyan-500 hover:text-slate-950 transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4-column Spec Strip below hero split */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 border border-slate-800/90 rounded-xl bg-[#0d1222]/85 backdrop-blur-sm divide-y lg:divide-y-0 lg:divide-x divide-slate-800/90">
            <div className="p-5 sm:p-6">
              <div className="text-xs text-slate-400">Your Best Score</div>
              <div className="font-mono-num text-2xl font-bold text-cyan-400 mt-1">
                {bestScore.toLocaleString()}
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="text-xs text-slate-400">Core Upgrades</div>
              <div className="font-mono-num text-2xl font-bold text-white mt-1">7</div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="text-xs text-slate-400">Swarm Archetypes</div>
              <div className="font-mono-num text-2xl font-bold text-white mt-1">3</div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="text-xs text-slate-400">Download Size</div>
              <div className="font-mono-num text-2xl font-bold text-white mt-1">0 MB</div>
            </div>
          </div>
        </section>

        {/* Section 2: Features / Built for Pure Flow (Asymmetric Bento Grid) */}
        <section id="features" className="border-t border-slate-800/80 py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mb-10">
              <p className="text-sm font-medium text-cyan-400 mb-2">Built for Pure Flow</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance">
                Fast, responsive arena survival with zero downloads.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 rounded-2xl border border-slate-800/90 bg-[#0d1222]/85 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-cyan-400 mb-2">
                    01. Auto-Targeting Combat
                  </p>
                  <h3 className="font-display text-xl font-bold text-white mb-3">
                    Focus 100% on positioning and dodging
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                    Your plasma core scans a 750-pixel perimeter every fire cycle and locks onto
                    the nearest threat automatically, freeing you to weave through dense waves and
                    herd enemies into piercing lines.
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div>
                    <div className="text-slate-400">Base Fire Delay</div>
                    <div className="font-mono-num font-bold text-white mt-0.5">0.42 s</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Bolt Velocity</div>
                    <div className="font-mono-num font-bold text-white mt-0.5">560 px/s</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Base Damage</div>
                    <div className="font-mono-num font-bold text-white mt-0.5">20 DMG</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 rounded-2xl border border-slate-800/90 bg-[#0d1222]/85 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-400 mb-2">
                    02. Procedural Synth Audio
                  </p>
                  <h3 className="font-display text-xl font-bold text-white mb-3">
                    Live Web Audio feedback
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Crisp retro-futuristic sound effects synthesized live in your browser for weapon
                    fire, combo XP shard chimes, enemy shatters, level-ups, and core breach events.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-400">
                  Engine · <span className="font-mono-num text-slate-200">Web Audio Buffer Synth</span>
                </div>
              </div>

              <div className="lg:col-span-1 rounded-2xl border border-slate-800/90 bg-[#0d1222]/85 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-400 mb-2">
                    03. Magnetic Shards
                  </p>
                  <h3 className="font-display text-xl font-bold text-white mb-3">
                    Harvest XP mid-maneuver
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Shattered enemies drop glowing cyan crystals that accelerate into your core once
                    inside your magnet field, fueling rapid mid-wave level ups.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-400">
                  Base Magnet Field · <span className="font-mono-num text-slate-200">110 px</span>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-2xl border border-slate-800/90 bg-[#0d1222]/85 overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch">
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center">
                  <p className="text-xs font-semibold text-cyan-400 mb-2">04. Dynamic Evolutions</p>
                  <h3 className="font-display text-xl font-bold text-white mb-3">
                    Craft multishot, railgun, or orbital builds
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Leveling up pauses the arena and deals three randomized modules. Stack Split
                    Emitter spread with Railgun Tip pierce or surround your hull with spinning
                    Orbital Blades.
                  </p>
                </div>
                <div className="md:col-span-6 relative min-h-[200px] bg-slate-950">
                  {!upgradeImgFailed ? (
                    <img
                      src={upgradesShowcaseImg}
                      alt="Cyan diamond XP shards spiraling toward a glowing core protected by three emerald orbital blades"
                      referrerPolicy="no-referrer"
                      onError={() => setUpgradeImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-6 text-xs text-slate-400">
                      Orbital &amp; Shard Synergies
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Know the Swarm */}
        <section id="enemies" className="border-t border-slate-800/80 py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mb-10">
              <p className="text-sm font-medium text-cyan-400 mb-2">Know the Swarm</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance">
                Faster and deadlier geometric hostiles enter as time climbs.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {ENEMY_CLASSES.map((enemy) => (
                <article
                  key={enemy.name}
                  className="rounded-2xl border border-slate-800/90 bg-[#0d1222]/85 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                        {enemy.shape === 'circle' && (
                          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
                            <circle cx="15" cy="15" r="11" fill={enemy.color} />
                          </svg>
                        )}
                        {enemy.shape === 'triangle' && (
                          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
                            <polygon points="15,4 27,25 3,25" fill={enemy.color} />
                          </svg>
                        )}
                        {enemy.shape === 'square' && (
                          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
                            <rect x="4" y="4" width="22" height="22" rx="3" fill={enemy.color} />
                          </svg>
                        )}
                      </div>
                      <span className={`font-mono-num text-xs font-semibold ${enemy.accentText}`}>
                        {enemy.entryLabel}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-white mb-2">{enemy.name}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">{enemy.behavior}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-slate-500">Speed</div>
                      <div className="font-mono-num font-semibold text-slate-200 mt-0.5">
                        {enemy.speed}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Base HP</div>
                      <div className="font-mono-num font-semibold text-slate-200 mt-0.5">
                        {enemy.baseHp}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Reward</div>
                      <div className="font-mono-num font-semibold text-cyan-300 mt-0.5">
                        {enemy.xpDrop}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Upgrade Arsenal */}
        <section id="upgrades" className="border-t border-slate-800/80 py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <p className="text-sm font-medium text-cyan-400 mb-2">Upgrade Arsenal</p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance">
                  Every level grants a choice of 3 modules.
                </h2>
              </div>
              <p className="text-sm text-slate-400 max-w-sm">
                Stack synergies across all 7 modules to survive past the two-minute escalation mark.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {UPGRADES.map((upg) => (
                <div
                  key={upg.id}
                  className="rounded-xl border border-slate-800/90 bg-[#0d1222]/85 p-5 flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <UpgradeIcon id={upg.id} className={`w-5 h-5 ${upg.accent}`} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">{upg.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{upg.desc}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-cyan-500/35 bg-gradient-to-br from-cyan-950/30 to-[#0d1222] p-5 flex flex-col justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-base text-white">Test Your Build</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Drop into the arena and draft your first upgrade within seconds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onPlayNow}
                  className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-sm hover:bg-cyan-400 transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <span>Enter Arena</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Ready to Enter the Arena? & Controls */}
        <section id="controls" className="border-t border-slate-800/80 py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-6 space-y-8">
            <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-[#0d1222]/95 to-[#151c33]/80 p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                  Ready to Enter the Arena?
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-5">
                  Play immediately in any modern browser. Supports keyboard on desktop and a
                  virtual touch joystick on phones and tablets.
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  {['W', 'A', 'S', 'D'].map((keyLabel) => (
                    <kbd
                      key={keyLabel}
                      className="inline-flex items-center justify-center min-w-[40px] px-3 py-2 rounded-lg bg-[#05060c] border border-slate-600/60 border-b-2 font-mono-num text-sm font-bold text-cyan-300"
                    >
                      {keyLabel}
                    </kbd>
                  ))}
                  <span className="text-xs sm:text-sm text-slate-400 ml-1">
                    or Arrow Keys / Touch Drag
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col items-center text-center gap-3">
                <button
                  type="button"
                  onClick={onPlayNow}
                  className="w-full inline-flex items-center justify-center gap-2.5 min-h-[54px] px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-display font-bold text-lg shadow-[0_0_28px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.99] transition-[transform,filter] duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play Neon Pulse</span>
                </button>
                <div className="w-full grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCopyShareLink('site')}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-lg bg-[#05060c]/80 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:border-cyan-400/70 hover:text-cyan-300 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                  >
                    {copiedTarget === 'site' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Site Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Site Link</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyShareLink('play')}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-lg bg-[#05060c]/80 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:border-cyan-400/70 hover:text-cyan-300 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                  >
                    {copiedTarget === 'play' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Play Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Play Link</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  No account required · Local high score saving
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 rounded-2xl border border-slate-800/90 bg-[#0d1222]/85 divide-y divide-slate-800/80">
                {CONTROLS.map((row) => (
                  <div
                    key={row.input}
                    className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6"
                  >
                    <span className="font-mono-num text-sm font-bold text-cyan-300 whitespace-nowrap">
                      {row.input}
                    </span>
                    <span className="text-sm text-slate-300 sm:text-right">{row.action}</span>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-5 rounded-2xl border border-slate-800/90 bg-[#0d1222]/85 p-6 sm:p-7">
                <h3 className="font-display text-lg font-bold text-white mb-1.5">
                  Arena Updates &amp; New Modes
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  Get notified when boss waves and new weapon emitters release.
                </p>

                {subscribedEmail ? (
                  <div
                    role="status"
                    className="rounded-xl border border-emerald-500/35 bg-emerald-950/25 p-4 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-200">
                      <p className="font-semibold text-white">You are on the dispatch list.</p>
                      <p className="text-slate-400 mt-1">
                        Updates will be sent to{' '}
                        <span className="text-emerald-300">{subscribedEmail}</span>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} noValidate className="space-y-3">
                    <div>
                      <label
                        htmlFor="dispatch-email"
                        className="block text-xs font-medium text-slate-400 mb-1.5"
                      >
                        Email address
                      </label>
                      <input
                        id="dispatch-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (formError) setFormError('');
                        }}
                        placeholder="player@example.com"
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#05060c] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      />
                      {formError && (
                        <p className="text-xs text-rose-400 mt-1.5" role="alert">
                          {formError}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full min-h-[44px] px-5 py-2.5 rounded-lg bg-slate-100 text-slate-950 font-semibold text-sm hover:bg-white transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      Notify Me on Updates
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#05060c]/95">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-5">
            <span className="font-display font-bold text-white">Neon Pulse</span>
            <span className="text-xs text-slate-500">
              Arena Survivor — Built with HTML5 Canvas &amp; Web Audio API
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs sm:text-sm">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#enemies" className="hover:text-white transition-colors">
              Swarm Intel
            </a>
            <a href="#upgrades" className="hover:text-white transition-colors">
              Upgrades
            </a>
            <a href="#controls" className="hover:text-white transition-colors">
              Controls
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
