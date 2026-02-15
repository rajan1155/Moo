"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

const MAX_NO = 10;

export default function ValentinePage() {
  const [noClicks, setNoClicks] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [heartPositions, setHeartPositions] = useState<
    { top: number; left: number; opacity: number; scale: number; size: number; duration: number }[]
  >([]);
  const router = useRouter();

  // Lock scroll on this page
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const positions = Array.from({ length: 15 }).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: 0.2,
      scale: Math.random() * 0.5 + 0.5,
      size: Math.random() * 40 + 20,
      duration: Math.random() * 3 + 2,
    }));
    setHeartPositions(positions);
  }, []);

  const tease = useMemo(
    () => [
      "NO 🤍",
      "No? hmm… try again 😼",
      "Are you sureee? 🥺",
      "Don’t break my heart 💔",
      "I’ll ask nicely… please? 🌸",
      "You’re playing 😭",
      "Last chance 😳",
      "Stoppp 😤",
      "Okay you’re stubborn 🙈",
      "No is not an option 😘",
      "Fine… YES it is 💖",
    ],
    []
  );

  const isFinal = noClicks >= MAX_NO;
  // Dynamic scale computation: 1 + noClicks * 0.12
  const yesScale = 1 + noClicks * 0.12;
  console.log("Current noClicks:", noClicks, "Scale:", yesScale);

  function onNo() {
    if (isFinal) return;
    setNoClicks((c) => c + 1);
  }

  function onYes() {
    setAccepted(true);
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center overflow-hidden">
      
      {/* Floating background hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {mounted &&
          heartPositions.map((h, i) => (
            <motion.div
              key={i}
              initial={{
                top: `${h.top}%`,
                left: `${h.left}%`,
                opacity: h.opacity,
                scale: h.scale,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [h.opacity, Math.min(h.opacity + 0.2, 0.8), h.opacity],
              }}
              transition={{
                duration: h.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute text-[var(--bg2)]"
            >
              <Heart fill="currentColor" size={h.size} />
            </motion.div>
          ))}
      </div>

      {/* Back button (only visible before accepted/final) */}
      {!accepted && !isFinal && (
        <Link href="/" className="absolute top-6 left-6 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors z-30 font-serif font-medium flex items-center gap-1">
          ← Back
        </Link>
      )}

      {/* Success View */}
      <AnimatePresence mode="wait">
        {accepted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 z-[9999] relative w-full h-full justify-center p-4 fixed inset-0 glass-card"
            onClick={() => router.push("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") router.push("/");
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Heart size={120} fill="var(--accent)" className="text-[var(--accent)] drop-shadow-xl" />
            </motion.div>
            
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-[var(--text)] font-serif leading-tight drop-shadow-md"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              Happy Valentine’s Day,<br />my cutie! 💖
            </motion.h1>
            
            <p className="text-[var(--accent)] text-xl font-medium font-serif italic">I knew you'd say yes! ❤️</p>
            
            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    top: "110%", 
                    left: `${Math.random() * 100}%`,
                    opacity: 1,
                    scale: Math.random() * 0.5 + 0.5,
                    rotate: Math.random() * 360
                  }}
                  animate={{ 
                    top: "-10%",
                    opacity: 0,
                    rotate: Math.random() * 360 + 360
                  }}
                  transition={{ 
                    duration: Math.random() * 4 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "linear"
                  }}
                  className="absolute text-[var(--bg2)]"
                >
                  {i % 3 === 0 ? <Heart fill="currentColor" size={20} /> : <div className="w-2 h-2 rounded-full bg-[var(--bg2)]" />}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Normal Card View */
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 w-full max-w-[720px] flex flex-col items-center gap-8 p-8 relative glass-card rounded-[32px]"
          >
            {/* Cute Icon/Image */}
            <motion.div 
              className="text-[6rem] leading-none select-none filter drop-shadow-md"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              🐻
            </motion.div>
            
            {/* Text Content */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] font-serif leading-tight drop-shadow-sm">
                Will you be my Valentine?
              </h1>
              <p className="text-[var(--accent)] font-medium italic font-serif">be honest 😼</p>
            </div>

            {/* Normal button row */}
            <div className="flex items-center justify-center mt-8 w-full">
              {/* Layout: Flex container, gap 12px (gap-3) to allow faster overlap, same height */}
              <div className="relative flex items-center justify-center gap-3">
                
                {/* YES Button */}
                {/* We wrap it in a div to prevent layout jumps if needed, 
                    but per request we keep them side-by-side in one container. 
                    However, to keep the "left position" stability while scaling, 
                    we can use a wrapper or just let it scale via transform. 
                    Using transform: scale() does not affect layout flow, so NO won't move. 
                */}
                <motion.button 
                  onClick={onYes} 
                  className={
                    isFinal 
                    ? "fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-r from-[var(--bg1)] to-[var(--bg2)] text-white font-bold z-[9999]"
                    : "h-14 px-8 rounded-full bg-gradient-to-r from-[var(--bg1)] to-[var(--bg2)] text-[var(--text)] font-bold shadow-lg whitespace-nowrap hover:shadow-xl transition-all"
                  }
                  style={{ 
                    transformOrigin: "center",
                    borderRadius: isFinal ? 0 : "9999px",
                    zIndex: isFinal ? 9999 : 20,
                    transform: isFinal ? "none" : `scale(${yesScale})`,
                    transition: "transform 450ms ease",
                  }} 
                > 
                  <span className={isFinal ? "text-5xl md:text-7xl font-serif" : "text-lg"}>
                    YES 💗
                  </span> 
                </motion.button> 
    
                {/* NO Button */} 
                <motion.button 
                  onClick={onNo} 
                  className="h-14 px-8 rounded-full bg-white/80 text-[var(--text)] font-semibold shadow-md whitespace-nowrap hover:bg-white transition-colors border border-pink-100 min-w-[150px]"
                  style={{ 
                    zIndex: 10, 
                    display: isFinal ? "none" : "block",
                  }} 
                > 
                  {tease[Math.min(noClicks, tease.length - 1)]} 
                </motion.button> 
              </div> 
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
