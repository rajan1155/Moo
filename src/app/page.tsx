"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants, type Transition } from "framer-motion";
import { Heart, Image, Mic, MailOpen, Sparkles as SparkleIcon } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [greeting, setGreeting] = useState("");

  // Client Guard
  useEffect(() => {
    const hasCookie = document.cookie.includes('puzzle_unlocked=true');
    
    if (!hasCookie) {
      router.replace("/puzzle");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Dynamic Greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = "Good evening";

    if (hour >= 5 && hour < 12) {
      timeGreeting = "Good morning";
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = "Good afternoon";
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = "Good evening";
    } else {
      timeGreeting = "Good night";
    }
    
    setGreeting(timeGreeting);
  }, []);

  if (!isAuthorized) {
    return null;
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const spring: Transition = {
    type: "spring",
    stiffness: 260,
    damping: 20,
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: spring 
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 overflow-hidden relative">
      {/* Background Gradient Layer - REMOVED to let global body background shine through */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-[#FFF0F5] via-[#E6E6FA] to-[#FFF0F5] opacity-80 z-0" /> */}

      {/* Main Glass Container */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="z-10 w-full max-w-[800px] flex flex-col items-center text-center relative p-8 md:p-12 rounded-[40px] glass-card border border-white/40"
      >
        {/* Badge */}
        <motion.div variants={item} className="mb-6 inline-flex items-center gap-2 px-6 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-pink-200 shadow-sm">
          <Heart size={14} className="text-[#EC407A] fill-[#EC407A] animate-pulse" />
          <span className="text-xs font-bold tracking-[0.2em] text-[#EC407A] uppercase">
             Valentine's Day 2026 
          </span>
          <Heart size={14} className="text-[#EC407A] fill-[#EC407A] animate-pulse" />
        </motion.div>

        {/* Title */}
        <motion.div variants={item} className="mb-4 relative">
          <h1 className="text-4xl md:text-6xl font-bold text-[#2E1F47] font-serif leading-tight tracking-tight drop-shadow-sm">
            {greeting || "Good evening"},<br />my love
          </h1>
          <SparkleIcon className="absolute -top-6 -right-6 text-[#F8BBD0] opacity-80 animate-bounce" size={24} />
        </motion.div>

        {/* Subtitle */}
        <motion.div variants={item} className="mb-10">
          <p className="text-[#5c4b75] font-serif italic text-lg md:text-xl opacity-90 flex items-center justify-center gap-2">
            <span className="text-[#C8B6FF]">✨</span>
            I made this little corner of the internet just for you...
            <span className="text-[#C8B6FF]">✨</span>
          </p>
        </motion.div>

        {/* 4-Tile Grid */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-[700px]">
          <LinkCard 
            href="/moods" 
            icon={<MailOpen size={28} />} 
            title="Open When..." 
            description="For every mood"
            color="var(--bg1)" 
            accent="#7C4DFF"
          />
          <LinkCard 
            href="/memories" 
            icon={<Image size={28} />} 
            title="Memories" 
            description="Our favorite moments"
            color="var(--bg2)" 
            accent="#EC407A"
          />
          <LinkCard 
            href="/voice" 
            icon={<Mic size={28} />} 
            title="Voice Notes" 
            description="Listen to me"
            color="#F3E5F5" 
            accent="#AB47BC"
          />
          <LinkCard 
            href="/valentine" 
            icon={<Heart size={28} fill="currentColor" />} 
            title="Valentine" 
            description="The big question ❤️"
            color="#FFCDD2" 
            accent="#E53935"
          />
        </motion.div>
      </motion.div>
    </main>
  );
}

function LinkCard({ href, icon, title, description, color, accent }: { href: string; icon: React.ReactNode; title: string; description: string; color: string; accent: string }) {
  return (
    <Link href={href} className="w-full group">
      <motion.div 
        whileHover={{ 
          y: -8, 
          scale: 1.03,
          boxShadow: "0 20px 25px -5px rgba(236, 64, 122, 0.2), 0 10px 10px -5px rgba(236, 64, 122, 0.1)" 
        }}
        whileTap={{ scale: 0.98 }}
        className={`w-full h-full flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer rounded-[30px] border border-white/50 p-6 relative overflow-hidden bg-white/40 backdrop-blur-sm hover:bg-white/60`}
        style={{
          // background: `linear-gradient(135deg, white 0%, ${accent}15 100%)`, // Removed to let glass effect show
          borderColor: `${accent}40`,
        }}
      >
        <div 
            className={`p-4 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 bg-white/80`}
            style={{ color: accent }}
        >
          {icon}
        </div>
        <div className="flex flex-col items-center z-10">
          <span className="font-bold text-[#2E1F47] tracking-wide text-lg group-hover:text-[#EC407A] transition-colors font-serif">{title}</span>
          <span className="text-xs font-medium text-[#7E6990] uppercase tracking-wider mt-1">{description}</span>
        </div>
        
        {/* Soft background glow on hover using the accent color */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" 
          style={{ background: `linear-gradient(135deg, ${color} 0%, ${accent} 100%)` }}
        />
      </motion.div>
    </Link>
  );
}
