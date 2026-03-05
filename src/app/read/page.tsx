'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type ReadingMode = 'rtl' | 'ltr' | 'vertical';

interface MangaPage {
  number: number;
  imageUrl: string;
}

const DEMO_PAGES: MangaPage[] = Array.from({ length: 20 }, (_, i) => ({
  number: i + 1,
  imageUrl: `https://picsum.photos/seed/manga${i}/768/1024`,
}));

export default function ReaderPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [readingMode, setReadingMode] = useState<ReadingMode>('rtl');
  const [showUI, setShowUI] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalPages = DEMO_PAGES.length;

  const goNext = useCallback(() => {
    if (readingMode === 'rtl') {
      setCurrentPage(p => Math.max(0, p - 1));
    } else {
      setCurrentPage(p => Math.min(totalPages - 1, p + 1));
    }
  }, [readingMode, totalPages]);

  const goPrev = useCallback(() => {
    if (readingMode === 'rtl') {
      setCurrentPage(p => Math.min(totalPages - 1, p + 1));
    } else {
      setCurrentPage(p => Math.max(0, p - 1));
    }
  }, [readingMode, totalPages]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') setShowUI(u => !u);
      if (e.key === 'f') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } else {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  const progressPercent = ((currentPage + 1) / totalPages) * 100;

  return (
    <main
      className="h-screen bg-ink-void flex flex-col relative select-none"
      onClick={() => setShowUI(u => !u)}
    >
      {/* Top Bar */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-40 h-14 glass-nav flex items-center px-4 gap-4"
            onClick={e => e.stopPropagation()}
          >
            <Link href="/library" className="text-ink-light/40 hover:text-paper-warm transition-colors text-sm">
              &larr; Library
            </Link>
            <div className="flex-1 text-center">
              <span className="font-[family-name:var(--font-heading)] text-sm font-medium">Blade of the Eternal Night</span>
              <span className="text-xs text-ink-light/30 ml-2">Ch. 1</span>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-ink-light/40 hover:text-paper-warm transition-colors text-sm"
            >
              Settings
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-14 bottom-0 w-72 z-50 glass-panel rounded-none border-l border-ink-mid/10 p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-light mb-6">Reader Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="text-sm text-ink-light/40 mb-3 block">Reading Direction</label>
                <div className="flex gap-2">
                  {([['rtl', '\u2190 RTL (Manga)'], ['ltr', 'LTR \u2192 (Comics)'], ['vertical', '\u2193 Scroll (Webtoon)']] as [ReadingMode, string][]).map(([mode, label]) => (
                    <button
                      key={mode}
                      onClick={() => setReadingMode(mode)}
                      className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                        readingMode === mode
                          ? 'bg-violet/15 text-violet border border-violet/20'
                          : 'btn-ghost'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-ink-light/40 mb-2 block">Page Display</label>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg text-xs bg-violet/15 text-violet border border-violet/20">Single</button>
                  <button className="flex-1 py-2 rounded-lg text-xs btn-ghost">Double Spread</button>
                </div>
              </div>
              <div>
                <label className="text-sm text-ink-light/40 mb-2 block">Background</label>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-lg bg-ink-void border-2 border-violet" />
                  <button className="w-8 h-8 rounded-lg bg-[#0D0D12] border border-ink-mid/20" />
                  <button className="w-8 h-8 rounded-lg bg-[#16161E] border border-ink-mid/20" />
                </div>
              </div>
              <div>
                <label className="text-sm text-ink-light/40 mb-2 block">Keyboard Shortcuts</label>
                <div className="space-y-1 text-xs text-ink-light/20">
                  <p>&larr; &rarr; Navigate pages</p>
                  <p>F &mdash; Fullscreen</p>
                  <p>ESC &mdash; Toggle UI</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Reading Area */}
      {readingMode === 'vertical' ? (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-16">
            {DEMO_PAGES.map((page, i) => (
              <div key={page.number} className="mb-1">
                <img
                  src={page.imageUrl}
                  alt={`Page ${page.number}`}
                  className="w-full"
                  loading={i < 3 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: readingMode === 'rtl' ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: readingMode === 'rtl' ? 30 : -30 }}
              transition={{ duration: 0.2 }}
              className="h-full flex items-center justify-center p-4"
            >
              <img
                src={DEMO_PAGES[currentPage]?.imageUrl}
                alt={`Page ${currentPage + 1}`}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl shadow-ink-void/80"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Bottom Bar */}
      <AnimatePresence>
        {showUI && readingMode !== 'vertical' && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 z-40 glass-nav p-4 border-t border-ink-mid/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-1 rounded-full bg-ink-deep mb-3 overflow-hidden cursor-pointer"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const page = Math.floor((x / rect.width) * totalPages);
                setCurrentPage(Math.max(0, Math.min(totalPages - 1, page)));
              }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet via-cyan to-cyan"
                animate={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <button onClick={goPrev} className="px-4 py-2 rounded-lg btn-ghost text-sm">
                {readingMode === 'rtl' ? '\u2192 Prev' : '\u2190 Prev'}
              </button>
              <span className="text-sm font-mono text-ink-light/40">
                {currentPage + 1} / {totalPages}
              </span>
              <button onClick={goNext} className="px-4 py-2 rounded-lg btn-ghost text-sm">
                {readingMode === 'rtl' ? 'Next \u2190' : 'Next \u2192'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
