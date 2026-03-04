'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { InkParticles } from '@/components/ink-particles';
import { TypewriterText } from '@/components/typewriter-text';
import { COMIC_STYLES } from '@/lib/styles';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const PRICING = [
  { name: 'Free', price: '$0', credits: '20', features: ['1 project', 'Watermarked exports', 'Community access'], cta: 'Start Free', highlight: false },
  { name: 'Starter', price: '$9.99', credits: '100', features: ['3 projects', 'No watermark', 'Store access', 'All styles'], cta: 'Get Started', highlight: false },
  { name: 'Pro', price: '$24.99', credits: '300', features: ['Unlimited projects', 'Priority queue', 'Analytics dashboard', 'Style remixing', 'Bulk export'], cta: 'Go Pro', highlight: true },
  { name: 'Unlimited', price: '$49.99', credits: '1,000', features: ['Everything in Pro', 'API access', 'White-label export', 'Bulk generation', 'Custom styles'], cta: 'Unleash', highlight: false },
];

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <InkParticles />

      {/* Gradient mesh */}
      <div className="absolute inset-0 gradient-mesh" />

      {/* Radial focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-ink-void)_70%)]" />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Logo / Title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-[family-name:var(--font-display)] text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight mb-2">
            <span className="bg-gradient-to-r from-paper-warm via-sakura-pink to-neon-cyan bg-clip-text text-transparent">
              MangaForge
            </span>
          </h1>
          <motion.div
            className="h-1 mx-auto rounded-full bg-gradient-to-r from-transparent via-sakura-pink to-transparent"
            initial={{ width: 0 }}
            animate={{ width: '60%' }}
            transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="mt-8 text-xl sm:text-2xl md:text-3xl text-ink-light font-[family-name:var(--font-heading)] font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Where Stories Come Alive
        </motion.p>

        {/* Typewriter prompt examples */}
        <motion.div
          className="mt-6 text-lg text-ink-light/60 italic h-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <TypewriterText
            texts={[
              'A wandering samurai in a world where music is magic…',
              'Two rival academy students discover they share the same curse…',
              'A detective in Neo-Tokyo solves crimes by entering dreams…',
              'An empress summons stone golems to defend her kingdom…',
              'A chef who cooks hope in a post-apocalyptic wasteland…',
            ]}
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Link
            href="/create"
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-sakura-pink text-paper-pure font-[family-name:var(--font-heading)] font-semibold text-xl sakura-glow-pulse transition-all duration-300 hover:scale-105 hover:bg-sakura-soft"
          >
            <span className="relative z-10">Start Creating</span>
            <svg className="w-6 h-6 relative z-10 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-4 text-sm text-ink-light/50">No credit card required · 20 free credits</p>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <svg className="w-6 h-6 text-ink-light/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: '✍️', title: 'Prompt', desc: 'Describe your story in any language. A single sentence or a detailed brief — the AI understands both.' },
    { icon: '⚒️', title: 'Forge', desc: 'Watch your manga come alive page by page. AI generates art, dialogue, and panel layouts in real-time.' },
    { icon: '📖', title: 'Read & Share', desc: 'Read your creation in a beautiful reader. Export, publish to the store, or share with the world.' },
  ];

  return (
    <section className="relative py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl text-center mb-4">
            Three Steps to <span className="text-sakura-pink">Your Manga</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-ink-light text-center mb-20 text-lg max-w-2xl mx-auto">
            Complex AI orchestration hidden behind effortless simplicity
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="group glass-card p-8 text-center hover:border-sakura-pink/30 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
                <div className="text-sm font-mono text-neon-cyan mb-2">Step {i + 1}</div>
                <h3 className="font-[family-name:var(--font-heading)] text-2xl mb-3">{step.title}</h3>
                <p className="text-ink-light leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StyleShowcase() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl text-center mb-4">
            Choose Your <span className="text-neon-cyan">Canvas</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-ink-light text-center mb-16 text-lg max-w-2xl mx-auto">
            12 meticulously crafted comic styles, each with dedicated AI art direction
          </motion.p>
        </motion.div>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-6 overflow-x-auto px-8 pb-8 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {COMIC_STYLES.map((style, i) => (
          <motion.div
            key={style.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`snap-center shrink-0 w-72 glass-card overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all duration-500`}
          >
            {/* Gradient header */}
            <div className={`h-40 bg-gradient-to-br ${style.gradient} flex items-center justify-center relative overflow-hidden`}>
              <span className="text-6xl group-hover:scale-125 transition-transform duration-500">{style.emoji}</span>
              <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/80 to-transparent" />
            </div>
            <div className="p-5">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold mb-1">{style.name}</h3>
              <p className="text-ink-light text-sm mb-3 line-clamp-2">{style.description}</p>
              <div className="flex items-center gap-2 text-xs text-ink-light/60">
                <span className="px-2 py-0.5 rounded-full bg-ink-wash">{style.colorMode === 'bw' ? 'B&W' : 'Color'}</span>
                <span className="px-2 py-0.5 rounded-full bg-ink-wash">
                  {style.readingDirection === 'rtl' ? 'RTL' : style.readingDirection === 'vertical' ? 'Scroll' : 'LTR'}
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-light/40 italic">{style.references}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="relative py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl text-center mb-4">
            Simple, <span className="text-gold-premium">Fair</span> Pricing
          </motion.h2>
          <motion.p variants={fadeUp} className="text-ink-light text-center mb-16 text-lg max-w-2xl mx-auto">
            Start free. Scale when your creative appetite grows.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING.map((tier) => (
              <motion.div
                key={tier.name}
                variants={fadeUp}
                className={`glass-card p-6 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                  tier.highlight
                    ? 'border-sakura-pink/40 ring-1 ring-sakura-pink/20'
                    : ''
                }`}
              >
                {tier.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sakura-pink via-neon-cyan to-sakura-pink" />
                )}
                <div className="text-sm text-ink-light mb-1 font-mono">{tier.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-[family-name:var(--font-heading)] text-4xl font-bold">{tier.price}</span>
                  {tier.price !== '$0' && <span className="text-ink-light text-sm">/mo</span>}
                </div>
                <div className="text-neon-cyan text-sm mb-6">⚡ {tier.credits} credits/month</div>
                <ul className="space-y-2 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-light">
                      <span className="text-forest-green mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-[family-name:var(--font-heading)] font-semibold transition-all duration-300 ${
                    tier.highlight
                      ? 'bg-sakura-pink text-paper-pure sakura-glow hover:bg-sakura-soft'
                      : 'bg-ink-wash text-paper-warm hover:bg-ink-mid border border-ink-mid'
                  }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink-mid/30 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="font-[family-name:var(--font-display)] text-2xl bg-gradient-to-r from-paper-warm to-sakura-pink bg-clip-text text-transparent">
          MangaForge
        </div>
        <div className="flex gap-8 text-sm text-ink-light">
          <a href="#" className="ink-underline hover:text-paper-warm transition-colors">About</a>
          <a href="#" className="ink-underline hover:text-paper-warm transition-colors">Blog</a>
          <a href="#" className="ink-underline hover:text-paper-warm transition-colors">API</a>
          <a href="#" className="ink-underline hover:text-paper-warm transition-colors">Terms</a>
          <a href="#" className="ink-underline hover:text-paper-warm transition-colors">Privacy</a>
        </div>
        <p className="text-xs text-ink-light/40">Built by Palabre.ai — Where Stories Come Alive</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main className="relative">
      <HeroSection />
      <HowItWorks />
      <StyleShowcase />
      <PricingSection />
      <Footer />
    </main>
  );
}
