'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addChapterToBible, loadBible } from '@/lib/bible';
import { getClientUserId } from '@/lib/client-user';
import { getSessionJSON, getSessionText } from '@/lib/storage';

interface CreateConfig {
  userId?: string;
  style: string;
  stylePreset?: string;
  panelTemplate?: string;
  pagesPerChapter: number;
  panelsPerPage: number;
  contentRating: string;
  artDetail: string;
  colorMode: string;
}

interface ScriptPage {
  pageNumber: number;
  imagePrompt: string;
}

interface GeneratedScript {
  chapterTitle: string;
  chapterSummary?: string;
  hookTeaseLine?: string;
  pages: ScriptPage[];
}

interface PageData {
  pageNumber: number;
  imageUrl: string | null;
  status: 'queued' | 'generating' | 'complete' | 'error';
  prompt?: string;
  error?: string;
}

interface GeneratePagesResponse {
  chapterNumber: number;
  creditCost: number;
  remainingDailyCredits: number;
  pages: Array<{
    pageNumber: number;
    imageUrl: string | null;
    status: 'complete' | 'error';
    error?: string;
    prompt?: string;
  }>;
}

const HOOK_TEASE_LINES = [
  'In the next chapter, an old promise becomes a dangerous weapon.',
  'A hidden truth surfaces, and every alliance is tested.',
  'The enemy reveals a motive no one expected.',
  'One final panel shifts the entire direction of the story.',
];

export default function ChapterPage() {
  const router = useRouter();

  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showHookPanel, setShowHookPanel] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('Chapter Draft');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [hookTease, setHookTease] = useState('');
  const [phase, setPhase] = useState<'preparing' | 'script' | 'images' | 'done'>('preparing');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [creditCost, setCreditCost] = useState<number | null>(null);
  const [remainingDailyCredits, setRemainingDailyCredits] = useState<number | null>(null);
  const [publicShareUrl, setPublicShareUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const config = getSessionJSON<CreateConfig>('config');
    const synopsis = getSessionJSON<Record<string, unknown>>('synopsis');
    const characters = getSessionJSON<Array<Record<string, unknown>>>('characters');

    if (!config || !synopsis || !characters) {
      router.push('/create');
      return;
    }

    const resolvedConfig = config;
    const resolvedSynopsis = synopsis;
    const resolvedCharacters = characters;

    const bible = loadBible();
    const nextChapterNumber = (bible?.chapters?.length || 0) + 1;
    setChapterNumber(nextChapterNumber);

    const userId = resolvedConfig.userId || getClientUserId();

    async function generateChapter() {
      setError(null);
      setPhase('script');
      setProgress(8);

      try {
        const scriptResponse = await fetch('/api/generate-chapter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({
            userId,
            synopsis: resolvedSynopsis,
            characters: resolvedCharacters,
            chapterNumber: nextChapterNumber,
            style: resolvedConfig.style,
            stylePreset: resolvedConfig.stylePreset,
            panelTemplate: resolvedConfig.panelTemplate,
            pageCount: resolvedConfig.pagesPerChapter,
            panelsPerPage: resolvedConfig.panelsPerPage,
            contentRating: resolvedConfig.contentRating,
            artDetail: resolvedConfig.artDetail,
            colorMode: resolvedConfig.colorMode,
            hiddenArc: bible?.hiddenArc,
            previousChapters: bible?.chapters || [],
          }),
        });

        if (!scriptResponse.ok) {
          const payload = (await scriptResponse.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error || 'Unable to generate chapter script');
        }

        const scriptData = (await scriptResponse.json()) as { script?: GeneratedScript };
        const script = scriptData.script;
        if (!script || !Array.isArray(script.pages) || script.pages.length === 0) {
          throw new Error('Generated chapter script is empty');
        }

        setChapterTitle(script.chapterTitle || `Chapter ${nextChapterNumber}`);
        setHookTease(script.hookTeaseLine || HOOK_TEASE_LINES[Math.floor(Math.random() * HOOK_TEASE_LINES.length)]);

        const prompts = script.pages
          .sort((a, b) => a.pageNumber - b.pageNumber)
          .map((page) => page.imagePrompt);

        setTotalPages(prompts.length);
        setPages(
          prompts.map((prompt, index) => ({
            pageNumber: index + 1,
            imageUrl: null,
            status: 'generating',
            prompt,
          }))
        );

        setPhase('images');
        setProgress(30);

        const imageResponse = await fetch('/api/generate-pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({
            userId,
            chapterNumber: nextChapterNumber,
            prompts,
            concurrency: 3,
          }),
        });

        if (!imageResponse.ok) {
          const payload = (await imageResponse.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error || 'Unable to generate chapter pages');
        }

        const imageData = (await imageResponse.json()) as GeneratePagesResponse;
        setCreditCost(imageData.creditCost);
        setRemainingDailyCredits(imageData.remainingDailyCredits ?? null);

        const generatedPages = imageData.pages.map((page) => ({
          pageNumber: page.pageNumber,
          imageUrl: page.imageUrl,
          status: page.status,
          error: page.error,
          prompt: page.prompt,
        })) as PageData[];

        setPages(generatedPages);
        setCurrentPage(generatedPages.length - 1);
        setProgress(100);
        setPhase('done');
        setIsComplete(true);

        setTimeout(() => setShowHookPanel(true), 800);

        const chapterSummary = script.chapterSummary || `Generated ${generatedPages.length} pages.`;
        addChapterToBible({
          chapterNumber: nextChapterNumber,
          title: script.chapterTitle || `Chapter ${nextChapterNumber}`,
          summary: chapterSummary,
          characterStatusUpdates: [],
        });

        const draftProjectId = getSessionText('draftProjectId');
        if (draftProjectId) {
          const saveResponse = await fetch(`/api/library/${draftProjectId}/chapters`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId,
            },
            body: JSON.stringify({
              chapterNumber: nextChapterNumber,
              title: script.chapterTitle || `Chapter ${nextChapterNumber}`,
              summary: chapterSummary,
              hookTeaseLine: script.hookTeaseLine,
              pages: generatedPages,
            }),
          });

          if (!saveResponse.ok) {
            console.warn('Failed to save chapter to library');
          }
        }
      } catch (err) {
        setError((err as Error).message || 'Chapter generation failed');
        setProgress(100);
        setPhase('done');
      }
    }

    generateChapter();
  }, [router]);

  const completionStats = useMemo(() => {
    const successCount = pages.filter((page) => page.status === 'complete').length;
    const failureCount = pages.filter((page) => page.status === 'error').length;
    return { successCount, failureCount };
  }, [pages]);

  const handleShareProject = async () => {
    const draftProjectId = getSessionText('draftProjectId');
    const config = getSessionJSON<CreateConfig>('config');
    if (!draftProjectId || !config) return;

    const userId = config.userId || getClientUserId();

    try {
      const response = await fetch(`/api/library/${draftProjectId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ makePublic: true }),
      });

      if (!response.ok) throw new Error('Failed to share project');
      const data = (await response.json()) as { publicUrl?: string };
      if (data.publicUrl) {
        setPublicShareUrl(data.publicUrl);
      }
    } catch (err) {
      setError((err as Error).message || 'Unable to share project');
    }
  };

  const handlePublishToCommunity = async () => {
    const draftProjectId = getSessionText('draftProjectId');
    const config = getSessionJSON<CreateConfig>('config');
    if (!draftProjectId || !config) return;

    const userId = config.userId || getClientUserId();

    try {
      setIsPublishing(true);
      if (!publicShareUrl) {
        await handleShareProject();
      }

      const response = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          projectId: draftProjectId,
          headline: `${chapterTitle} · Chapter ${chapterNumber}`,
          tags: ['featured', config.style, config.stylePreset || 'manga'],
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'Unable to publish to community');
      }

      router.push('/community');
    } catch (err) {
      setError((err as Error).message || 'Unable to publish to community');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'cbz' | 'image-pack') => {
    const draftProjectId = getSessionText('draftProjectId');
    const config = getSessionJSON<CreateConfig>('config');
    if (!draftProjectId || !config) return;

    const userId = config.userId || getClientUserId();

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          projectId: draftProjectId,
          format,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'Export failed');
      }

      const payload = (await response.json()) as { filename: string; mimeType: string; base64: string };
      const binary = atob(payload.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: payload.mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = payload.filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message || 'Export failed');
    }
  };

  return (
    <main className="min-h-screen relative mesh-gradient">
      <div className="fixed top-6 left-6 z-50">
        <Link href="/create/characters" className="flex items-center gap-2 text-ink-light hover:text-paper-warm transition-colors group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Back to cast</span>
        </Link>
      </div>

      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-ink-deep">
        <motion.div className="h-full bg-gradient-to-r from-violet via-cyan to-cyan" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      {!isComplete && (
        <div className="fixed top-6 right-6 z-50">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-violet animate-pulse" />
            <span className="text-sm font-mono text-ink-light/75">
              {phase === 'script'
                ? 'Writing chapter script'
                : phase === 'images'
                  ? `Generating pages (${currentPage + 1}/${Math.max(totalPages, 1)})`
                  : 'Preparing'}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pt-20 pb-32">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-sm font-mono text-violet mb-2">Chapter {chapterNumber}</div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl">{chapterTitle}</h1>
          {creditCost !== null && (
            <p className="text-sm text-ink-light/65 mt-2">⚡ {creditCost} credits used</p>
          )}
          {remainingDailyCredits !== null && (
            <p className="text-xs text-ink-light/50 mt-1">Daily credits remaining: {remainingDailyCredits}</p>
          )}
        </motion.div>

        {error && (
          <div className="glass-card p-4 border border-red-400/30 text-red-200 text-sm mb-6">{error}</div>
        )}

        <div className="space-y-8">
          {pages.map((page) => (
            <motion.div
              key={page.pageNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: page.status === 'queued' ? 0.4 : 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onAnimationComplete={() => setCurrentPage(page.pageNumber - 1)}
            >
              {page.status === 'generating' ? (
                <div className="aspect-[3/4] glass-card flex items-center justify-center overflow-hidden">
                  <div className="text-center">
                    <div className="relative w-18 h-18 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border border-violet/30 animate-spin-slow" />
                      <div className="absolute inset-3 rounded-full border border-cyan/30 animate-spin-reverse" />
                    </div>
                    <p className="text-ink-light/70 text-sm font-mono">Forging page {page.pageNumber}…</p>
                  </div>
                </div>
              ) : page.status === 'complete' && page.imageUrl ? (
                <div>
                  <img src={page.imageUrl} alt={`Page ${page.pageNumber}`} className="w-full rounded-lg shadow-2xl shadow-ink-void/50" />
                  <div className="text-center mt-2 text-xs text-ink-light/40 font-mono">Page {page.pageNumber}</div>
                </div>
              ) : page.status === 'error' ? (
                <div className="aspect-[3/4] glass-card flex items-center justify-center border border-manga-red/30">
                  <div className="text-center px-4">
                    <p className="text-manga-red text-sm mb-2">Generation failed on page {page.pageNumber}</p>
                    <p className="text-xs text-ink-light/55">{page.error || 'Try regenerating this chapter.'}</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] bg-ink-deep/40 rounded-lg border border-ink-mid/20 flex items-center justify-center">
                  <span className="text-ink-light/20 text-sm font-mono">Page {page.pageNumber}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {isComplete && (
          <div className="glass-card p-5 mt-10">
            <h3 className="font-[family-name:var(--font-heading)] text-lg mb-2">Generation Summary</h3>
            <p className="text-sm text-ink-light/65">
              {completionStats.successCount} pages completed · {completionStats.failureCount} pages failed.
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showHookPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-ink-void/95 backdrop-blur-xl flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.86, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="max-w-2xl w-full text-center glass-card p-8"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border border-violet/25 mb-6">
                <span className="font-[family-name:var(--font-heading)] text-lg text-paper-warm/90">Chapter {chapterNumber} Complete</span>
              </div>

              <p className="text-lg text-ink-light/75 italic mb-8 leading-relaxed">“{hookTease || HOOK_TEASE_LINES[Math.floor(Math.random() * HOOK_TEASE_LINES.length)]}”</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <button onClick={() => setShowHookPanel(false)} className="px-4 py-3 rounded-lg btn-ghost text-sm">
                  Continue Reading
                </button>
                <button onClick={handleShareProject} className="px-4 py-3 rounded-lg btn-ghost text-sm">
                  Share Public Link
                </button>
                <button onClick={() => handleExport('pdf')} className="px-4 py-3 rounded-lg btn-ghost text-sm">
                  Export PDF
                </button>
                <button onClick={() => handleExport('cbz')} className="px-4 py-3 rounded-lg btn-ghost text-sm">
                  Export CBZ
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <button onClick={() => handleExport('image-pack')} className="px-4 py-3 rounded-lg btn-ghost text-sm">
                  Export Image Pack
                </button>
                <button
                  onClick={handlePublishToCommunity}
                  disabled={isPublishing}
                  className="px-4 py-3 rounded-lg btn-primary text-sm disabled:opacity-50"
                >
                  {isPublishing ? 'Publishing…' : 'Publish to Community'}
                </button>
              </div>

              {publicShareUrl && (
                <div className="mt-5 text-xs text-cyan/80">
                  Public URL: <Link href={publicShareUrl} className="underline">{publicShareUrl}</Link>
                </div>
              )}

              <button
                onClick={() => router.push('/library')}
                className="mt-6 px-8 py-3 rounded-xl btn-primary font-[family-name:var(--font-heading)] font-semibold text-base"
              >
                Go to Library
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
