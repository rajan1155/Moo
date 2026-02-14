"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Moon, CloudRain, BatteryLow, Sun } from "lucide-react";

const moods = [
  { id: "sleepy", label: "Sleepy", icon: <Moon size={28} />, color: "bg-indigo-100 text-indigo-600" },
  { id: "sad", label: "Sad", icon: <CloudRain size={28} />, color: "bg-blue-100 text-blue-600" },
  { id: "low", label: "Low", icon: <BatteryLow size={28} />, color: "bg-gray-100 text-gray-600" },
  { id: "happy", label: "Happy", icon: <Sun size={28} />, color: "bg-yellow-100 text-yellow-600" },
];

export default function MoodsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <Link href="/" className="absolute top-6 left-6 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors font-serif font-medium flex items-center gap-1">
        ← Back
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center space-y-8"
      >
        <h1 className="text-4xl font-bold text-[var(--text)] font-serif drop-shadow-sm">How are you feeling?</h1>
        
        <div className="grid grid-cols-2 gap-4">
          {moods.map((mood) => (
            <Link key={mood.id} href={`/moods/${mood.id}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`aspect-square flex flex-col items-center justify-center gap-4 rounded-[32px] glass-card hover:shadow-md transition-all ${mood.color.replace('text-', 'bg-opacity-40 ')}`}
              >
                <div className={`p-4 rounded-full bg-white/90 shadow-sm ${mood.color}`}>
                  {mood.icon}
                </div>
                <span className="font-semibold text-[var(--text)] text-lg font-serif">{mood.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
