'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadBible, addChapterToBible, type StoryBible } from '@/lib/bible';

interface PanelScript {
  panelNumber: number;
  shotType: string;
  description: string;
  dialogue: Array<{ character: string; text: string }>;
  sfx: string[];
  emotion: string;
}

interface PageScript {
  pageNumber: number;
  type: string;
  panels: PanelScript[];
  imagePrompt: string;
}

interface ChapterScript {
  chapterTitle: string;
  pages: PageScript[];
  hookType?: string;
  hookTeaseLine?: string;
  characterStatusUpdates?: Array<{ name: string; status: string }>;
}

interface PageData {
  pageNumber: number;
  imageUrl: string | null;
  status: 'queued' | 'generating' | 'complete' | 'error';
  script?: PageScript;
}

export default function ChapterPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [phase, setPhase] = useState<'scripting' | 'drawing' | 'complete'>('scripting');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showHookPanel, setShowHookPanel] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterScript, setChapterScript] = useState<ChapterScript | null>(null);
  const [showScriptPanel, setShowScriptPanel] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [bible, setBible] = useState<StoryBible | null>(null);
  const isGeneratingRef = useRef(false);

  const generateChapter = useCallback(async (chapNum: number, currentBible: StoryBible) => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    setPhase('scripting');
    setError(null);
    setChapterScript(null);
    setShowHookPanel(false);

    const config = currentBible.config;
    const synopsis = currentBible.synopsis || {};
    const characters = (currentBible.characters || []) as Array<Record<string, unknown>>;
    const numPages = config.pagesPerChapter || 8;

    setTotalPages(numPages);
    setChapterNumber(chapNum);

    const initialPages: PageData[] = Array.from({ length: numPages }, (_, i) => ({
      pageNumber: i + 1,
      imageUrl: null,
      status: 'queued' as const,
    }));
    setPages(initialPages);

    // Phase 1: Generate script
    try {
      const scriptRes = await fetch('/api/generate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          synopsis,
          characters: characters.map((c) => ({
            name: c.name,
            role: c.role,
            bioShort: c.bioShort,
            visualPrompt: c.visualPrompt,
            personalityTraits: c.personalityTraits,
          })),
          chapterNumber: chapNum,
          style: config.style,
          pageCount: numPages,
          panelsPerPage: config.panelsPerPage,
          hiddenArc: currentBible.hiddenArc,
          contentRating: config.contentRating,
          artDetail: config.artDetail,
          colorMode: config.colorMode,
          previousChapters: currentBible.chapters,
        }),
      });

      if (!scriptRes.ok) throw new Error('Script generation failed');
      const scriptData = await scriptRes.json();
      const script: ChapterScript = scriptData.script;

      if (!script?.pages?.length) throw new Error('Empty script');

      setChapterScript(script);
      setChapterTitle(script.chapterTitle || `Chapter ${chapNum}`);

      // Map script pages to page data
      const scriptPages = script.pages.slice(0, numPages);
      setPages(prev => prev.map((p, i) => ({
        ...p,
        script: scriptPages[i],
        status: i === 0 ? 'generating' as const : 'queued' as const,
      })));

      // Phase 2: Generate images page by page
      setPhase('drawing');

      for (let i = 0; i < numPages; i++) {
        setCurrentPage(i);
        setPages(prev => prev.map((p, idx) =>
          idx === i ? { ...p, status: 'generating' } : p
        ));

        try {
          const pageScript = scriptPages[i];
          const imagePrompt = pageScript?.imagePrompt || buildFallbackPrompt(i, numPages, config.style as string);

          const imgRes = await fetch('/api/generate-portrait', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visualPrompt: imagePrompt,
              style: config.style,
            }),
          });

          if (imgRes.ok) {
            const imgData = await imgRes.json();
            setPages(prev => prev.map((p, idx) =>
              idx === i ? { ...p, imageUrl: imgData.image, status: 'complete' } : p
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

        await new Promise(r => setTimeout(r, 300));
      }

      setPhase('complete');

      // Update bible with chapter summary
      const summary = `Chapter ${chapNum}: "${script.chapterTitle}". ${script.hookTeaseLine || ''}`;
      const updatedBible = addChapterToBible({
        chapterNumber: chapNum,
        title: script.chapterTitle,
        summary,
        characterStatusUpdates: script.characterStatusUpdates,
      });
      setBible(updatedBible);

      setTimeout(() => setShowHookPanel(true), 2000);
    } catch (err) {
      console.error('Chapter generation error:', err);
      setError('Failed to generate chapter script. Please try again.');
      setPhase('complete');
    }

    isGeneratingRef.current = false;
  }, []);

  useEffect(() => {
    const currentBible = loadBible();
    if (!currentBible) {
      console.warn('No bible found, using defaults');
    }
    const b = currentBible || {
      prompt: '',
      config: { style: 'shonen_manga', pagesPerChapter: 8, panelsPerPage: 6, contentRating: 'PG-13', artDetail: 'High', colorMode: 'Auto' },
      chapters: [],
    };
    setBible(b);

    const nextChapter = (b.chapters?.length || 0) + 1;
    generateChapter(nextChapter, b);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleForgeNextChapter = () => {
    const currentBible = loadBible();
    if (!currentBible) return;
    const nextChapter = chapterNumber + 1;
    setShowHookPanel(false);
    setBible(currentBible);
    generateChapter(nextChapter, currentBible);
  };

  const buildFallbackPrompt = (pageIndex: number, total: number, style: string): string => {
    if (pageIndex === 0) return `A manga title page in ${style} style`;
    if (pageIndex === total - 1) return `Final cliffhanger manga page in ${style} style`;
    return `A full manga page in ${style} style, page ${pageIndex + 1} of ${total}`;
  };

  return (
    <main className="min-h-screen relative mesh-gradient">
      {/* Progress bar */}
      <div className="fixed top-12 left-0 right-0 z-30 h-1 bg-ink-deep">
        <motion.div
          className="h-full bg-gradient-to-r from-violet via-cyan to-cyan"
          animate={{
            width: phase === 'scripting'
              ? '10%'
              : `${((currentPage + 1) / totalPages) * 100}%`
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Status bar */}
      {phase !== 'complete' && (
        <div className="fixed top-16 right-6 z-50">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-violet animate-pulse" />
            <span className="text-sm font-mono text-ink-light/60">
              {phase === 'scripting' ? 'Scripting\u2026' : `Drawing Page ${currentPage + 1}/${totalPages}`}
            </span>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="max-w-4xl mx-auto px-4 pt-20 pb-32">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm font-mono text-violet mb-2">Chapter {chapterNumber}</div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl">
            {chapterTitle || 'Forging\u2026'}
          </h1>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 text-center max-w-md mx-auto mb-12"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-manga-red/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-manga-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-ink-light/50 text-sm mb-4">{error}</p>
            <button
              onClick={() => {
                const b = loadBible();
                if (b) generateChapter(chapterNumber, b);
              }}
              className="px-6 py-2 rounded-lg btn-primary text-sm"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Scripting phase indicator */}
        {phase === 'scripting' && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[40vh]"
          >
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 rounded-full border border-violet/20 animate-spin-slow" />
              <div className="absolute inset-4 rounded-full border border-cyan/20 animate-spin-reverse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet/20 to-cyan/20 animate-pulse" />
              </div>
            </div>
            <p className="font-[family-name:var(--font-heading)] text-xl text-paper-warm/60 font-light mb-2">
              Writing the script&hellip;
            </p>
            <p className="text-sm text-ink-light/30">Crafting dialogue, panels, and page layouts</p>
          </motion.div>
        )}

        {/* Pages */}
        {phase !== 'scripting' && (
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
                {/* Page with script side panel */}
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="flex-1">
                    {page.status === 'generating' ? (
                      <div className="aspect-[3/4] glass-card flex items-center justify-center overflow-hidden">
                        <div className="text-center">
                          <div className="relative w-20 h-20 mx-auto mb-4">
                            <div className="absolute inset-0 rounded-full border border-violet/20 animate-spin-slow" />
                            <div className="absolute inset-3 rounded-full border border-cyan/20 animate-spin-reverse" />
                          </div>
                          <p className="text-ink-light/40 text-sm font-mono">Drawing page {page.pageNumber}&hellip;</p>
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
                      </motion.div>
                    ) : page.status === 'error' ? (
                      <div className="aspect-[3/4] glass-card flex items-center justify-center border-manga-red/20">
                        <div className="text-center">
                          <p className="text-manga-red text-sm mb-3">Generation failed</p>
                          <button className="px-4 py-1.5 rounded-lg text-xs btn-ghost">Retry</button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[3/4] bg-ink-deep/30 rounded-lg border border-ink-mid/10 flex items-center justify-center">
                        <span className="text-ink-light/10 text-sm font-mono">Page {page.pageNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Script panel toggle */}
                  {page.script && (page.status === 'complete' || page.status === 'error') && (
                    <div className="w-72 shrink-0 hidden lg:block">
                      <button
                        onClick={() => setShowScriptPanel(showScriptPanel === page.pageNumber ? null : page.pageNumber)}
                        className="text-xs font-mono text-ink-light/30 hover:text-paper-warm transition-colors mb-2"
                      >
                        {showScriptPanel === page.pageNumber ? 'Hide Script' : 'Show Script'}
                      </button>
                      <AnimatePresence>
                        {showScriptPanel === page.pageNumber && (
                          <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="glass-card p-4 text-xs space-y-3 max-h-[600px] overflow-y-auto"
                          >
                            <div className="text-ink-light/40 font-mono uppercase tracking-wider">
                              Page {page.script.pageNumber} &middot; {page.script.type}
                            </div>
                            {page.script.panels.map((panel) => (
                              <div key={panel.panelNumber} className="border-l-2 border-violet/20 pl-3">
                                <div className="text-ink-light/50 font-mono mb-1">
                                  Panel {panel.panelNumber} &middot; {panel.shotType}
                                  {panel.emotion && <span className="text-cyan/40 ml-2">[{panel.emotion}]</span>}
                                </div>
                                <p className="text-ink-light/40 mb-1">{panel.description}</p>
                                {panel.dialogue?.map((d, di) => (
                                  <div key={di} className="text-paper-warm/60 italic">
                                    <span className="text-violet/60 font-semibold not-italic">{d.character}:</span> &ldquo;{d.text}&rdquo;
                                  </div>
                                ))}
                                {panel.sfx?.length > 0 && (
                                  <div className="text-cyan/40 font-mono mt-1">SFX: {panel.sfx.join(', ')}</div>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Mobile: script toggle */}
                {page.script && (page.status === 'complete' || page.status === 'error') && (
                  <div className="lg:hidden mt-2">
                    <button
                      onClick={() => setShowScriptPanel(showScriptPanel === page.pageNumber ? null : page.pageNumber)}
                      className="text-xs font-mono text-ink-light/30 hover:text-paper-warm transition-colors"
                    >
                      {showScriptPanel === page.pageNumber ? 'Hide Script' : 'View Script'}
                    </button>
                    <AnimatePresence>
                      {showScriptPanel === page.pageNumber && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="glass-card p-4 mt-2 text-xs space-y-3">
                            {page.script.panels.map((panel) => (
                              <div key={panel.panelNumber} className="border-l-2 border-violet/20 pl-3">
                                <div className="text-ink-light/50 font-mono mb-1">
                                  Panel {panel.panelNumber} &middot; {panel.shotType}
                                </div>
                                <p className="text-ink-light/40 mb-1">{panel.description}</p>
                                {panel.dialogue?.map((d, di) => (
                                  <div key={di} className="text-paper-warm/60 italic">
                                    <span className="text-violet/60 font-semibold not-italic">{d.character}:</span> &ldquo;{d.text}&rdquo;
                                  </div>
                                ))}
                                {panel.sfx?.length > 0 && (
                                  <div className="text-cyan/40 font-mono mt-1">SFX: {panel.sfx.join(', ')}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="text-center mt-2 text-xs text-ink-light/20 font-mono">
                  Page {page.pageNumber}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* End-of-chapter hook panel */}
      <AnimatePresence>
        {showHookPanel && chapterScript && (
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
                <span className="font-[family-name:var(--font-heading)] text-xl text-paper-warm/80">
                  Chapter {chapterNumber} Complete
                </span>
              </motion.div>

              {chapterScript.hookTeaseLine && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-lg text-ink-light/50 italic mb-10 leading-relaxed"
                >
                  &ldquo;{chapterScript.hookTeaseLine}&rdquo;
                </motion.p>
              )}

              {chapterScript.hookType && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mb-8"
                >
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-violet/10 text-violet border border-violet/20">
                    {chapterScript.hookType}
                  </span>
                </motion.div>
              )}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                onClick={handleForgeNextChapter}
                className="px-12 py-5 rounded-2xl btn-primary font-[family-name:var(--font-heading)] font-bold text-xl glow-pulse-cta hover:scale-105 transition-transform"
              >
                Forge Chapter {chapterNumber + 1}
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
                  Re-read Chapter {chapterNumber}
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
