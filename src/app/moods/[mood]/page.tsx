"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getLetter } from "@/lib/db";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Letter } from "@/lib/types";
import { motion } from "framer-motion";

const MOOD_EMOJIS: Record<string, string> = {
  sleepy: "😴",
  sad: "🥺",
  low: "🔋",
  happy: "🥳",
};

const MOOD_COLORS: Record<string, string> = {
  sleepy: "bg-indigo-50",
  sad: "bg-blue-50",
  low: "bg-gray-50",
  happy: "bg-yellow-50",
};

const DEFAULT_LETTERS: Record<string, Letter> = {
  sleepy: {
    title: "Sweet Dreams My Love",
    body: "You've worked so hard today. Close your eyes, take a deep breath, and drift off knowing I'm thinking of you. I'll be here when you wake up. \n\nGoodnight, sleepyhead. 🌙",
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  },
  sad: {
    title: "I'm Here For You",
    body: "I hate that you're sad. I wish I could just hug you right now. Remember that this feeling is temporary, but my love for you is permanent. \n\nCall me if you need me. ❤️",
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  },
  low: {
    title: "Sending You Energy",
    body: "It's okay to have low days. You don't always have to be productive or happy. Just be. \n\nTake it easy today. I love you exactly as you are. 🔋",
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  },
  happy: {
    title: "Yay! Happy Day!",
    body: "I love seeing you happy! Your smile lights up my world. Keep shining, my love! \n\nLet's celebrate this mood! 🥳",
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  }
};

export default function MoodLetterPage() {
  const { mood } = useParams();
  const router = useRouter();
  const moodKey = (Array.isArray(mood) ? mood[0] : mood) || "happy";
  
  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchLetter = async () => {
      if (!moodKey) return;

      try {
        // If Firebase is not configured (placeholders), skip remote fetch and use fallback immediately
        if (!isFirebaseConfigured) {
          if (mounted) {
            setLetter(DEFAULT_LETTERS[moodKey] || DEFAULT_LETTERS["happy"]);
          }
          return;
        }
        // Fetch normally (no artificial timeout); fall back on error
        const data = await getLetter(moodKey);
        
        if (mounted) {
          if (data) {
            setLetter(data);
          } else {
            // Document doesn't exist, use default
            console.log("No letter found in Firestore, using default.");
            setLetter(DEFAULT_LETTERS[moodKey] || DEFAULT_LETTERS["happy"]);
          }
        }
      } catch (err: any) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Error fetching letter:", err);
        }
        if (mounted) {
          setError(err?.message || "Failed to load");
          setLetter(DEFAULT_LETTERS[moodKey] || DEFAULT_LETTERS["happy"]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLetter();
    return () => { mounted = false; };
  }, [moodKey]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--accent)] font-serif">Loading letter...</div>;

  return (
    <div className={`min-h-screen flex flex-col items-center p-6 relative`}>
      <Link href="/moods" className="absolute top-6 left-6 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors z-10 font-serif font-medium flex items-center gap-1">
        ← Back
      </Link>

      {process.env.NEXT_PUBLIC_DEBUG === "true" && error && (
        <div className="absolute top-6 right-6 text-xs text-red-400 bg-red-50 px-2 py-1 rounded border border-red-100">
          Debug: {error} (Using fallback)
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-lg glass-card rounded-[32px] shadow-xl overflow-hidden mt-12 border border-white/60"
      >
        <div className={`p-8 text-center relative overflow-hidden ${MOOD_COLORS[moodKey] || "bg-pink-100"}`}>
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="relative text-8xl z-10 drop-shadow-sm"
          >
            {MOOD_EMOJIS[moodKey] || "💌"}
          </motion.div>
        </div>

        <div className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-[var(--text)] font-serif border-b border-pink-100 pb-4">
            {letter?.title || `Open when you're ${moodKey}...`}
          </h1>
          
          <div className="prose prose-pink max-w-none text-[var(--text-soft)] leading-relaxed whitespace-pre-wrap font-serif">
            {letter?.body}
          </div>

          <div className="pt-6 text-right text-sm text-[var(--accent)] italic font-serif">
            With love,<br/>Your Valentine
          </div>
        </div>
      </motion.div>
    </div>
  );
}
