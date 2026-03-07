'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSessionJSON, getSessionText, setSessionJSON } from '@/lib/storage';
import { getClientUserId } from '@/lib/client-user';
import { updateBible } from '@/lib/bible';

interface CreateConfig {
  userId?: string;
  prompt: string;
  style: string;
  pagesPerChapter: number;
  panelsPerPage: number;
  contentRating: string;
  artDetail: string;
  colorMode: string;
  stylePreset?: string;
  panelTemplate?: string;
}

interface Synopsis {
  title: string;
  alternativeTitles: string[];
  logline: string;
  genres: string[];
  synopsis: string;
  themes: string[];
  setting: string;
  chapterBreakdown?: Array<{ number: number; title: string; summary: string; hookType: string }>;
  hiddenArc?: string;
}

function normalizeSynopsis(data: Record<string, unknown>): Synopsis {
  const genres = Array.isArray(data.genres)
    ? data.genres
    : typeof data.genre === 'string'
      ? data.genre.split(/,\s*/)
      : [];

  return {
    title: (data.title as string) || 'Untitled',
    alternativeTitles: Array.isArray(data.alternativeTitles)
      ? (data.alternativeTitles as string[])
      : [],
    logline: (data.logline as string) || '',
    genres,
    synopsis: (data.synopsis as string) || '',
    themes: Array.isArray(data.themes) ? (data.themes as string[]) : [],
    setting: (data.setting as string) || '',
    chapterBreakdown: Array.isArray(data.chapterBreakdown)
      ? (data.chapterBreakdown as Array<{ number: number; title: string; summary: string; hookType: string }> )
      : [],
    hiddenArc: typeof data.hiddenArc === 'string' ? data.hiddenArc : '',
  };
}

const GENERATION_STAGES = [
  { text: 'Analyzing your concept…', duration: 2200 },
  { text: 'Building world rules and character stakes…', duration: 2600 },
  { text: 'Designing chapter hooks and narrative beats…', duration: 2400 },
  { text: 'Finalizing synopsis and hidden arc…', duration: 2200 },
];

const TIPS = [
  'Great comic hooks usually combine revelation + emotional consequence.',
  'Strong chapter endings often raise one answer and two new questions.',
  'A hidden arc works best when each chapter subtly reinforces it.',
  'Visual pacing matters: alternate dense pages with breathing space.',
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
  const [config, setConfig] = useState<CreateConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestNonce, setRequestNonce] = useState(0);

  useEffect(() => {
    const saved = getSessionJSON<CreateConfig>('config');
    if (saved) {
      setConfig(saved);
    } else {
      router.push('/create');
    }
  }, [router]);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setProgress((current) => Math.min(current + 0.8, 95));
    }, 100);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) return;
    const timers = GENERATION_STAGES.map((item, index) => {
      const delay = GENERATION_STAGES
        .slice(0, index)
        .reduce((sum, current) => sum + current.duration, 0);
      return setTimeout(() => setStage(index), delay);
    });
    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((index) => (index + 1) % TIPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const configSignature = useMemo(() => JSON.stringify(config), [config]);

  useEffect(() => {
    if (!configSignature || !config) return;

    const userId = config.userId || getClientUserId();
    const controller = new AbortController();

    async function generate() {
      setError(null);
      setSynopsis(null);
      setIsGenerating(true);
      setProgress(0);
      setStage(0);

      try {
        const response = await fetch('/api/generate-synopsis', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({ ...config, userId }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error || 'Could not generate synopsis');
        }

        const raw = (await response.json()) as Record<string, unknown>;
        const normalized = normalizeSynopsis(raw);

        setSynopsis(normalized);
        setEditedSynopsis(normalized.synopsis);
        setProgress(100);
        setTimeout(() => setIsGenerating(false), 450);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;

        setError((err as Error).message || 'Could not generate synopsis');
        const fallback: Synopsis = {
          title: 'Untitled Project',
          alternativeTitles: [],
          logline: config.prompt,
          genres: ['Adventure'],
          synopsis:
            'We could not reach the generation service. You can still continue and edit this text manually.',
          themes: ['Discovery'],
          setting: 'To be defined',
          chapterBreakdown: [],
          hiddenArc: '',
        };
        setSynopsis(fallback);
        setEditedSynopsis(fallback.synopsis);
        setProgress(100);
        setTimeout(() => setIsGenerating(false), 300);
      }
    }

    generate();

    return () => controller.abort();
  }, [configSignature, config, requestNonce]);

  const handleValidate = async () => {
    if (!synopsis || !config) return;

    const resolved = {
      ...synopsis,
      synopsis: isEditing ? editedSynopsis : synopsis.synopsis,
    };

    setSessionJSON('synopsis', resolved);

    updateBible({
      synopsis: resolved,
      hiddenArc: resolved.hiddenArc,
      chapterBreakdown: resolved.chapterBreakdown,
    });

    const draftProjectId = getSessionText('draftProjectId');
    const userId = config.userId || getClientUserId();

    if (draftProjectId) {
      fetch(`/api/library/${draftProjectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          title: resolved.title,
          synopsis: resolved,
          status: 'in_progress',
        }),
      }).catch(() => {
        // Non-blocking patch.
      });
    }

    router.push('/create/characters');
  };

  const handleRegenerate = async () => {
    setRequestNonce((nonce) => nonce + 1);
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

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-28">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -24 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="relative w-40 h-40 mb-10">
                <div className="absolute inset-0 rounded-full border border-violet/25 animate-spin-slow" />
                <div className="absolute inset-5 rounded-full border border-cyan/20 animate-spin-reverse" />
                <div className="absolute inset-10 rounded-full border border-violet/15 animate-spin-slow" style={{ animationDuration: '5s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet/30 to-cyan/30 animate-pulse" />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={stage}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-xl font-[family-name:var(--font-heading)] text-paper-warm/90 font-light mb-8 text-center"
                >
                  {GENERATION_STAGES[stage]?.text}
                </motion.p>
              </AnimatePresence>

              <div className="w-80 h-1.5 bg-ink-wash rounded-full overflow-hidden mb-6">
                <motion.div className="h-full bg-gradient-to-r from-violet via-cyan to-cyan rounded-full" style={{ width: `${progress}%` }} />
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-ink-light/75 italic max-w-md text-center"
                >
                  {TIPS[tipIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-forest-green/30 text-forest-green text-sm mb-4"
                >
                  ✓ Synopsis ready
                </motion.div>
                <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light">Narrative Blueprint</h1>
              </div>

              {error && (
                <div className="glass-card p-4 text-sm text-red-200 border border-red-400/30 mb-6">{error}</div>
              )}

              {synopsis && (
                <div className="glass-panel p-7 md:p-10 max-w-3xl mx-auto">
                  <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl text-center mb-2 gradient-text">
                    {synopsis.title}
                  </h2>

                  {synopsis.alternativeTitles?.length > 0 && (
                    <p className="text-center text-sm text-ink-light/55 mb-5 italic">
                      Alt: {synopsis.alternativeTitles.join(' · ')}
                    </p>
                  )}

                  <p className="text-center text-lg italic text-ink-light/80 mb-7 border-b border-ink-mid/20 pb-5">
                    “{synopsis.logline}”
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mb-7">
                    {synopsis.genres.map((genre) => (
                      <span key={genre} className="px-3 py-1 rounded-full bg-violet/10 text-violet text-sm border border-violet/25">
                        {genre}
                      </span>
                    ))}
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editedSynopsis}
                      onChange={(event) => setEditedSynopsis(event.target.value)}
                      rows={12}
                      className="w-full input-glass p-4 text-paper-warm resize-none leading-relaxed"
                    />
                  ) : (
                    <div className="text-paper-warm/85 leading-relaxed whitespace-pre-line">{synopsis.synopsis}</div>
                  )}

                  <div className="mt-8 pt-6 border-t border-ink-mid/15 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-ink-light/55 text-sm uppercase tracking-wider mb-2">Themes</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {synopsis.themes.map((theme) => (
                          <span key={theme} className="px-2 py-0.5 text-xs rounded bg-ink-wash/60 text-ink-light/75">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink-light/55 text-sm uppercase tracking-wider mb-2">Setting</h4>
                      <p className="text-sm text-ink-light/75">{synopsis.setting}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-3 mt-9">
                <button
                  onClick={handleValidate}
                  className="px-9 py-4 rounded-xl btn-primary font-[family-name:var(--font-heading)] font-semibold text-lg glow-pulse-cta hover:scale-105 transition-transform"
                >
                  Validate & Continue
                </button>
                <button
                  onClick={() => setIsEditing((editing) => !editing)}
                  className="px-6 py-4 rounded-xl btn-ghost font-[family-name:var(--font-heading)]"
                >
                  {isEditing ? 'Save edits' : 'Edit'}
                </button>
                <button onClick={handleRegenerate} className="px-6 py-4 rounded-xl btn-ghost font-[family-name:var(--font-heading)]">
                  Regenerate
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
