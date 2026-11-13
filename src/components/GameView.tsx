import { useCallback, useEffect, useRef, useState } from 'react';
import { soundManager } from '../game/audio';
import { NeonPulseEngine } from '../game/engine';
import type { GameState, HudSnapshot, UpgradeDef } from '../game/types';
import { Hud } from './Hud';
import { Overlays } from './Overlays';

const INITIAL_HUD: HudSnapshot = {
  hp: 100,
  maxHp: 100,
  xp: 0,
  nextXp: 10,
  level: 1,
  elapsed: 0,
  score: 0,
  bestScore: 0,
  kills: 0,
};

interface GameViewProps {
  onExitToSite: (latestBestScore: number) => void;
}

export function GameView({ onExitToSite }: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<NeonPulseEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [upgradeChoices, setUpgradeChoices] = useState<UpgradeDef[]>([]);
  const [muted, setMuted] = useState<boolean>(() => soundManager.isMuted());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new NeonPulseEngine(canvas, {
      onStateChange: (nextState) => setGameState(nextState),
      onHudUpdate: (snapshot) => setHud(snapshot),
      onLevelUpChoices: (choices) => setUpgradeChoices(choices),
    });

    engineRef.current = engine;
    engine.startNewGame();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleStart = useCallback(() => {
    engineRef.current?.startNewGame();
  }, []);

  const handleResume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const handleTogglePause = useCallback(() => {
    engineRef.current?.togglePause();
  }, []);

  const handleSelectUpgrade = useCallback((upgrade: UpgradeDef) => {
    engineRef.current?.selectUpgrade(upgrade);
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (engineRef.current) {
        engineRef.current.setMuted(next);
      } else {
        soundManager.setMuted(next);
      }
      return next;
    });
  }, []);

  const handleExit = useCallback(() => {
    const best = engineRef.current?.getBestScore() ?? hud.bestScore;
    onExitToSite(best);
  }, [hud.bestScore, onExitToSite]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none touch-none bg-[#07080f]">
      <canvas ref={canvasRef} className="block w-full h-full" />

      <Hud
        hud={hud}
        gameState={gameState}
        muted={muted}
        onToggleMute={handleToggleMute}
        onTogglePause={handleTogglePause}
      />

      <Overlays
        gameState={gameState}
        hud={hud}
        upgradeChoices={upgradeChoices}
        onStart={handleStart}
        onResume={handleResume}
        onRestart={handleStart}
        onSelectUpgrade={handleSelectUpgrade}
        onExitToSite={handleExit}
      />
    </div>
  );
}
