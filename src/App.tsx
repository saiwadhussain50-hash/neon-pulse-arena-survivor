import { useCallback, useEffect, useState } from 'react';
import { GameView } from './components/GameView';
import { GameWebsite } from './components/GameWebsite';

function readBestScore(): number {
  try {
    return Number(localStorage.getItem('neon_pulse_best') || 0);
  } catch {
    return 0;
  }
}

function isPlayUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.pathname.endsWith('/game.html') ||
    window.location.hash === '#play'
  );
}

export function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => isPlayUrl());
  const [bestScore, setBestScore] = useState<number>(() => readBestScore());

  useEffect(() => {
    const onHashChange = () => {
      setIsPlaying(isPlayUrl());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handlePlayNow = useCallback(() => {
    if (window.location.hash !== '#play') {
      window.history.pushState(null, '', '#play');
    }
    setIsPlaying(true);
  }, []);

  const handleExitToSite = useCallback((latestBestScore: number) => {
    setBestScore(Math.max(latestBestScore, readBestScore()));
    if (window.location.hash === '#play') {
      window.history.replaceState(null, '', window.location.pathname);
    }
    setIsPlaying(false);
  }, []);

  return (
    <>
      <GameWebsite bestScore={bestScore} onPlayNow={handlePlayNow} />
      {isPlaying && <GameView onExitToSite={handleExitToSite} />}
    </>
  );
}

export default App;
