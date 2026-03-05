'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface PageData {
  pageNumber: number;
  imageUrl: string | null;
  status: 'queued' | 'generating' | 'complete' | 'error';
}

const HOOK_TEASE_LINES = [
  'In the next chapter, someone tells a truth that can never be taken back.',
  'What they find changes the meaning of every chapter before this one.',
  'The person who betrayed them is closer than anyone imagined.',
  'Not everyone will survive what comes next.',
  'A promise made in fire. A price paid in blood.',
];

export default function ChapterPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showHookPanel, setShowHookPanel] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('The Forge Awakens');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const configData = sessionStorage.getItem('mangaforge_config');
    if (configData) {
      const c = JSON.parse(configData);
      setConfig(c);
      const numPages = c.pagesPerChapter || 20;
      setTotalPages(numPages);

      const initialPages: PageData[] = Array.from({ length: numPages }, (_, i) => ({
        pageNumber: i + 1,
        imageUrl: null,
        status: i === 0 ? 'generating' : 'queued',
      }));
      setPages(initialPages);
      generatePages(numPages, c);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generatePages = async (numPages: number, conf: Record<string, unknown>) => {
    const synopsis = JSON.parse(sessionStorage.getItem('mangaforge_synopsis') || '{}');
    const characters = JSON.parse(sessionStorage.getItem('mangaforge_characters') || '[]');

    for (let i = 0; i < numPages; i++) {
      setCurrentPage(i);
      setPages(prev => prev.map((p, idx) =>
        idx === i ? { ...p, status: 'generating' } : p
      ));

      try {
        const pagePrompt = buildPagePrompt(i, numPages, conf, synopsis, characters);
        const res = await fetch('/api/generate-portrait', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visualPrompt: pagePrompt,
            style: conf.style,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setPages(prev => prev.map((p, idx) =>
            idx === i ? { ...p, imageUrl: data.image, status: 'complete' } : p
          ));
        } else {
          setPages(prev => prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error' } : p
          ));
        }
      } catch {
        setPages(prev => prev.map((p, idx) =>
          idx === i ? { ...p, status: 'error' } : p
        ));
      }

      await new Promise(r => setTimeout(r, 500));
    }

    setIsComplete(true);
    setTimeout(() => setShowHookPanel(true), 3000);
  };

  const buildPagePrompt = (
    pageIndex: number,
    total: number,
    conf: Record<string, unknown>,
    synopsis: Record<string, unknown>,
    characters: Array<Record<string, unknown>>
  ): string => {
    const style = conf.style as string;
    const isFirstPage = pageIndex === 0;
    const isLastPage = pageIndex === total - 1;
    const panelsPerPage = (conf.panelsPerPage as number) || 6;
    const charNames = characters.map((c: Record<string, unknown>) => c.name as string).join(', ');

    if (isFirstPage) {
      return `A manga title page for Chapter 1: "${chapterTitle}". ${style} manga art style, black and white with screentones. Dramatic title typography with the chapter name. Characters: ${charNames}. Story: ${(synopsis.logline as string) || ''}. Professional manga quality with decorative borders.`;
    }
    if (isLastPage) {
      return `The final page of a manga chapter in ${style} style, black and white with screentones. ${panelsPerPage - 1} panels building to a dramatic cliffhanger. The last panel should be a dramatic splash showing a shocking revelation or intense moment. Characters: ${charNames}. Professional manga quality with speed lines and impact effects. All text in English.`;
    }
    const pageType = pageIndex < 3 ? 'establishing' :
                     pageIndex < total * 0.4 ? 'rising action' :
                     pageIndex < total * 0.7 ? 'confrontation' :
                     'climax build-up';
    return `A full manga page in ${style} style, black and white ink with screentones. ${panelsPerPage} panels showing ${pageType} scenes. Characters: ${charNames}. Page ${pageIndex + 1} of ${total}. Dynamic panel layouts, varied shot angles (close-up, wide, medium), expressive character art, atmospheric backgrounds. All dialogue in English speech bubbles. Professional manga quality.`;
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

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-ink-deep">
        <motion.div
          className="h-full bg-gradient-to-r from-violet via-cyan to-cyan"
          animate={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Status bar */}
      {!isComplete && (
        <div className="fixed top-6 right-6 z-50">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-violet animate-pulse" />
            <span className="text-sm font-mono text-ink-light/60">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="max-w-3xl mx-auto px-4 pt-20 pb-32">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm font-mono text-violet mb-2">Chapter 1</div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl">{chapterTitle}</h1>
        </motion.div>

        <div className="space-y-8">
          {pages.map((page) => (
            <motion.div
              key={page.pageNumber}
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: page.status === 'queued' ? 0.3 : 1,
                y: 0,
              }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {page.status === 'generating' ? (
                <div className="aspect-[3/4] glass-card flex items-center justify-center overflow-hidden">
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border border-violet/20 animate-spin-slow" />
                      <div className="absolute inset-3 rounded-full border border-cyan/20 animate-spin-reverse" />
                    </div>
                    <p className="text-ink-light/40 text-sm font-mono">Forging page {page.pageNumber}&hellip;</p>
                  </div>
                </div>
              ) : page.status === 'complete' && page.imageUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={page.imageUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full rounded-lg shadow-2xl shadow-ink-void/50"
                  />
                  <div className="text-center mt-2 text-xs text-ink-light/20 font-mono">
                    Page {page.pageNumber}
                  </div>
                </motion.div>
              ) : page.status === 'error' ? (
                <div className="aspect-[3/4] glass-card flex items-center justify-center border-manga-red/20">
                  <div className="text-center">
                    <p className="text-manga-red text-sm mb-3">Generation failed</p>
                    <button className="px-4 py-1.5 rounded-lg text-xs btn-ghost">
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] bg-ink-deep/30 rounded-lg border border-ink-mid/10 flex items-center justify-center">
                  <span className="text-ink-light/10 text-sm font-mono">Page {page.pageNumber}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* End-of-chapter hook panel */}
      <AnimatePresence>
        {showHookPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-ink-void/95 backdrop-blur-xl flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="max-w-lg w-full text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border border-violet/20 mb-8"
              >
                <span className="font-[family-name:var(--font-heading)] text-xl text-paper-warm/80">Chapter 1 Complete</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-lg text-ink-light/50 italic mb-10 leading-relaxed"
              >
                &ldquo;{HOOK_TEASE_LINES[Math.floor(Math.random() * HOOK_TEASE_LINES.length)]}&rdquo;
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="px-12 py-5 rounded-2xl btn-primary font-[family-name:var(--font-heading)] font-bold text-xl glow-pulse-cta hover:scale-105 transition-transform"
              >
                Forge Chapter 2
              </motion.button>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1.8 }}
                className="mt-3 text-sm text-ink-light/30"
              >
                &#9889; 8 credits
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="flex flex-wrap justify-center gap-4 mt-8"
              >
                <button
                  onClick={() => setShowHookPanel(false)}
                  className="px-4 py-2 rounded-lg text-sm btn-ghost"
                >
                  Re-read Chapter 1
                </button>
                <button className="px-4 py-2 rounded-lg text-sm btn-ghost">
                  Chat with Character
                </button>
                <button className="px-4 py-2 rounded-lg text-sm btn-ghost">
                  Share
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
