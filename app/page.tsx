'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { Download, Check, Share2, Clock } from 'lucide-react';

const seriesData = [
  { season: 1, episodes: 7 },
  { season: 2, episodes: 13 },
  { season: 3, episodes: 13 },
  { season: 4, episodes: 13 },
  { season: 5, episodes: 16 }
];

const totalEpisodes = seriesData.reduce((acc, curr) => acc + curr.episodes, 0);
const EPISODE_RUNTIME = 47; // O'rtacha 47 daqiqa

export default function BreakingBadTracker() {
  const [watchedData, setWatchedData] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  // LocalStorage'dan o'qish (Hydration xatosini oldini olish uchun)
  useEffect(() => {
    const saved = localStorage.getItem('bbVibeTracker');
    if (saved) setWatchedData(JSON.parse(saved));
    setIsClient(true);
  }, []);

  const toggleEpisode = (id: string) => {
    const newData = { ...watchedData, [id]: !watchedData[id] };
    setWatchedData(newData);
    localStorage.setItem('bbVibeTracker', JSON.stringify(newData));
  };

  const watchedCount = Object.values(watchedData).filter(Boolean).length;
  const purityLevel = watchedCount === 0 ? 0 : ((watchedCount / totalEpisodes) * 99.1).toFixed(1);
  const totalMinutes = watchedCount * EPISODE_RUNTIME;
  const watchHours = Math.floor(totalMinutes / 60);
  const watchMins = totalMinutes % 60;

  const exportPoster = async () => {
    if (posterRef.current === null) return;
    try {
      const dataUrl = await toPng(posterRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = 'breaking-bad-purity.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Eksportda xatolik:', err);
    }
  };

  if (!isClient) return null; // Server render vaqtida qora ekran turadi

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#18c744] selection:text-black font-sans pb-24 overflow-x-hidden">
      {/* Background Glow Effect */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#0F5B30] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-16">
        
        {/* Header */}
        <header className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 flex items-center justify-center gap-1"
          >
            <span className="bg-[#0F5B30] border border-[#147a40] px-2 py-1 rounded-lg text-white">Br</span>eaking
            <span className="bg-[#0F5B30] border border-[#147a40] px-2 py-1 rounded-lg text-white ml-2">Ba</span>d
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-gray-400 italic text-lg"
          >
            "Respect the chemistry."
          </motion.p>
        </header>

        {/* Stats & Progress (Apple Style Glassmorphism) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-10 shadow-2xl"
        >
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Tozalik darajasi (Purity)</p>
              <h2 className="text-3xl font-bold text-[#18c744]">{purityLevel}%</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1 flex items-center justify-end gap-1"><Clock size={14} /> Tomosha vaqti</p>
              <p className="text-lg font-medium">{watchHours}s {watchMins}d</p>
            </div>
          </div>
          
          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#0F5B30] to-[#18c744]"
              initial={{ width: 0 }}
              animate={{ width: `${(watchedCount / totalEpisodes) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          <button 
            onClick={exportPoster}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-all border border-white/5 font-medium"
          >
            <Share2 size={18} /> Natijani ulashish (Export PNG)
          </button>
        </motion.div>

        {/* Seasons List */}
        <div className="space-y-8">
          {seriesData.map((season, sIdx) => (
            <motion.div 
              key={`season-${season.season}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: sIdx * 0.1 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-[#18c744]">|</span> {season.season}-Fasl
              </h3>
              
              <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                {Array.from({ length: season.episodes }).map((_, eIdx) => {
                  const epNum = eIdx + 1;
                  const id = `S${String(season.season).padStart(2, '0')}E${String(epNum).padStart(2, '0')}`;
                  const isWatched = watchedData[id] || false;

                  return (
                    <div 
                      key={id}
                      onClick={() => toggleEpisode(id)}
                      className="group flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className={`text-base font-medium transition-all ${isWatched ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                          {epNum}-qism
                        </span>
                        <span className="text-xs text-gray-500 font-mono mt-1 tracking-wider">{id}</span>
                      </div>
                      
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isWatched ? 'bg-[#18c744] border-[#18c744]' : 'border-gray-600 group-hover:border-gray-400'}`}>
                        {isWatched && <Check size={14} className="text-black" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- HIDDEN EXPORT POSTER ELEMENT --- */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div 
          ref={posterRef} 
          className="w-[1080px] h-[1080px] bg-[#050505] p-16 flex flex-col justify-between relative overflow-hidden"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {/* Decorative Background */}
          <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-[#0F5B30] rounded-full blur-[200px] opacity-40"></div>
          
          <div className="relative z-10">
            <h1 className="text-8xl font-bold text-white tracking-tighter flex items-center gap-4 mb-4">
               <span className="bg-[#0F5B30] border-4 border-[#147a40] px-6 py-2 rounded-2xl text-white">Br</span>eaking
               <span className="bg-[#0F5B30] border-4 border-[#147a40] px-6 py-2 rounded-2xl text-white ml-2">Ba</span>d
            </h1>
            <p className="text-4xl text-gray-400 italic mt-6">"I am the one who knocks."</p>
          </div>

          <div className="relative z-10 bg-[#121212]/90 backdrop-blur-3xl border border-white/20 rounded-[40px] p-12">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-3xl text-gray-400 mb-2">Tozalik darajasi</p>
                <h2 className="text-8xl font-bold text-[#18c744]">{purityLevel}%</h2>
              </div>
              <div className="text-right">
                <p className="text-3xl text-gray-400 mb-2">Tomosha vaqti</p>
                <p className="text-5xl font-medium text-white">{watchHours}s {watchMins}d</p>
              </div>
            </div>
            <div className="h-6 w-full bg-gray-800 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-[#18c744]"
                 style={{ width: `${(watchedCount / totalEpisodes) * 100}%` }}
               />
            </div>
            <p className="text-2xl text-gray-500 mt-8 text-center">My Personal Tracker • {watchedCount}/{totalEpisodes} qism yakunlandi</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
