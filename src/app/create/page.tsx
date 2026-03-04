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

  // Advanced config
  const selectedStyleData = COMIC_STYLES.find(s => s.id === selectedStyle);
  const [pagesPerChapter, setPagesPerChapter] = useState(20);
  const [panelsPerPage, setPanelsPerPage] = useState(6);
  const [contentRating, setContentRating] = useState<typeof CONTENT_RATINGS[number]>('PG-13');
  const [artDetail, setArtDetail] = useState<typeof ART_DETAIL[number]>('High');
  const [colorMode, setColorMode] = useState<typeof COLOR_MODES[number]>('Auto');

  // Update defaults when style changes
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

    // Store config in sessionStorage for the synopsis page
    sessionStorage.setItem('mangaforge_config', JSON.stringify({
      prompt,
      style: selectedStyle,
      pagesPerChapter,
      panelsPerPage,
      contentRating,
      artDetail,
      colorMode,
    }));

    // Dramatic exit animation then navigate
    setTimeout(() => router.push('/create/synopsis'), 1500);
  };

  return (
    <main className="min-h-screen relative">
      {/* Back nav */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 text-ink-light hover:text-paper-warm transition-colors group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-[family-name:var(--font-display)] text-lg bg-gradient-to-r from-paper-warm to-sakura-pink bg-clip-text text-transparent">MangaForge</span>
        </Link>
      </div>

      {/* Forging animation overlay */}
      <AnimatePresence>
        {isForging && (
          <motion.div
            className="fixed inset-0 z-[100] bg-ink-void flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="text-center">
              <motion.div
                className="w-32 h-32 mx-auto rounded-full border-2 border-sakura-pink/30 relative"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              >
                <motion.div
                  className="absolute inset-2 rounded-full border-2 border-neon-cyan/40"
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-sakura-pink/20 to-neon-cyan/20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </motion.div>
              <motion.p
                className="mt-8 text-xl font-[family-name:var(--font-heading)] text-paper-warm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Gathering inspiration…
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
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl mb-3">
            The <span className="text-neon-cyan">Genesis</span> Page
          </h1>
          <p className="text-ink-light text-lg">Describe your story. We&apos;ll bring it to life.</p>
        </motion.div>

        {/* Prompt Input */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`relative rounded-2xl transition-all duration-500 ${
            prompt ? 'neon-cyan-glow' : ''
          }`}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (!userTyping) setUserTyping(true);
              }}
              rows={5}
              className="w-full bg-ink-deep border-2 border-ink-mid rounded-2xl p-6 text-lg text-paper-warm placeholder:text-transparent focus:border-neon-cyan focus:outline-none resize-none transition-all duration-300 font-[family-name:var(--font-body)]"
              style={{ minHeight: '160px' }}
            />
            {/* Placeholder overlay */}
            {!prompt && (
              <div className="absolute top-6 left-6 right-6 text-ink-light/40 text-lg pointer-events-none italic">
                <TypewriterText
                  stopped={userTyping}
                  texts={[
                    'A wandering samurai in a world where music is magic…',
                    'Two rival academy students discover they share the same curse…',
                    'A detective in Neo-Tokyo solves crimes by entering the dreams of the deceased…',
                    'An empress who summons stone golems to defend a cliff-side kingdom…',
                    'A chef who cooks hope in a post-apocalyptic wasteland…',
                  ]}
                />
              </div>
            )}
            {/* Character count */}
            <div className="absolute bottom-3 right-4 text-xs text-ink-light/30 font-mono">
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
          <h2 className="font-[family-name:var(--font-heading)] text-2xl mb-2">Choose Your Canvas</h2>
          <p className="text-ink-light text-sm mb-6">Select the art style for your creation</p>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
            {COMIC_STYLES.map((style) => (
              <motion.button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`snap-center shrink-0 w-48 rounded-xl overflow-hidden transition-all duration-300 text-left ${
                  selectedStyle === style.id
                    ? 'ring-2 ring-neon-cyan neon-cyan-glow'
                    : 'border border-ink-mid hover:border-ink-light/30'
                }`}
              >
                <div className={`h-24 bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                  <span className="text-4xl">{style.emoji}</span>
                </div>
                <div className="p-3 bg-ink-deep">
                  <div className="font-[family-name:var(--font-heading)] text-sm font-semibold truncate">{style.name}</div>
                  <div className="text-xs text-ink-light/60 mt-1">
                    {style.colorMode} · {style.readingDirection === 'rtl' ? 'RTL' : style.readingDirection === 'vertical' ? 'Scroll' : 'LTR'}
                  </div>
                </div>
              </motion.button>
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
            className="flex items-center gap-2 text-ink-light hover:text-paper-warm transition-colors text-sm font-mono"
          >
            <motion.svg
              className="w-4 h-4"
              animate={{ rotate: showAdvanced ? 90 : 0 }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </motion.svg>
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
                  {/* Pages per chapter */}
                  <div>
                    <label className="text-sm text-ink-light mb-2 block">Pages per Chapter</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={4}
                        max={60}
                        value={pagesPerChapter}
                        onChange={(e) => setPagesPerChapter(Number(e.target.value))}
                        className="flex-1 accent-sakura-pink"
                      />
                      <span className="w-10 text-right font-mono text-sm text-neon-cyan">{pagesPerChapter}</span>
                    </div>
                  </div>

                  {/* Panels per page */}
                  <div>
                    <label className="text-sm text-ink-light mb-2 block">Panels per Page</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={panelsPerPage}
                        onChange={(e) => setPanelsPerPage(Number(e.target.value))}
                        className="flex-1 accent-sakura-pink"
                      />
                      <span className="w-10 text-right font-mono text-sm text-neon-cyan">{panelsPerPage}</span>
                    </div>
                  </div>

                  {/* Content Rating */}
                  <div>
                    <label className="text-sm text-ink-light mb-2 block">Content Rating</label>
                    <div className="flex flex-wrap gap-2">
                      {CONTENT_RATINGS.map((r) => (
                        <button
                          key={r}
                          onClick={() => setContentRating(r)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                            contentRating === r
                              ? 'bg-sakura-pink text-paper-pure'
                              : 'bg-ink-wash text-ink-light hover:bg-ink-mid'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Art Detail */}
                  <div>
                    <label className="text-sm text-ink-light mb-2 block">Art Detail Level</label>
                    <div className="flex gap-2">
                      {ART_DETAIL.map((d) => (
                        <button
                          key={d}
                          onClick={() => setArtDetail(d)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono flex-1 transition-all ${
                            artDetail === d
                              ? 'bg-neon-cyan text-ink-void'
                              : 'bg-ink-wash text-ink-light hover:bg-ink-mid'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Mode */}
                  <div>
                    <label className="text-sm text-ink-light mb-2 block">Color Mode</label>
                    <select
                      value={colorMode}
                      onChange={(e) => setColorMode(e.target.value as typeof COLOR_MODES[number])}
                      className="w-full bg-ink-wash border border-ink-mid rounded-lg px-3 py-2 text-sm text-paper-warm focus:border-neon-cyan focus:outline-none"
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
                ? 'bg-sakura-pink text-paper-pure sakura-glow-pulse cursor-pointer hover:bg-sakura-soft'
                : 'bg-ink-wash text-ink-light cursor-not-allowed'
            }`}
          >
            <span className="relative z-10">⚒️ Forge My Story</span>
          </motion.button>

          {(!prompt.trim() || !selectedStyle) && (
            <p className="mt-4 text-sm text-ink-light/40">
              {!prompt.trim() && !selectedStyle
                ? 'Enter a prompt and select a style to begin'
                : !prompt.trim()
                ? 'Enter a prompt to begin'
                : 'Select a style to begin'}
            </p>
          )}

          {prompt.trim() && selectedStyle && (
            <p className="mt-4 text-sm text-ink-light/50">
              ⚡ ~3 credits · {selectedStyleData?.name} · {pagesPerChapter} pages
            </p>
          )}
        </motion.div>
      </div>
    </main>
  );
}
