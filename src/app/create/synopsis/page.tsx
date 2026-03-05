'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Synopsis {
  title: string;
  alternativeTitles: string[];
  logline: string;
  genres: string[];
  synopsis: string;
  themes: string[];
  setting: string;
}

// Normalize API response to match Synopsis interface
function normalizeSynopsis(data: Record<string, unknown>): Synopsis {
  const genres = Array.isArray(data.genres)
    ? data.genres
    : typeof data.genre === 'string'
      ? data.genre.split(/,\s*/)
      : [];
  return {
    title: (data.title as string) || 'Untitled',
    alternativeTitles: Array.isArray(data.alternativeTitles) ? data.alternativeTitles : [],
    logline: (data.logline as string) || '',
    genres,
    synopsis: (data.synopsis as string) || '',
    themes: Array.isArray(data.themes) ? data.themes : [],
    setting: (data.setting as string) || '',
  };
}

const GENERATION_STAGES = [
  { text: 'Gathering inspiration…', icon: '✨', duration: 3000 },
  { text: 'Weaving the narrative…', icon: '🕸️', duration: 4000 },
  { text: 'Building worlds…', icon: '🌍', duration: 3000 },
  { text: 'Breathing life into your story…', icon: '💫', duration: 3000 },
];

const TIPS = [
  'Manga artists typically draft 15-20 pages per week for weekly serialization.',
  'The word "manga" (漫画) literally means "whimsical drawings."',
  'One Piece has sold over 500 million copies worldwide.',
  'The first manga magazine, Eshinbun Nipponchi, was published in 1874.',
  'Screentones were originally physical adhesive sheets that artists would cut and apply by hand.',
];

export default function SynopsisPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(true);
  const [stage, setStage] = useState(0);
  const [synopsis, setSynopsis] = useState<Synopsis | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSynopsis, setEditedSynopsis] = useState('');
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);

  // Load config
  useEffect(() => {
    const saved = sessionStorage.getItem('mangaforge_config');
    if (saved) {
      setConfig(JSON.parse(saved));
    } else {
      router.push('/create');
    }
  }, [router]);

  // Progress animation
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 0.8, 95));
    }, 100);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Stage progression
  useEffect(() => {
    if (!isGenerating) return;
    const timers = GENERATION_STAGES.map((s, i) => {
      const delay = GENERATION_STAGES.slice(0, i).reduce((sum, st) => sum + st.duration, 0);
      return setTimeout(() => setStage(i), delay);
    });
    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  // Tip rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Generate synopsis
  useEffect(() => {
    if (!config) return;

    const generate = async () => {
      try {
        const res = await fetch('/api/generate-synopsis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        });

        if (!res.ok) throw new Error('Generation failed');

        const raw = await res.json();
        const data = normalizeSynopsis(raw);
        setSynopsis(data);
        setEditedSynopsis(data.synopsis);
        setProgress(100);

        // Small delay for dramatic effect
        setTimeout(() => setIsGenerating(false), 800);
      } catch (err) {
        console.error('Synopsis generation error:', err);
        // Fallback demo synopsis
        const demo: Synopsis = {
          title: 'The Forge of Shadows',
          alternativeTitles: ['Shadow Forge', 'The Ink Between Worlds'],
          logline: 'A young blacksmith discovers her forge can shape not just metal, but the fabric of reality itself.',
          genres: ['Fantasy', 'Action', 'Coming of Age'],
          synopsis: `In the mountain city of Kurogane, fifteen-year-old Akari inherits her grandfather's ancient forge. What she discovers inside changes everything — the forge doesn't just shape metal. It shapes reality.\n\nWhen she accidentally forges a blade that cuts through dimensions, she attracts the attention of the Shadow Weavers, an ancient order that has guarded the boundary between worlds for centuries. They offer her a choice: join them, or have her memories erased.\n\nBut Akari is no ordinary blacksmith. The fire in her forge burns with a light that hasn't been seen in a thousand years — the Primordial Flame, capable of rewriting the laws of existence itself. And the Shadow Weavers aren't the only ones who want it.`,
          themes: ['Identity', 'Legacy', 'Power & Responsibility'],
          setting: 'A fantastical version of feudal Japan where master craftsmen can imbue objects with supernatural properties.',
        };
        setSynopsis(demo);
        setEditedSynopsis(demo.synopsis);
        setProgress(100);
        setTimeout(() => setIsGenerating(false), 800);
      }
    };

    // Minimum animation time
    const minDelay = GENERATION_STAGES.reduce((sum, s) => sum + s.duration, 0);
    const timer = setTimeout(generate, 500);

    // Ensure minimum visual duration
    const minTimer = setTimeout(() => {
      // Generation might complete before animation; we wait for both
    }, minDelay);

    return () => {
      clearTimeout(timer);
      clearTimeout(minTimer);
    };
  }, [config]);

  const handleValidate = () => {
    if (!synopsis) return;
    sessionStorage.setItem('mangaforge_synopsis', JSON.stringify({
      ...synopsis,
      synopsis: isEditing ? editedSynopsis : synopsis.synopsis,
    }));
    router.push('/create/characters');
  };

  const handleRegenerate = async () => {
    setSynopsis(null);
    setIsGenerating(true);
    setProgress(0);
    setStage(0);
  };

  return (
    <main className="min-h-screen relative">
      {/* Back nav */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/create" className="flex items-center gap-2 text-ink-light hover:text-paper-warm transition-colors group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Back to prompt</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-32">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            /* ===== GENERATION ANIMATION ===== */
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              {/* Spinning ritual circle */}
              <div className="relative w-48 h-48 mb-12">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-sakura-pink/20"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border-2 border-neon-cyan/30"
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-8 rounded-full border border-gold-premium/20"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-5xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {GENERATION_STAGES[stage]?.icon}
                </motion.div>
              </div>

              {/* Stage text */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={stage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl font-[family-name:var(--font-heading)] text-paper-warm mb-8"
                >
                  {GENERATION_STAGES[stage]?.text}
                </motion.p>
              </AnimatePresence>

              {/* Progress bar (ink brush stroke) */}
              <div className="w-80 h-1.5 bg-ink-wash rounded-full overflow-hidden mb-8">
                <motion.div
                  className="h-full bg-gradient-to-r from-sakura-pink via-neon-cyan to-sakura-pink rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Fun tips */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-ink-light italic max-w-md text-center"
                >
                  💡 {TIPS[tipIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          ) : (
            /* ===== SYNOPSIS RESULT ===== */
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest-green/10 border border-forest-green/20 text-forest-green text-sm mb-4"
                >
                  ✓ Synopsis Generated
                </motion.div>
                <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl">The Blueprint</h1>
              </div>

              {synopsis && (
                <div className="manuscript-card p-8 md:p-12 max-w-3xl mx-auto">
                  {/* Title */}
                  <motion.h2
                    className="font-[family-name:var(--font-display)] text-3xl md:text-4xl text-center mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ color: '#1A1A2E' }}
                  >
                    {synopsis.title}
                  </motion.h2>

                  {/* Alternative titles */}
                  {synopsis.alternativeTitles?.length > 0 && (
                    <p className="text-center text-sm text-gray-500 mb-6 italic">
                      Alt: {synopsis.alternativeTitles.join(' · ')}
                    </p>
                  )}

                  {/* Logline */}
                  <motion.p
                    className="text-center text-lg italic text-gray-600 mb-8 border-b border-gray-200 pb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    &ldquo;{synopsis.logline}&rdquo;
                  </motion.p>

                  {/* Genre tags */}
                  <motion.div
                    className="flex flex-wrap justify-center gap-2 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {synopsis.genres.map((g) => (
                      <span key={g} className="px-3 py-1 rounded-full bg-sakura-pink/10 text-sakura-pink text-sm border border-sakura-pink/20">
                        {g}
                      </span>
                    ))}
                  </motion.div>

                  {/* Synopsis text */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {isEditing ? (
                      <textarea
                        value={editedSynopsis}
                        onChange={(e) => setEditedSynopsis(e.target.value)}
                        rows={12}
                        className="w-full bg-white/80 border border-gray-300 rounded-lg p-4 text-gray-800 focus:border-sakura-pink focus:outline-none resize-none leading-relaxed"
                      />
                    ) : (
                      <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-line">
                        {synopsis.synopsis}
                      </div>
                    )}
                  </motion.div>

                  {/* Themes & Setting */}
                  <motion.div
                    className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div>
                      <h4 className="font-semibold text-gray-600 text-sm uppercase tracking-wider mb-2">Themes</h4>
                      <div className="flex flex-wrap gap-1">
                        {synopsis.themes.map((t) => (
                          <span key={t} className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-600 text-sm uppercase tracking-wider mb-2">Setting</h4>
                      <p className="text-sm text-gray-600">{synopsis.setting}</p>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Actions */}
              <motion.div
                className="flex flex-wrap justify-center gap-4 mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  onClick={handleValidate}
                  className="px-10 py-4 rounded-xl bg-sakura-pink text-paper-pure font-[family-name:var(--font-heading)] font-semibold text-lg sakura-glow-pulse hover:bg-sakura-soft transition-all hover:scale-105"
                >
                  ✓ Validate & Continue
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-4 rounded-xl bg-ink-wash text-paper-warm border border-ink-mid hover:bg-ink-mid transition-all font-[family-name:var(--font-heading)]"
                >
                  {isEditing ? '💾 Save Edits' : '✏️ Edit'}
                </button>
                <button
                  onClick={handleRegenerate}
                  className="px-6 py-4 rounded-xl bg-ink-wash text-paper-warm border border-ink-mid hover:bg-ink-mid transition-all font-[family-name:var(--font-heading)]"
                >
                  🔄 Regenerate
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
