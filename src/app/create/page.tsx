'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { COMIC_STYLES, type ComicStyleId } from '@/lib/styles';
import { TypewriterText } from '@/components/typewriter-text';
import Link from 'next/link';

const CONTENT_RATINGS = ['G', 'PG', 'PG-13', 'R', 'Mature'] as const;
const ART_DETAIL = ['Standard', 'High', 'Ultra'] as const;
const COLOR_MODES = ['Auto', 'Full Color', 'Grayscale', 'Black & White', 'Duotone'] as const;

export default function CreatePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ComicStyleId | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isForging, setIsForging] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedStyleData = COMIC_STYLES.find(s => s.id === selectedStyle);
  const [pagesPerChapter, setPagesPerChapter] = useState(20);
  const [panelsPerPage, setPanelsPerPage] = useState(6);
  const [contentRating, setContentRating] = useState<typeof CONTENT_RATINGS[number]>('PG-13');
  const [artDetail, setArtDetail] = useState<typeof ART_DETAIL[number]>('High');
  const [colorMode, setColorMode] = useState<typeof COLOR_MODES[number]>('Auto');

  const handleStyleSelect = (id: ComicStyleId) => {
    setSelectedStyle(id);
    const style = COMIC_STYLES.find(s => s.id === id);
    if (style) {
      setPagesPerChapter(Math.round((style.pagesPerChapter[0] + style.pagesPerChapter[1]) / 2));
      setPanelsPerPage(Math.round((style.panelsPerPage[0] + style.panelsPerPage[1]) / 2));
    }
  };

  const handleForge = async () => {
    if (!prompt.trim() || !selectedStyle) return;
    setIsForging(true);

    sessionStorage.setItem('mangaforge_config', JSON.stringify({
      prompt,
      style: selectedStyle,
      pagesPerChapter,
      panelsPerPage,
      contentRating,
      artDetail,
      colorMode,
    }));

    setTimeout(() => router.push('/create/synopsis'), 1500);
  };

  return (
    <main className="min-h-screen relative mesh-gradient-intense">
      {/* Back nav */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 text-ink-light hover:text-paper-warm transition-colors group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-[family-name:var(--font-display)] text-lg gradient-text">InkForge</span>
        </Link>
      </div>

      {/* Forging animation overlay */}
      <AnimatePresence>
        {isForging && (
          <motion.div
            className="fixed inset-0 z-[100] bg-ink-void/95 backdrop-blur-xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="text-center">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full border border-violet/30 animate-spin-slow" />
                <div className="absolute inset-3 rounded-full border border-cyan/30 animate-spin-reverse" />
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-violet/20 to-cyan/20 animate-pulse" />
              </div>
              <motion.p
                className="mt-8 text-xl font-[family-name:var(--font-heading)] text-paper-warm/80 font-light"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Gathering inspiration&hellip;
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-32">
        {/* Page title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-mono text-violet mb-3 tracking-wider uppercase">Create</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-light mb-3">
            The <span className="gradient-text font-semibold">Genesis</span> Page
          </h1>
          <p className="text-ink-light/50 text-lg font-light">Describe your story. We&apos;ll bring it to life.</p>
        </motion.div>

        {/* Prompt Input */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`relative rounded-2xl transition-all duration-500 ${
            prompt ? 'glow-violet' : ''
          }`}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (!userTyping) setUserTyping(true);
              }}
              rows={5}
              className="w-full bg-ink-deep/80 backdrop-blur-xl border border-ink-mid/20 rounded-2xl p-6 text-lg text-paper-warm placeholder:text-transparent focus:border-violet/40 focus:outline-none focus:shadow-[0_0_0_3px_rgba(14,165,233,0.1)] resize-none transition-all duration-300 font-[family-name:var(--font-body)]"
              style={{ minHeight: '160px' }}
            />
            {!prompt && (
              <div className="absolute top-6 left-6 right-6 text-ink-light/30 text-lg pointer-events-none italic">
                <TypewriterText
                  stopped={userTyping}
                  texts={[
                    'A wandering samurai in a world where music is magic\u2026',
                    'Two rival academy students discover they share the same curse\u2026',
                    'A detective in Neo-Tokyo solves crimes by entering the dreams of the deceased\u2026',
                    'An empress who summons stone golems to defend a cliff-side kingdom\u2026',
                    'A chef who cooks hope in a post-apocalyptic wasteland\u2026',
                  ]}
                />
              </div>
            )}
            <div className="absolute bottom-3 right-4 text-xs text-ink-light/20 font-mono">
              {prompt.length}
            </div>
          </div>
        </motion.div>

        {/* Style Selector */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-light mb-2">Choose Your <span className="gradient-text font-medium">Canvas</span></h2>
          <p className="text-ink-light/40 text-sm mb-6">Select the art style for your creation</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {COMIC_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className={`glass-card-hover text-left overflow-hidden transition-all duration-300 ${
                  selectedStyle === style.id
                    ? 'gradient-border-glow glow-violet'
                    : ''
                }`}
              >
                <div className={`h-20 bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                  <span className="text-3xl">{style.emoji}</span>
                </div>
                <div className="p-3">
                  <div className="font-[family-name:var(--font-heading)] text-sm font-medium truncate">{style.name}</div>
                  <div className="text-xs text-ink-light/30 mt-0.5">
                    {style.colorMode} &middot; {style.readingDirection === 'rtl' ? 'RTL' : style.readingDirection === 'vertical' ? 'Scroll' : 'LTR'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Advanced Config */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-ink-light/50 hover:text-paper-warm transition-colors text-sm font-mono"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Advanced Settings
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 p-6 glass-card">
                  <div>
                    <label className="text-sm text-ink-light/50 mb-2 block">Pages per Chapter</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={4}
                        max={60}
                        value={pagesPerChapter}
                        onChange={(e) => setPagesPerChapter(Number(e.target.value))}
                        className="flex-1 accent-violet"
                      />
                      <span className="w-10 text-right font-mono text-sm text-violet">{pagesPerChapter}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-ink-light/50 mb-2 block">Panels per Page</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={panelsPerPage}
                        onChange={(e) => setPanelsPerPage(Number(e.target.value))}
                        className="flex-1 accent-violet"
                      />
                      <span className="w-10 text-right font-mono text-sm text-violet">{panelsPerPage}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-ink-light/50 mb-2 block">Content Rating</label>
                    <div className="flex flex-wrap gap-2">
                      {CONTENT_RATINGS.map((r) => (
                        <button
                          key={r}
                          onClick={() => setContentRating(r)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                            contentRating === r
                              ? 'bg-gradient-to-r from-violet to-cyan text-white'
                              : 'bg-ink-wash/50 text-ink-light hover:bg-ink-mid/50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-ink-light/50 mb-2 block">Art Detail Level</label>
                    <div className="flex gap-2">
                      {ART_DETAIL.map((d) => (
                        <button
                          key={d}
                          onClick={() => setArtDetail(d)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono flex-1 transition-all ${
                            artDetail === d
                              ? 'bg-gradient-to-r from-cyan to-violet text-white'
                              : 'bg-ink-wash/50 text-ink-light hover:bg-ink-mid/50'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-ink-light/50 mb-2 block">Color Mode</label>
                    <select
                      value={colorMode}
                      onChange={(e) => setColorMode(e.target.value as typeof COLOR_MODES[number])}
                      className="w-full input-glass px-3 py-2 text-sm"
                    >
                      {COLOR_MODES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* FORGE Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={handleForge}
            disabled={!prompt.trim() || !selectedStyle || isForging}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative px-16 py-6 rounded-2xl font-[family-name:var(--font-heading)] font-bold text-2xl transition-all duration-500 ${
              prompt.trim() && selectedStyle
                ? 'btn-primary glow-pulse-cta cursor-pointer'
                : 'bg-ink-wash/50 text-ink-light/30 cursor-not-allowed'
            }`}
          >
            <span className="relative z-10">Forge My Story</span>
          </motion.button>

          {(!prompt.trim() || !selectedStyle) && (
            <p className="mt-4 text-sm text-ink-light/20">
              {!prompt.trim() && !selectedStyle
                ? 'Enter a prompt and select a style to begin'
                : !prompt.trim()
                ? 'Enter a prompt to begin'
                : 'Select a style to begin'}
            </p>
          )}

          {prompt.trim() && selectedStyle && (
            <p className="mt-4 text-sm text-ink-light/30">
              &#9889; ~3 credits &middot; {selectedStyleData?.name} &middot; {pagesPerChapter} pages
            </p>
          )}
        </motion.div>
      </div>
    </main>
  );
}
