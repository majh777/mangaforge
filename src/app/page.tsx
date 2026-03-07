'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TypewriterText } from '@/components/typewriter-text';
import { STYLE_PRESETS, PANEL_LAYOUT_TEMPLATES } from '@/lib/presets';
import { COMIC_STYLES } from '@/lib/styles';
import { Navigation } from '@/components/navigation';

interface ShowcaseItem {
  id: string;
  title: string;
  creator: string;
  style: string;
  tags: string[];
  shareSlug: string;
  previewImage?: string;
  chapterCount: number;
  pageCount: number;
  featured?: boolean;
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Prompt your concept',
    description: 'Describe your world, characters, and tone in plain language.',
  },
  {
    step: '02',
    title: 'Choose presets',
    description: 'Pick manga, western comic, or webtoon preset and panel templates.',
  },
  {
    step: '03',
    title: 'Generate chapters',
    description: 'InkForge writes the script, builds pages, and keeps visual consistency.',
  },
  {
    step: '04',
    title: 'Share & export',
    description: 'Publish to community or export as PDF, CBZ manifest, and image pack.',
  },
];

const PRICING = [
  {
    tier: 'Free',
    price: '$0',
    subtitle: 'Best for testing ideas',
    credits: '20 daily credits',
    features: ['Daily reset', '1 active project', 'Public share links', 'Community access'],
    highlighted: false,
  },
  {
    tier: 'Starter',
    price: '$9.99/mo',
    subtitle: 'For solo creators',
    credits: '250 daily credits',
    features: ['5 active projects', 'Priority generation', 'Unlimited exports', 'Character chat'],
    highlighted: false,
  },
  {
    tier: 'Pro',
    price: '$24.99/mo',
    subtitle: 'For serious production',
    credits: '1000 daily credits',
    features: ['Unlimited projects', 'Faster batch pipeline', 'Advanced style control', 'Publishing analytics'],
    highlighted: true,
  },
  {
    tier: 'Unlimited',
    price: '$49.99/mo',
    subtitle: 'For teams and studios',
    credits: 'No practical daily cap',
    features: ['Dedicated throughput', 'Team workflows', 'Priority support', 'Roadmap access'],
    highlighted: false,
  },
];

function CommunitySkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="h-36 rounded-lg shimmer mb-3" />
      <div className="h-4 w-2/3 shimmer rounded mb-2" />
      <div className="h-3 w-1/2 shimmer rounded" />
    </div>
  );
}

export default function HomePage() {
  const [showcase, setShowcase] = useState<ShowcaseItem[]>([]);
  const [loadingShowcase, setLoadingShowcase] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/community', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data?.showcase) return;
        setShowcase((data.showcase as ShowcaseItem[]).slice(0, 6));
      })
      .catch(() => {
        // Silent fallback.
      })
      .finally(() => setLoadingShowcase(false));

    return () => controller.abort();
  }, []);

  const styleHighlights = useMemo(() => COMIC_STYLES.slice(0, 8), []);

  return (
    <main className="min-h-screen bg-ink-void relative overflow-hidden">
      <Navigation />

      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan/30 mb-6 text-sm text-paper-warm/90">
            <span className="w-2 h-2 rounded-full bg-forest-green animate-pulse" />
            InkForge Open Beta · New chapter pipeline live
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-5">
            <span className="gradient-text">InkForge</span>
          </h1>
          <p className="text-xl md:text-2xl text-paper-warm/95 mb-3 font-[family-name:var(--font-heading)]">
            AI comic studio for manga, western comics, and webtoons.
          </p>
          <p className="text-base md:text-lg text-ink-light/85 max-w-3xl mx-auto mb-6">
            Plan your narrative arc, generate consistent chapters, publish shareable links, and export your work — all in one creation flow.
          </p>

          <div className="text-sm md:text-base text-cyan/80 italic mb-8 h-7">
            <TypewriterText
              texts={[
                'Build your first chapter in minutes…',
                'Use style presets for manga, western, or webtoon…',
                'Publish and share public links with one click…',
              ]}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/create" className="btn-primary px-8 py-4 text-lg font-semibold w-full sm:w-auto">
              Start Creating
            </Link>
            <Link href="/community" className="btn-ghost px-8 py-4 text-lg w-full sm:w-auto">
              Explore Community
            </Link>
          </div>
          <p className="mt-3 text-xs text-ink-light/70">Free tier includes daily credits and public sharing.</p>
        </div>
      </section>

      <section className="py-16 px-4 border-y border-ink-mid/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
          {[
            { value: '3', label: 'Style presets' },
            { value: '4', label: 'Panel templates' },
            { value: 'PDF + CBZ + image pack', label: 'Export formats' },
            { value: 'Daily limits', label: 'Free tier support' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5 text-center">
              <div className="font-[family-name:var(--font-heading)] text-xl font-semibold text-paper-warm">{stat.value}</div>
              <p className="text-sm text-ink-light/75 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-mono text-violet uppercase tracking-[0.2em] mb-2">Workflow</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-light">
              Creation flow built for <span className="gradient-text font-semibold">shipping chapters</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="glass-card-hover p-5">
                <p className="text-xs font-mono text-cyan/80 mb-2">{item.step}</p>
                <h3 className="font-[family-name:var(--font-heading)] text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-ink-light/75">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-ink-mid/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-mono text-cyan uppercase tracking-[0.2em] mb-2">Community Gallery</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-light">
              Real projects created with <span className="gradient-text font-semibold">InkForge</span>
            </h2>
          </div>

          {loadingShowcase ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <CommunitySkeleton key={i} />
              ))}
            </div>
          ) : showcase.length === 0 ? (
            <div className="glass-card p-8 text-center text-ink-light/75">No public projects yet. Publish one from your library.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showcase.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="glass-card-hover overflow-hidden"
                >
                  <Link href={`/share/${item.shareSlug}`}>
                    <div className="h-40 relative">
                      {item.previewImage ? (
                        <img src={item.previewImage} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet/20 to-cyan/20" />
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-medium">{item.title}</h3>
                    <p className="text-sm text-ink-light/70 mt-1">by {item.creator}</p>
                    <p className="text-xs text-ink-light/65 mt-2">
                      {item.chapterCount} chapters · {item.pageCount} pages · {item.style}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-violet/10 text-violet border border-violet/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 border-t border-ink-mid/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-mono text-violet uppercase tracking-[0.2em] mb-2">Style System</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-light">
              Presets and templates for faster production
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            {STYLE_PRESETS.map((preset) => (
              <div key={preset.id} className="glass-card p-5">
                <h3 className="font-[family-name:var(--font-heading)] text-xl mb-2">{preset.name}</h3>
                <p className="text-sm text-ink-light/75 mb-3">{preset.description}</p>
                <p className="text-xs text-cyan/80 font-mono">
                  Default style: {preset.defaultStyle} · Recommended panels/page: {preset.recommendedPanelsPerPage}
                </p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PANEL_LAYOUT_TEMPLATES.map((template) => (
              <div key={template.id} className="glass-card p-4">
                <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-ink-light/70 mb-2">{template.description}</p>
                <p className="text-xs font-mono text-cyan/75">{template.panelCount} panels · {template.bestFor}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {styleHighlights.map((style) => (
              <div key={style.id} className="glass-card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center">{style.emoji}</div>
                <div>
                  <p className="text-sm font-medium">{style.name}</p>
                  <p className="text-xs text-ink-light/65">{style.readingDirection.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 border-t border-ink-mid/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-mono text-gold-premium uppercase tracking-[0.2em] mb-2">Pricing</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-light">
              Free tier + scalable credit packs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING.map((plan) => (
              <div
                key={plan.tier}
                className={`glass-card p-6 ${plan.highlighted ? 'gradient-border-glow glow-violet' : ''}`}
              >
                {plan.highlighted && (
                  <div className="inline-flex px-3 py-1 rounded-full text-xs bg-violet/20 text-violet border border-violet/40 mb-3">
                    Recommended
                  </div>
                )}
                <h3 className="font-[family-name:var(--font-heading)] text-xl mb-1">{plan.tier}</h3>
                <p className="text-3xl font-semibold mb-1">{plan.price}</p>
                <p className="text-xs text-ink-light/70 mb-2">{plan.subtitle}</p>
                <p className="text-sm font-mono text-cyan/80 mb-4">{plan.credits}</p>
                <ul className="space-y-2 text-sm text-ink-light/75 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-violet">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/settings" className={`w-full py-2.5 rounded-lg text-center block ${plan.highlighted ? 'btn-primary' : 'btn-ghost'}`}>
                  Choose {plan.tier}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 text-center border-t border-ink-mid/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl mb-4">
            <span className="gradient-text">Ready to forge your next chapter?</span>
          </h2>
          <p className="text-ink-light/75 text-lg mb-8">
            Start free, generate your first comic chapter, then publish it to the community showcase.
          </p>
          <Link href="/create" className="btn-primary px-10 py-4 text-lg inline-block">
            Open InkForge
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-mid/20 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-ink-light/60">
          <p>© 2026 InkForge · Built by Palabre.ai</p>
          <div className="flex gap-4">
            <Link href="/create" className="hover:text-paper-warm">Create</Link>
            <Link href="/library" className="hover:text-paper-warm">Library</Link>
            <Link href="/community" className="hover:text-paper-warm">Community</Link>
            <Link href="/settings" className="hover:text-paper-warm">Settings</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
