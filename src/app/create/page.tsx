'use client';

import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { COMIC_STYLES, type ComicStyleId } from '@/lib/styles';
import { STYLE_PRESETS, PANEL_LAYOUT_TEMPLATES } from '@/lib/presets';
import { TypewriterText } from '@/components/typewriter-text';
import { updateBible } from '@/lib/bible';
import { getClientUserId } from '@/lib/client-user';
import { setSessionJSON, setSessionText } from '@/lib/storage';
import Link from 'next/link';

const CONTENT_RATINGS = ['G', 'PG', 'PG-13', 'R', 'Mature'] as const;
const ART_DETAIL = ['Standard', 'High', 'Ultra'] as const;
const COLOR_MODES = ['Auto', 'Full Color', 'Grayscale', 'Black & White', 'Duotone'] as const;

export default function CreatePage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ComicStyleId>('shonen');
  const [stylePreset, setStylePreset] = useState<'manga' | 'western' | 'webtoon'>('manga');
  const [panelTemplate, setPanelTemplate] = useState('classic-6-grid');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isForging, setIsForging] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [pagesPerChapter, setPagesPerChapter] = useState(20);
  const [panelsPerPage, setPanelsPerPage] = useState(6);
  const [contentRating, setContentRating] = useState<(typeof CONTENT_RATINGS)[number]>('PG-13');
  const [artDetail, setArtDetail] = useState<(typeof ART_DETAIL)[number]>('High');
  const [colorMode, setColorMode] = useState<(typeof COLOR_MODES)[number]>('Auto');

  const selectedStyleData = useMemo(
    () => COMIC_STYLES.find((style) => style.id === selectedStyle),
    [selectedStyle]
  );

  const selectedPreset = useMemo(
    () => STYLE_PRESETS.find((preset) => preset.id === stylePreset) ?? STYLE_PRESETS[0],
    [stylePreset]
  );

  const selectedTemplate = useMemo(
    () => PANEL_LAYOUT_TEMPLATES.find((template) => template.id === panelTemplate) ?? PANEL_LAYOUT_TEMPLATES[0],
    [panelTemplate]
  );

  const handleStyleSelect = (id: ComicStyleId) => {
    setSelectedStyle(id);
    const style = COMIC_STYLES.find((entry) => entry.id === id);
    if (!style) return;

    setPagesPerChapter(Math.round((style.pagesPerChapter[0] + style.pagesPerChapter[1]) / 2));
    setPanelsPerPage(Math.round((style.panelsPerPage[0] + style.panelsPerPage[1]) / 2));

    if (style.readingDirection === 'vertical') {
      setStylePreset('webtoon');
      setPanelTemplate('webtoon-vertical');
    } else if (style.readingDirection === 'ltr') {
      setStylePreset('western');
    } else {
      setStylePreset('manga');
    }
  };

  const handlePresetSelect = (presetId: 'manga' | 'western' | 'webtoon') => {
    setStylePreset(presetId);

    const preset = STYLE_PRESETS.find((entry) => entry.id === presetId);
    if (!preset) return;

    const preferredStyle = COMIC_STYLES.find((entry) => entry.id === preset.defaultStyle);
    if (preferredStyle) {
      setSelectedStyle(preferredStyle.id);
    }

    setPagesPerChapter(preset.defaultPagesPerChapter);
    setPanelsPerPage(preset.recommendedPanelsPerPage);
    if (preset.readingDirection === 'vertical') {
      setPanelTemplate('webtoon-vertical');
    }
  };

  const handleForge = async () => {
    if (!prompt.trim() || !selectedStyle) return;

    setError(null);
    setIsForging(true);

    const userId = getClientUserId();

    const config = {
      userId,
      prompt,
      style: selectedStyle,
      stylePreset,
      panelTemplate,
      pagesPerChapter,
      panelsPerPage,
      contentRating,
      artDetail,
      colorMode,
    };

    setSessionJSON('config', config);

    updateBible({
      prompt,
      config,
      chapters: [],
    });

    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          userId,
          title: prompt.slice(0, 48),
          style: selectedStyle,
          stylePreset,
          panelTemplate,
          status: 'draft',
          tags: [stylePreset, selectedStyle],
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { project?: { id: string } };
        if (data.project?.id) {
          setSessionText('draftProjectId', data.project.id);
        }
      }
    } catch {
      // Non-blocking. The flow can continue without backend persistence at this stage.
    }

    setTimeout(() => router.push('/create/synopsis'), 900);
  };

  return (
    <main className="min-h-screen relative mesh-gradient-intense">
      <div className="fixed top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 text-ink-light hover:text-paper-warm transition-colors group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-[family-name:var(--font-display)] text-lg gradient-text">InkForge</span>
        </Link>
      </div>

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
                className="mt-8 text-xl font-[family-name:var(--font-heading)] text-paper-warm/90 font-light"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Forging your creation blueprint…
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-28">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-mono text-violet mb-3 tracking-wider uppercase">Create</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-light mb-3">
            Start a <span className="gradient-text font-semibold">New Series</span>
          </h1>
          <p className="text-ink-light/70 text-lg font-light max-w-2xl mx-auto">
            Pick a preset, shape your narrative, and generate your first chapter with polished visuals.
          </p>
        </motion.div>

        {error && (
          <div className="glass-card p-4 border border-red-400/30 text-red-200 text-sm mb-6">{error}</div>
        )}

        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="font-[family-name:var(--font-heading)] text-xl mb-4">Style Presets</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`glass-card-hover p-4 text-left transition-all ${
                  stylePreset === preset.id ? 'gradient-border-glow glow-violet' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{preset.name}</h3>
                  <span className="text-xs font-mono text-cyan/80">{preset.readingDirection.toUpperCase()}</span>
                </div>
                <p className="text-sm text-ink-light/65 leading-relaxed">{preset.description}</p>
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-[family-name:var(--font-heading)] text-xl mb-2">Story Concept</h2>
          <p className="text-ink-light/55 text-sm mb-4">Describe your story seed. InkForge will expand it into a full narrative arc.</p>
          <div className={`relative rounded-2xl transition-all duration-500 ${prompt ? 'glow-violet' : ''}`}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value);
                if (!userTyping) setUserTyping(true);
              }}
              rows={5}
              className="w-full bg-ink-deep/85 border border-ink-mid/25 rounded-2xl p-6 text-lg text-paper-warm placeholder:text-transparent focus:border-violet/45 focus:outline-none focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] resize-none transition-all duration-300"
              style={{ minHeight: '170px' }}
            />
            {!prompt && (
              <div className="absolute top-6 left-6 right-6 text-ink-light/45 text-lg pointer-events-none italic">
                <TypewriterText
                  stopped={userTyping}
                  texts={[
                    'A wandering samurai in a world where music is magic…',
                    'Two rival academy students discover they share the same curse…',
                    'A detective in Neo-Tokyo solves crimes by entering the dreams of the dead…',
                    'An empress summons stone golems to defend a cliff-side kingdom…',
                  ]}
                />
              </div>
            )}
            <div className="absolute bottom-3 right-4 text-xs text-ink-light/35 font-mono">{prompt.length}</div>
          </div>
        </motion.section>

        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-[family-name:var(--font-heading)] text-xl mb-2">Visual Style</h2>
          <p className="text-ink-light/55 text-sm mb-4">Select the rendering style for your first chapter.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {COMIC_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className={`glass-card-hover text-left overflow-hidden transition-all duration-300 ${
                  selectedStyle === style.id ? 'gradient-border-glow glow-violet' : ''
                }`}
              >
                <div className={`h-20 bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                  <span className="text-3xl">{style.emoji}</span>
                </div>
                <div className="p-3">
                  <div className="font-[family-name:var(--font-heading)] text-sm font-medium truncate">{style.name}</div>
                  <div className="text-xs text-ink-light/50 mt-0.5">
                    {style.colorMode} ·{' '}
                    {style.readingDirection === 'rtl'
                      ? 'RTL'
                      : style.readingDirection === 'vertical'
                        ? 'Vertical'
                        : 'LTR'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="font-[family-name:var(--font-heading)] text-xl mb-2">Panel Template</h2>
          <p className="text-ink-light/55 text-sm mb-4">Choose how each page is structured.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {PANEL_LAYOUT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setPanelTemplate(template.id)}
                className={`glass-card-hover p-4 text-left ${
                  panelTemplate === template.id ? 'gradient-border-glow glow-cyan' : ''
                }`}
              >
                <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                <p className="text-xs text-ink-light/65 mb-2">{template.description}</p>
                <div className="text-xs font-mono text-cyan/80">{template.panelCount} panels · {template.bestFor}</div>
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => setShowAdvanced((open) => !open)}
            className="flex items-center gap-2 text-ink-light/60 hover:text-paper-warm transition-colors text-sm font-mono"
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
                    <label className="text-sm text-ink-light/60 mb-2 block">Pages per Chapter</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={4}
                        max={80}
                        value={pagesPerChapter}
                        onChange={(event) => setPagesPerChapter(Number(event.target.value))}
                        className="flex-1 accent-violet"
                      />
                      <span className="w-10 text-right font-mono text-sm text-violet">{pagesPerChapter}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-ink-light/60 mb-2 block">Panels per Page</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={panelsPerPage}
                        onChange={(event) => setPanelsPerPage(Number(event.target.value))}
                        className="flex-1 accent-violet"
                      />
                      <span className="w-10 text-right font-mono text-sm text-violet">{panelsPerPage}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-ink-light/60 mb-2 block">Content Rating</label>
                    <div className="flex flex-wrap gap-2">
                      {CONTENT_RATINGS.map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setContentRating(rating)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                            contentRating === rating
                              ? 'bg-gradient-to-r from-violet to-cyan text-white'
                              : 'bg-ink-wash/50 text-ink-light hover:bg-ink-mid/50'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-ink-light/60 mb-2 block">Art Detail Level</label>
                    <div className="flex gap-2">
                      {ART_DETAIL.map((detail) => (
                        <button
                          key={detail}
                          onClick={() => setArtDetail(detail)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono flex-1 transition-all ${
                            artDetail === detail
                              ? 'bg-gradient-to-r from-cyan to-violet text-white'
                              : 'bg-ink-wash/50 text-ink-light hover:bg-ink-mid/50'
                          }`}
                        >
                          {detail}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-ink-light/60 mb-2 block">Color Mode</label>
                    <select
                      value={colorMode}
                      onChange={(event) => setColorMode(event.target.value as (typeof COLOR_MODES)[number])}
                      className="w-full input-glass px-3 py-2 text-sm"
                    >
                      {COLOR_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={handleForge}
            disabled={!prompt.trim() || isForging}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`relative px-14 py-5 rounded-2xl font-[family-name:var(--font-heading)] font-bold text-xl transition-all duration-500 ${
              prompt.trim() ? 'btn-primary glow-pulse-cta cursor-pointer' : 'bg-ink-wash/50 text-ink-light/30 cursor-not-allowed'
            }`}
          >
            <span className="relative z-10">Continue to Synopsis</span>
          </motion.button>

          <p className="mt-4 text-sm text-ink-light/45">
            ⚡ Estimated cost: ~{Math.max(3, Math.ceil(pagesPerChapter / 4))} credits · {selectedStyleData?.name} · {selectedPreset.name} ·{' '}
            {selectedTemplate.name}
          </p>
        </motion.div>
      </div>
    </main>
  );
}
