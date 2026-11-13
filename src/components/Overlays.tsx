import { useEffect, useState } from 'react';
import {
  Check,
  Crosshair,
  Flame,
  GitFork,
  Heart,
  Share2,
  Shield,
  Wind,
  Zap,
} from 'lucide-react';
import { formatTime } from '../game/engine';
import type { GameState, HudSnapshot, UpgradeDef, UpgradeId } from '../game/types';

export function UpgradeIcon({ id, className }: { id: UpgradeId; className?: string }) {
  switch (id) {
    case 'firerate':
      return <Zap className={className} />;
    case 'multishot':
      return <GitFork className={className} />;
    case 'damage':
      return <Flame className={className} />;
    case 'pierce':
      return <Crosshair className={className} />;
    case 'speed':
      return <Wind className={className} />;
    case 'orbit':
      return <Shield className={className} />;
    case 'vitality':
      return <Heart className={className} />;
  }
}

interface OverlaysProps {
  gameState: GameState;
  hud: HudSnapshot;
  upgradeChoices: UpgradeDef[];
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onSelectUpgrade: (upgrade: UpgradeDef) => void;
  onExitToSite?: () => void;
}

export function Overlays({
  gameState,
  hud,
  upgradeChoices,
  onStart,
  onResume,
  onRestart,
  onSelectUpgrade,
  onExitToSite,
}: OverlaysProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/#play`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard blocked in restricted iframe contexts
    }
  };

  useEffect(() => {
    if (gameState !== 'LEVEL_UP' || upgradeChoices.length === 0) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' && upgradeChoices[0]) {
        onSelectUpgrade(upgradeChoices[0]);
      } else if (e.key === '2' && upgradeChoices[1]) {
        onSelectUpgrade(upgradeChoices[1]);
      } else if (e.key === '3' && upgradeChoices[2]) {
        onSelectUpgrade(upgradeChoices[2]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, upgradeChoices, onSelectUpgrade]);

  if (gameState === 'PLAYING') return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-5 bg-[#05070f]/80 backdrop-blur-md">
      {gameState === 'TITLE_MENU' && (
        <div className="w-full max-w-lg rounded-2xl bg-slate-950/95 border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.16)] p-8 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-cyan-400 mb-2">
            Arena Survivor
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            Neon Pulse
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-5">
            Survive the endless geometric swarm. Move with{' '}
            <strong className="text-white font-semibold">WASD / Arrow Keys</strong> or{' '}
            <strong className="text-white font-semibold">Click &amp; Drag</strong>. Weapons fire
            automatically—collect glowing shards to evolve.
          </p>

          <div className="flex items-center justify-center gap-3 text-sm text-slate-400 mb-7">
            <span>Best Score</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num font-bold text-cyan-300 text-base">
              {hud.bestScore.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center justify-center min-h-[46px] px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-display font-bold text-base tracking-wide shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.99] transition-[transform,filter] duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Enter Arena
            </button>
            {onExitToSite && (
              <button
                type="button"
                onClick={onExitToSite}
                className="inline-flex items-center justify-center min-h-[46px] px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-sm hover:border-slate-500 hover:text-white transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                Back to Site
              </button>
            )}
          </div>
        </div>
      )}

      {gameState === 'PAUSED' && (
        <div className="w-full max-w-md rounded-2xl bg-slate-950/95 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.6)] p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-2">Game Paused</h2>
          <p className="text-sm text-slate-400 mb-6">
            Press <strong className="text-slate-200">Esc</strong> or{' '}
            <strong className="text-slate-200">P</strong> anytime to resume.
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-slate-300 pb-6 mb-6 border-b border-slate-800/80">
            <span>
              Level <strong className="font-mono-num text-cyan-400">{hud.level}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span>
              Time <strong className="font-mono-num text-white">{formatTime(hud.elapsed)}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span>
              Score <strong className="font-mono-num text-white">{hud.score.toLocaleString()}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onResume}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:brightness-110 transition-[filter] duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-sm hover:border-slate-500 hover:text-white transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Restart
            </button>
            {onExitToSite && (
              <button
                type="button"
                onClick={onExitToSite}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-semibold text-sm hover:border-slate-600 hover:text-white transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                Exit to Site
              </button>
            )}
          </div>
        </div>
      )}

      {gameState === 'LEVEL_UP' && (
        <div className="w-full max-w-2xl rounded-2xl bg-slate-950/95 border border-cyan-500/35 shadow-[0_0_50px_rgba(6,182,212,0.18)] p-6 sm:p-8 text-center">
          <p className="text-xs font-semibold tracking-wider uppercase text-cyan-400 mb-1">
            Level {hud.level} Reached
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
            System Upgrade
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Choose one module to install (or press 1, 2, 3):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {upgradeChoices.map((upg, index) => (
              <button
                key={upg.id}
                type="button"
                onClick={() => onSelectUpgrade(upg)}
                className="group flex flex-col items-center text-center gap-2.5 p-5 rounded-xl bg-slate-900/85 border border-slate-700/80 hover:border-cyan-400 hover:bg-slate-900 hover:-translate-y-1 transition-[transform,border-color,background-color] duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <div className="flex items-center justify-between w-full text-xs text-slate-500 mb-1">
                  <span className="font-mono-num">[{index + 1}]</span>
                </div>
                <div className="w-11 h-11 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-cyan-500/40 transition-colors">
                  <UpgradeIcon id={upg.id} className={`w-6 h-6 ${upg.accent}`} />
                </div>
                <div className="font-display font-bold text-base text-slate-100">
                  {upg.title}
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">{upg.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'GAME_OVER' && (
        <div className="w-full max-w-md rounded-2xl bg-slate-950/95 border border-rose-500/35 shadow-[0_0_50px_rgba(244,63,94,0.16)] p-8 text-center">
          <h2 className="font-display text-3xl font-bold text-rose-400 mb-2">Core Breached</h2>
          <p className="text-sm text-slate-400 mb-6">
            Your vessel was overwhelmed by the swarm.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-7">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
              <div className="text-xs text-slate-400">Final Score</div>
              <div className="font-mono-num text-xl font-bold text-white mt-1">
                {hud.score.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
              <div className="text-xs text-slate-400">Best Score</div>
              <div className="font-mono-num text-xl font-bold text-cyan-300 mt-1">
                {hud.bestScore.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
              <div className="text-xs text-slate-400">Time Survived</div>
              <div className="font-mono-num text-xl font-bold text-white mt-1">
                {formatTime(hud.elapsed)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
              <div className="text-xs text-slate-400">Level Reached</div>
              <div className="font-mono-num text-xl font-bold text-white mt-1">
                {hud.level}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center justify-center min-h-[46px] px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-display font-bold text-base tracking-wide shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.99] transition-[transform,filter] duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Play Again
            </button>
            {onExitToSite && (
              <button
                type="button"
                onClick={onExitToSite}
                className="inline-flex items-center justify-center min-h-[46px] px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-sm hover:border-slate-500 hover:text-white transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                Back to Site
              </button>
            )}
            <button
              type="button"
              onClick={handleShareLink}
              className="inline-flex items-center justify-center gap-1.5 min-h-[46px] px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-cyan-300 font-semibold text-sm hover:border-cyan-400 transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
