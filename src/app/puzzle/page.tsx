'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Changed GRID_SIZE from 3 to 2 to make it easier as requested
// "Make the puzzle easier for users (fewer pieces visible on screen at once)"
const GRID_SIZE = 2;
const SIZE = GRID_SIZE;

export default function PuzzlePage() {
  const router = useRouter();
  const [tiles, setTiles] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [puzzleImage, setPuzzleImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize
  useEffect(() => {
    // Add cache buster to the fetch URL itself
    fetch(`/api/puzzle-config?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('No config');
        return res.json();
      })
      .then(config => {
        if (config.url) {
          // Add version parameter to force reload if changed
          setPuzzleImage(`${config.url}?v=${config.updatedAt}`);
          setTiles(Array.from({ length: SIZE * SIZE }, (_, i) => i).sort(() => Math.random() - 0.5));
        } else {
          setPuzzleImage(null);
        }
      })
      .catch(() => {
        setPuzzleImage(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const moveTile = (index: number) => {
    if (isSolved) return;
    const emptyIndex = tiles.indexOf(SIZE * SIZE - 1);
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    const emptyRow = Math.floor(emptyIndex / SIZE);
    const emptyCol = emptyIndex % SIZE;

    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      checkWin(newTiles);
    }
  };

  const checkWin = (currentTiles: number[]) => {
    const won = currentTiles.every((val, idx) => val === idx);
    if (won) {
      setIsSolved(true);
      console.log("Puzzle solved: setting cookie");
      document.cookie = "puzzle_unlocked=true; path=/; max-age=86400; SameSite=Lax";
      console.log("Cookie set, redirecting to home");
      window.location.assign("/");
      return;
    }
  };

  const handleReset = () => {
    if (isSolved) return;
    // Reshuffle pieces
    setTiles(Array.from({ length: SIZE * SIZE }, (_, i) => i).sort(() => Math.random() - 0.5));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--accent)] font-serif animate-pulse">Loading...</div>;
  }

  if (!puzzleImage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card p-8 rounded-[32px] shadow-sm max-w-md">
          <h1 className="text-4xl mb-4">💔</h1>
          <h2 className="text-xl font-bold text-[var(--text)] mb-2 font-serif">No puzzle image uploaded yet</h2>
          <p className="text-[var(--accent)] mb-6 font-serif italic">Ask your valentine to upload one in the admin dashboard!</p>
          <Link href="/admin" className="inline-block bg-gradient-to-r from-[var(--bg1)] to-[var(--bg2)] text-[var(--text)] px-6 py-2 rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all border border-white/40">
            Go to Admin
          </Link>
        </div>
      </div>
    );
  }

  // Calculate container size
  // Increased size for better visibility
  const containerSize = 400; 
  const tileSize = containerSize / SIZE;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Background with blur */}
      <div 
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center blur-sm"
        style={{ backgroundImage: `url(${puzzleImage})` }}
      />

      {/* Admin Link */}
      <Link 
        href="/admin" 
        className="fixed top-5 right-5 z-50 rounded-full bg-white/60 backdrop-blur-md px-4 py-2 text-sm font-semibold text-[var(--accent)] shadow-sm hover:bg-white/80 hover:scale-105 transition border border-white/60" 
      > 
        pudu 
      </Link>

      <div className="z-10 glass-card p-6 md:p-8 rounded-[32px] shadow-xl backdrop-blur-xl border border-white/60 flex flex-col items-center max-w-[95vw]">
        <h1 className="text-3xl font-bold text-center text-[var(--text)] mb-2 font-serif">
          {isSolved ? "Unlocked! 🔓" : "Unlock My Heart 🔐"}
        </h1>
        
        <p className="text-center text-[var(--accent)] mb-6 text-sm font-medium font-serif italic">
          {isSolved ? "Redirecting..." : "Tap the pieces to slide them into place"}
        </p>

        <div 
          className="relative bg-[var(--bg1)] rounded-xl overflow-hidden shadow-inner border-4 border-white/50 mx-auto"
          style={{ width: containerSize, height: containerSize, maxWidth: '100%' }}
        >
          {/* Soft Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none z-0 opacity-10" 
            style={{ 
              backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
              backgroundSize: `${tileSize}px ${tileSize}px`
            }}
          />

          {tiles.map((tileNumber, index) => {
            if (tileNumber === SIZE * SIZE - 1 && !isSolved) return null; // Empty tile

            const row = Math.floor(index / SIZE);
            const col = index % SIZE;
            
            // Calculate position for background image
            const originalRow = Math.floor(tileNumber / SIZE);
            const originalCol = tileNumber % SIZE;
            const bgX = (originalCol / (SIZE - 1)) * 100;
            const bgY = (originalRow / (SIZE - 1)) * 100;

            return (
              <motion.div
                key={tileNumber}
                layout
                onClick={() => moveTile(index)}
                className="absolute cursor-pointer border border-white/40 shadow-sm hover:brightness-110 transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  width: `${100/SIZE}%`,
                  height: `${100/SIZE}%`,
                  top: `${row * (100/SIZE)}%`,
                  left: `${col * (100/SIZE)}%`,
                  backgroundImage: `url(${puzzleImage})`,
                  backgroundSize: `${containerSize}px ${containerSize}px`,
                  backgroundPosition: `${bgX}% ${bgY}%`
                }}
                initial={false}
              />
            );
          })}
        </div>
        
        {!isSolved && (
          <div className="mt-6 flex gap-4">
             <button 
              onClick={handleReset}
              className="px-6 py-2 rounded-full bg-white/40 hover:bg-white/60 text-[var(--text)] font-medium text-sm transition-all border border-white/40 shadow-sm"
            >
              Reset Pieces
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
