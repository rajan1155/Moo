'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Image as ImageIcon } from 'lucide-react';

interface Memory {
  url: string;
  createdAt: number;
  caption: string;
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const getThumbUrl = (url: string) => {
    const marker = '/image/upload/';
    const idx = url.indexOf(marker);
    if (idx === -1) return url;
    const before = url.slice(0, idx + marker.length);
    const after = url.slice(idx + marker.length);
    return `${before}f_auto,q_auto,c_limit,w_600/${after}`;
  };

  useEffect(() => {
    fetch('/api/list/memories', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setMemories(data);
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          requestAnimationFrame(() => {
            // timing removed
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen p-6">
      <Link href="/" className="fixed top-6 left-6 text-[var(--accent)] hover:text-[var(--accent-hover)] z-50 font-bold text-xl transition-colors">
        ← Home
      </Link>

      <div className="max-w-6xl mx-auto pt-16">
        <header className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-5 rounded-full glass-card mb-6"
          >
            <ImageIcon size={36} className="text-[var(--accent)]" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] font-serif mb-3">Our Memories</h1>
          <p className="text-[var(--text-soft)] font-medium italic">Moments frozen in time 📸</p>
        </header>

        {loading ? (
          <div className="text-center text-[var(--text-soft)] mt-20 italic font-serif text-lg">Loading...</div>
        ) : memories.length === 0 ? (
          <div className="text-center text-[var(--text-soft)] mt-20 italic font-serif text-lg">No memories uploaded yet. Check back later!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {memories.map((mem, idx) => (
              <motion.div
                key={mem.url}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, type: "spring", stiffness: 50 }}
                className="group"
                onClick={() => setSelectedImage(mem.url)}
              >
                <div className="aspect-[4/3] glass-card p-3 rounded-[24px] hover:shadow-[0_10px_30px_-10px_rgba(236,64,122,0.3)] hover:scale-[1.03] transition-all duration-300 cursor-zoom-in overflow-hidden relative">
                  <img 
                    src={getThumbUrl(mem.url)} 
                    alt="Memory" 
                    className="w-full h-full object-cover rounded-2xl"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-pink-900/0 group-hover:bg-pink-900/10 transition-colors duration-300 rounded-2xl" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E1F47]/90 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border-4 border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
