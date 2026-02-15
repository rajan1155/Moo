'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Music, Play, Pause } from 'lucide-react';

interface VoiceNote {
  url: string;
  createdAt: number;
  title: string;
}

export default function VoicePage() {
  const [voices, setVoices] = useState<VoiceNote[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastPausedIdRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getDisplayNameFromVoiceKey = (input: string) => {
    const base = input.split('/').pop() || input;
    const withoutTimestamp = base.replace(/^\d{6,}-/, '');
    const readable = withoutTimestamp.replace(/[_-]+/g, ' ');
    return readable;
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.time('voices:client');
    }
    fetch('/api/list/voices', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setVoices(data);
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          requestAnimationFrame(() => {
            console.timeEnd('voices:client');
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handlePlay = (id: string, e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    if (currentAudioRef.current && currentAudioRef.current !== audio) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    currentAudioRef.current = audio;
  };

  const handlePause = (id: string) => {
    lastPausedIdRef.current = id;
  };

  const handleEnded = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    if (currentAudioRef.current === e.currentTarget) {
      currentAudioRef.current = null;
    }
    lastPausedIdRef.current = null;
  };

  return (
    <div className="min-h-screen p-6">
      <Link href="/" className="fixed top-6 left-6 text-[var(--accent)] hover:text-[var(--accent-hover)] z-50 font-bold text-xl transition-colors">
        ← Home
      </Link>

      <div className="max-w-2xl mx-auto pt-16">
        <header className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-5 rounded-full glass-card mb-6"
          >
            <Music size={36} className="text-[var(--accent)]" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] font-serif mb-3">Voice Notes</h1>
          <p className="text-[var(--text-soft)] font-medium italic">Listen to my heart beat 🎤</p>
        </header>

        {loading ? (
          <div className="text-center text-[var(--text-soft)] mt-20 italic font-serif text-lg">Loading...</div>
        ) : voices.length === 0 ? (
          <div className="text-center text-[var(--text-soft)] mt-20 italic font-serif text-lg">No voice notes yet.</div>
        ) : (
          <div className="space-y-5">
            {voices.map((voice, idx) => (
              <motion.div
                key={voice.url}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 60 }}
                className="glass-card p-5 rounded-[24px] flex items-center gap-5 hover:shadow-[0_8px_20px_-5px_rgba(236,64,122,0.2)] transition-all hover:-translate-y-1 group"
              >
                <div className="bg-[var(--bg2)] p-3.5 rounded-full text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors duration-300">
                  <Play size={22} fill="currentColor" className="ml-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[var(--text)] font-semibold truncate text-lg font-serif mb-1">
                    {getDisplayNameFromVoiceKey(voice.title || voice.url) || 'Voice Note'}
                  </h3>
                  <div className="w-full bg-[var(--bg1)] rounded-full p-1">
                    <audio
                      controls
                      className="w-full h-8 opacity-80 hover:opacity-100 transition-opacity accent-[var(--accent)]"
                      onPlay={(e) => handlePlay(voice.url, e)}
                      onPause={() => handlePause(voice.url)}
                      onEnded={handleEnded}
                    >
                      <source src={voice.url} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
