import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { formatTime } from '../game/engine';
import type { GameState, HudSnapshot } from '../game/types';

interface HudProps {
  hud: HudSnapshot;
  gameState: GameState;
  muted: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
}

export function Hud({
  hud,
  gameState,
  muted,
  onToggleMute,
  onTogglePause,
}: HudProps) {
  const xpPct = Math.min(100, (hud.xp / Math.max(1, hud.nextXp)) * 100);
  const hpPct = Math.max(0, Math.min(100, (hud.hp / Math.max(1, hud.maxHp)) * 100));
  const showPlayControls = gameState === 'PLAYING' || gameState === 'PAUSED';

  return (
    <header className="fixed inset-x-0 top-0 z-10 pointer-events-none">
      {/* Top XP Bar */}
      <div className="w-full h-2 bg-slate-900/90 border-b border-cyan-500/20">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-[width] duration-150 ease-out shadow-[0_0_12px_rgba(56,189,248,0.65)]"
          style={{ width: `${xpPct}%` }}
        />
      </div>

      {/* HUD Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800/90 backdrop-blur-md rounded-lg px-4 py-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-400">HP</span>
            <div className="w-24 sm:w-32 h-2.5 bg-slate-800 rounded-sm overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 transition-[width] duration-150 ease-out"
                style={{ width: `${hpPct}%` }}
              />
            </div>
            <span className="font-mono-num text-xs sm:text-sm font-bold text-slate-100 whitespace-nowrap">
              {Math.ceil(hud.hp)}/{hud.maxHp}
            </span>
          </div>

          <span className="h-4 w-px bg-slate-800" aria-hidden="true" />

          <div className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
            <span className="text-slate-400 font-medium">Level</span>
            <span className="font-mono-num font-bold text-cyan-400">{hud.level}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800/90 backdrop-blur-md rounded-lg px-4 py-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-slate-400 font-medium">Time</span>
              <span className="font-mono-num font-bold text-slate-100">
                {formatTime(hud.elapsed)}
              </span>
            </div>

            <span className="h-4 w-px bg-slate-800" aria-hidden="true" />

            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-slate-400 font-medium">Score</span>
              <span className="font-mono-num font-bold text-slate-100">
                {hud.score.toLocaleString()}
              </span>
            </div>
          </div>

          {showPlayControls && (
            <button
              type="button"
              onClick={onTogglePause}
              aria-label={gameState === 'PAUSED' ? 'Resume game' : 'Pause game'}
              className="pointer-events-auto inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-950/85 border border-slate-800 text-slate-200 text-xs sm:text-sm font-semibold hover:border-cyan-400/70 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {gameState === 'PAUSED' ? (
                <>
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 text-slate-300" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            className="pointer-events-auto inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-950/85 border border-slate-800 text-slate-200 text-xs sm:text-sm font-semibold hover:border-cyan-400/70 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {muted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
