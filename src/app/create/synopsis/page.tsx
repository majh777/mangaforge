'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { loadBible, updateBible } from '@/lib/bible';

interface ChapterEntry {
  number: number;
  title: string;
  summary: string;
  hookType: string;
}

interface SynopsisData {
  title: string;
  alternativeTitles?: string[];
  logline: string;
  genres: string[];
  synopsis: string;
  themes: string[];
  setting: string;
  chapterBreakdown?: ChapterEntry[];
  hiddenArc?: string;
  estimatedChapters?: number;
  toneKeywords?: string[];
}

function normalizeSynopsis(data: Record<string, unknown>): SynopsisData {
  const genres = Array.isArray(data.genres)
    ? data.genres
    : typeof data.genre === 'string'
      ? (data.genre as string).split(/,\s*/)
      : [];
  return {
    title: (data.title as string) || 'Untitled',
    alternativeTitles: Array.isArray(data.alternativeTitles) ? data.alternativeTitles : [],
    logline: (data.logline as string) || '',
    genres,
    synopsis: (data.synopsis as string) || '',
    themes: Array.isArray(data.themes) ? data.themes : [],
    setting: (data.setting as string) || '',
    chapterBreakdown: Array.isArray(data.chapterBreakdown) ? data.chapterBreakdown : [],
    hiddenArc: (data.hiddenArc as string) || undefined,
    estimatedChapters: (data.estimatedChapters as number) || undefined,
    toneKeywords: Array.isArray(data.toneKeywords) ? data.toneKeywords : [],
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
  const [synopsis, setSynopsis] = useState<SynopsisData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSynopsis, setEditedSynopsis] = useState('');
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHiddenArc, setShowHiddenArc] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('mangaforge_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      setConfig(parsed);
      setUserPrompt(parsed.prompt || '');
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
        setError(null);
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

        // Update the story bible with synopsis data
        updateBible({
          synopsis: raw,
          hiddenArc: data.hiddenArc,
          chapterBreakdown: data.chapterBreakdown,
        });

        setTimeout(() => setIsGenerating(false), 800);
      } catch (err) {
        console.error('Synopsis generation error:', err);
        setError('Failed to generate synopsis. Please try again.');
        setProgress(0);
        setIsGenerating(false);
      }
    };

    const timer = setTimeout(generate, 500);
    return () => clearTimeout(timer);
  }, [config]);

  const handleValidate = () => {
    if (!synopsis) return;
    const finalSynopsis = {
      ...synopsis,
      synopsis: isEditing ? editedSynopsis : synopsis.synopsis,
    };
    sessionStorage.setItem('mangaforge_synopsis', JSON.stringify(finalSynopsis));
    updateBible({
      synopsis: finalSynopsis,
      hiddenArc: synopsis.hiddenArc,
      chapterBreakdown: synopsis.chapterBreakdown,
    });
    router.push('/create/characters');
  };

  const handleRegenerate = () => {
    setSynopsis(null);
    setError(null);
    setIsGenerating(true);
    setProgress(0);
    setStage(0);
  };

  return (
    <main className="min-h-screen relative mesh-gradient">
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-32">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="relative w-48 h-48 mb-12">
                <div className="absolute inset-0 rounded-full border border-violet/20 animate-spin-slow" />
                <div className="absolute inset-4 rounded-full border border-cyan/20 animate-spin-reverse" />
                <div className="absolute inset-8 rounded-full border border-cyan/15 animate-spin-slow" style={{ animationDuration: '3s' }} />
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
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet/20 to-cyan/20 backdrop-blur-sm animate-pulse" />
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
                  className="h-full bg-gradient-to-r from-violet via-cyan to-cyan rounded-full"
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
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="glass-panel p-12 text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-manga-red/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-manga-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="font-[family-name:var(--font-heading)] text-xl mb-3">Generation Failed</h2>
                <p className="text-ink-light/50 text-sm mb-6">{error}</p>
                <button
                  onClick={handleRegenerate}
                  className="px-8 py-3 rounded-xl btn-primary font-[family-name:var(--font-heading)]"
                >
                  Try Again
                </button>
              </div>
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

              {/* Original prompt reminder */}
              {userPrompt && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-4 mb-8 max-w-3xl mx-auto"
                >
                  <p className="text-xs font-mono text-ink-light/40 mb-1 uppercase tracking-wider">Your Prompt</p>
                  <p className="text-sm text-ink-light/60 italic">&ldquo;{userPrompt}&rdquo;</p>
                </motion.div>
              )}

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

                  {synopsis.alternativeTitles && synopsis.alternativeTitles.length > 0 && (
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
                    {synopsis.toneKeywords?.map((t) => (
                      <span key={t} className="px-3 py-1 rounded-full bg-cyan/10 text-cyan text-sm border border-cyan/20">
                        {t}
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

                  {/* Chapter Breakdown */}
                  {synopsis.chapterBreakdown && synopsis.chapterBreakdown.length > 0 && (
                    <motion.div
                      className="mt-8 pt-6 border-t border-ink-mid/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <h4 className="font-semibold text-ink-light/40 text-sm uppercase tracking-wider mb-4">
                        Chapter Breakdown ({synopsis.estimatedChapters || synopsis.chapterBreakdown.length} chapters)
                      </h4>
                      <div className="space-y-3">
                        {synopsis.chapterBreakdown.map((ch) => (
                          <div key={ch.number} className="flex gap-3 text-sm">
                            <span className="font-mono text-violet shrink-0 w-6 text-right">{ch.number}</span>
                            <div className="flex-1">
                              <span className="text-paper-warm/80 font-medium">{ch.title}</span>
                              <p className="text-ink-light/40 text-xs mt-0.5">{ch.summary}</p>
                            </div>
                            <span className="text-xs text-cyan/50 shrink-0">{ch.hookType}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Hidden Arc — spoiler */}
                  {synopsis.hiddenArc && (
                    <motion.div
                      className="mt-8 pt-6 border-t border-ink-mid/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      <button
                        onClick={() => setShowHiddenArc(!showHiddenArc)}
                        className="flex items-center gap-2 text-sm text-ink-light/40 hover:text-paper-warm transition-colors"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${showHiddenArc ? 'rotate-90' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="font-semibold uppercase tracking-wider">Hidden Arc</span>
                        <span className="text-xs text-manga-red/50">(Spoiler)</span>
                      </button>
                      <AnimatePresence>
                        {showHiddenArc && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="mt-3 text-sm text-ink-light/50 italic leading-relaxed p-4 rounded-lg bg-manga-red/5 border border-manga-red/10">
                              {synopsis.hiddenArc}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              )}

              <motion.div
                className="flex flex-wrap justify-center gap-4 mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
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
