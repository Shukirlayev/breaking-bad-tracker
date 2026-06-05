"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Share, Download, Beaker } from "lucide-react";
import { toPng } from "html-to-image";

// --- Constants & Data ---
const SEASONS = [
  { id: 1, episodes: 7 },
  { id: 2, episodes: 13 },
  { id: 3, episodes: 13 },
  { id: 4, episodes: 13 },
  { id: 5, episodes: 16 },
];

const TOTAL_EPISODES = 62;
const EPISODE_LENGTH_MIN = 47;
const MAX_PURITY = 99.1;

const QUOTES = [
  "I am the danger.",
  "Say my name.",
  "Yeah, science!",
  "Tread lightly.",
  "We're done when I say we're done.",
  "No half measures.",
  "I did it for me. I liked it.",
];

// --- Components ---
export default function BreakingBadTracker() {
  const [mounted, setMounted] = useState(false);
  const [watched, setWatched] = useState<string[]>([]);
  const [quote, setQuote] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  // Hydration & initial random quote
  useEffect(() => {
    const saved = localStorage.getItem("bb-tracker-watched");
    if (saved) {
      try {
        setWatched(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    setMounted(true);
  }, []);

  // Save to localStorage when watched array changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("bb-tracker-watched", JSON.stringify(watched));
    }
  }, [watched, mounted]);

  const toggleEpisode = (episodeId: string) => {
    setWatched((prev) =>
      prev.includes(episodeId)
        ? prev.filter((id) => id !== episodeId)
        : [...prev, episodeId]
    );
  };

  const handleExport = async () => {
    if (!posterRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(posterRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = "bb-purity-report.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Calculations
  const purityLevel = ((watched.length / TOTAL_EPISODES) * MAX_PURITY).toFixed(1);
  const totalMinutes = watched.length * EPISODE_LENGTH_MIN;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!mounted) return <div className="min-h-screen bg-background" />; // Prevent hydration mismatch

  return (
    <div className="relative min-h-screen bg-background text-primaryText overflow-x-hidden font-sans pb-24">
      {/* Background Ambient Orb */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-bbDarkGreen blur-[150px] opacity-20 pointer-events-none" />

      <main className="relative z-10 max-w-md mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center gap-1 mb-3">
            <span className="bg-bbGreen/10 text-bbGreen px-2 py-1 rounded border border-bbGreen/30 inline-block">
              Br
            </span>
            eaking
            <span className="bg-bbGreen/10 text-bbGreen px-2 py-1 rounded border border-bbGreen/30 inline-block ml-2">
              Ba
            </span>
            d
          </h1>
          <p className="text-secondaryText italic text-sm">"{quote}"</p>
        </motion.div>

        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-10"
        >
          <div className="bg-surface/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center shadow-2xl">
            <Beaker className="w-5 h-5 text-bbGreen mb-2 opacity-80" />
            <p className="text-xs text-secondaryText font-medium uppercase tracking-wider mb-1">
              Purity Level
            </p>
            <p className="text-3xl font-bold text-bbGreen">{purityLevel}%</p>
          </div>
          <div className="bg-surface/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center shadow-2xl">
            <div className="w-5 h-5 mb-2 opacity-80 text-primaryText flex items-center justify-center">
              ⏱️
            </div>
            <p className="text-xs text-secondaryText font-medium uppercase tracking-wider mb-1">
              Watch Time
            </p>
            <p className="text-2xl font-bold">
              {hours}h {minutes}m
            </p>
          </div>
        </motion.div>

        {/* Episodes List */}
        <div className="space-y-8">
          {SEASONS.map((season, seasonIdx) => (
            <motion.div
              key={`season-${season.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + seasonIdx * 0.1 }}
              className="space-y-3"
            >
              <h2 className="text-sm font-bold text-secondaryText uppercase tracking-widest pl-1 border-l-2 border-bbGreen/50">
                Season {season.id}
              </h2>
              <div className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                {Array.from({ length: season.episodes }).map((_, epIdx) => {
                  const epNum = epIdx + 1;
                  const episodeId = `S${season.id}-E${epNum}`;
                  const isWatched = watched.includes(episodeId);

                  return (
                    <div
                      key={episodeId}
                      onClick={() => toggleEpisode(episodeId)}
                      className={`flex items-center justify-between p-4 border-b border-white/5 last:border-0 cursor-pointer transition-all active:scale-[0.98] ${
                        isWatched ? "bg-black/20" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-medium transition-colors ${
                            isWatched
                              ? "text-secondaryText line-through opacity-50"
                              : "text-primaryText"
                          }`}
                        >
                          {epNum}-qism
                        </span>
                        <span className="text-xs text-secondaryText mt-0.5">
                          S{String(season.id).padStart(2, "0")}E
                          {String(epNum).padStart(2, "0")}
                        </span>
                      </div>
                      <div>
                        <AnimatePresence mode="wait">
                          {isWatched ? (
                            <motion.div
                              key="checked"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                            >
                              <CheckCircle2 className="w-6 h-6 text-bbGreen drop-shadow-[0_0_8px_rgba(24,199,68,0.5)]" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="unchecked"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                            >
                              <Circle className="w-6 h-6 text-white/20" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Floating Action Button for Export */}
      <motion.button
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={handleExport}
        disabled={isExporting}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#121212] backdrop-blur-xl border border-white/10 shadow-2xl px-6 py-3 rounded-full flex items-center gap-3 text-sm font-medium active:scale-95 transition-transform disabled:opacity-50"
      >
        {isExporting ? (
          <div className="w-5 h-5 border-2 border-bbGreen border-t-transparent rounded-full animate-spin" />
        ) : (
          <Share className="w-4 h-4 text-bbGreen" />
        )}
        {isExporting ? "Cooking..." : "Share to Telegram"}
      </motion.button>

      {/* Hidden Export Poster (1080x1080) */}
      <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none">
        <div
          ref={posterRef}
          className="w-[1080px] h-[1080px] bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden font-sans"
        >
          {/* Poster Ambient Background */}
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <div className="w-[600px] h-[600px] bg-bbDarkGreen blur-[200px] opacity-40 rounded-full" />
          </div>

          <div className="z-10 flex flex-col items-center w-full px-20">
            {/* Poster Header */}
            <div className="text-[120px] font-extrabold tracking-tight flex items-center justify-center gap-4 mb-24 text-white">
              <span className="bg-[#18c744]/20 text-[#18c744] px-6 py-4 rounded-2xl border-4 border-[#18c744]/30">
                Br
              </span>
              eaking
              <span className="bg-[#18c744]/20 text-[#18c744] px-6 py-4 rounded-2xl border-4 border-[#18c744]/30 ml-4">
                Ba
              </span>
              d
            </div>

            {/* Poster Stats */}
            <div className="w-full grid grid-cols-2 gap-12">
              <div className="bg-[#121212]/90 border border-white/10 rounded-[40px] p-16 flex flex-col items-center justify-center shadow-2xl">
                <p className="text-3xl text-[#86868b] font-medium uppercase tracking-widest mb-4">
                  Current Purity
                </p>
                <p className="text-[100px] font-bold text-[#18c744] leading-none drop-shadow-[0_0_30px_rgba(24,199,68,0.3)]">
                  {purityLevel}%
                </p>
              </div>
              <div className="bg-[#121212]/90 border border-white/10 rounded-[40px] p-16 flex flex-col items-center justify-center shadow-2xl">
                <p className="text-3xl text-[#86868b] font-medium uppercase tracking-widest mb-4">
                  Watch Time
                </p>
                <p className="text-[80px] font-bold text-white leading-none">
                  {hours}h {minutes}m
                </p>
              </div>
            </div>

            {/* Poster Footer */}
            <div className="mt-24 text-center">
              <p className="text-4xl text-[#86868b] italic mb-4">
                "{quote}"
              </p>
              <div className="flex items-center justify-center gap-4 mt-12 text-[#18c744] opacity-80">
                <CheckCircle2 className="w-8 h-8" />
                <span className="text-2xl font-medium tracking-widest uppercase">
                  Episodes Watched: {watched.length} / {TOTAL_EPISODES}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
