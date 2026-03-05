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
  { text: 'Gathering inspiration\u2026', duration: 3000 },
  { text: 'Weaving the narrative\u2026', duration: 4000 },
  { text: 'Building worlds\u2026', duration: 3000 },
  { text: 'Breathing life into your story\u2026', duration: 3000 },
];

const TIPS = [
  'Manga artists typically draft 15-20 pages per week for weekly serialization.',
  'The word "manga" (\u6F2B\u753B) literally means "whimsical drawings."',
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

  useEffect(() => {
    const saved = sessionStorage.getItem('mangaforge_config');
    if (saved) {
      setConfig(JSON.parse(saved));
    } else {
      router.push('/create');
    }
  }, [router]);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 0.8, 95));
    }, 100);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) return;
    const timers = GENERATION_STAGES.map((s, i) => {
      const delay = GENERATION_STAGES.slice(0, i).reduce((sum, st) => sum + st.duration, 0);
      return setTimeout(() => setStage(i), delay);
    });
    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
        setTimeout(() => setIsGenerating(false), 800);
      } catch (err) {
        console.error('Synopsis generation error:', err);
        const demo: Synopsis = {
          title: 'The Forge of Shadows',
          alternativeTitles: ['Shadow Forge', 'The Ink Between Worlds'],
          logline: 'A young blacksmith discovers her forge can shape not just metal, but the fabric of reality itself.',
          genres: ['Fantasy', 'Action', 'Coming of Age'],
          synopsis: `In the mountain city of Kurogane, fifteen-year-old Akari inherits her grandfather's ancient forge. What she discovers inside changes everything \u2014 the forge doesn't just shape metal. It shapes reality.\n\nWhen she accidentally forges a blade that cuts through dimensions, she attracts the attention of the Shadow Weavers, an ancient order that has guarded the boundary between worlds for centuries. They offer her a choice: join them, or have her memories erased.\n\nBut Akari is no ordinary blacksmith. The fire in her forge burns with a light that hasn't been seen in a thousand years \u2014 the Primordial Flame, capable of rewriting the laws of existence itself. And the Shadow Weavers aren't the only ones who want it.`,
          themes: ['Identity', 'Legacy', 'Power & Responsibility'],
          setting: 'A fantastical version of feudal Japan where master craftsmen can imbue objects with supernatural properties.',
        };
        setSynopsis(demo);
        setEditedSynopsis(demo.synopsis);
        setProgress(100);
        setTimeout(() => setIsGenerating(false), 800);
      }
    };

    const timer = setTimeout(generate, 500);
    return () => clearTimeout(timer);
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
    <main className="min-h-screen relative mesh-gradient">
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
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              {/* Orbiting particles */}
              <div className="relative w-48 h-48 mb-12">
                <div className="absolute inset-0 rounded-full border border-violet/20 animate-spin-slow" />
                <div className="absolute inset-4 rounded-full border border-pink/20 animate-spin-reverse" />
                <div className="absolute inset-8 rounded-full border border-cyan/15 animate-spin-slow" style={{ animationDuration: '3s' }} />
                {/* Orbiting dots */}
                <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '4s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-violet" />
                </div>
                <div className="absolute inset-0 animate-spin-reverse" style={{ animationDuration: '6s' }}>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-pink" />
                </div>
                <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '8s' }}>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet/20 to-pink/20 backdrop-blur-sm animate-pulse" />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={stage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl font-[family-name:var(--font-heading)] text-paper-warm/80 font-light mb-8"
                >
                  {GENERATION_STAGES[stage]?.text}
                </motion.p>
              </AnimatePresence>

              <div className="w-80 h-1 bg-ink-wash rounded-full overflow-hidden mb-8">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet via-pink to-cyan rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-ink-light italic max-w-md text-center"
                >
                  {TIPS[tipIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          ) : (
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-forest-green/20 text-forest-green text-sm mb-4"
                >
                  &#10003; Synopsis Generated
                </motion.div>
                <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light">The Blueprint</h1>
              </div>

              {synopsis && (
                <div className="glass-panel p-8 md:p-12 max-w-3xl mx-auto">
                  <motion.h2
                    className="font-[family-name:var(--font-display)] text-3xl md:text-4xl text-center mb-2 gradient-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {synopsis.title}
                  </motion.h2>

                  {synopsis.alternativeTitles?.length > 0 && (
                    <p className="text-center text-sm text-ink-light/40 mb-6 italic">
                      Alt: {synopsis.alternativeTitles.join(' \u00B7 ')}
                    </p>
                  )}

                  <motion.p
                    className="text-center text-lg italic text-ink-light/60 mb-8 border-b border-ink-mid/10 pb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    &ldquo;{synopsis.logline}&rdquo;
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap justify-center gap-2 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {synopsis.genres.map((g) => (
                      <span key={g} className="px-3 py-1 rounded-full bg-violet/10 text-violet text-sm border border-violet/20">
                        {g}
                      </span>
                    ))}
                  </motion.div>

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
                        className="w-full input-glass p-4 text-paper-warm/80 resize-none leading-relaxed"
                      />
                    ) : (
                      <div className="text-paper-warm/70 leading-relaxed whitespace-pre-line">
                        {synopsis.synopsis}
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    className="mt-8 pt-6 border-t border-ink-mid/10 grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div>
                      <h4 className="font-semibold text-ink-light/40 text-sm uppercase tracking-wider mb-2">Themes</h4>
                      <div className="flex flex-wrap gap-1">
                        {synopsis.themes.map((t) => (
                          <span key={t} className="px-2 py-0.5 text-xs rounded bg-ink-wash/50 text-ink-light/60">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink-light/40 text-sm uppercase tracking-wider mb-2">Setting</h4>
                      <p className="text-sm text-ink-light/50">{synopsis.setting}</p>
                    </div>
                  </motion.div>
                </div>
              )}

              <motion.div
                className="flex flex-wrap justify-center gap-4 mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  onClick={handleValidate}
                  className="px-10 py-4 rounded-xl btn-primary font-[family-name:var(--font-heading)] font-semibold text-lg glow-pulse-cta hover:scale-105 transition-transform"
                >
                  Validate &amp; Continue
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-4 rounded-xl btn-ghost font-[family-name:var(--font-heading)]"
                >
                  {isEditing ? 'Save Edits' : 'Edit'}
                </button>
                <button
                  onClick={handleRegenerate}
                  className="px-6 py-4 rounded-xl btn-ghost font-[family-name:var(--font-heading)]"
                >
                  Regenerate
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
