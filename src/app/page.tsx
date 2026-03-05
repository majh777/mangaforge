'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useCallback } from 'react';
import { COMIC_STYLES } from '@/lib/styles';

const TypewriterText = dynamic(
  () => import('@/components/typewriter-text').then((m) => ({ default: m.TypewriterText })),
  { ssr: false },
);

const FEATURES = [
  { title: 'AI Story Engine', desc: 'Multi-arc narratives with hidden overarching plots that unfold across volumes.', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { title: 'NanoBanana 2 Art', desc: 'Professional manga generation at $0.02/page with screentones and panel layouts.', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { title: 'Hook Engine', desc: '10 chapter-end hook types engineered to keep readers craving the next chapter.', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
  { title: 'Living Characters', desc: '10-model personality matrix. Chat with your characters between chapters.', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
  { title: '16+ Languages', desc: 'Create manga in any language. Programmatic text overlay ensures perfect rendering.', icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129' },
  { title: 'Creator Marketplace', desc: 'Publish and sell your manga. 70/30 creator-platform split.', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
];

const STATS = [
  { value: '47,832', numericValue: 47832, label: 'Stories Forged', prefix: '', suffix: '' },
  { value: '12', numericValue: 12, label: 'Comic Styles', prefix: '', suffix: '' },
  { value: '$0.02', numericValue: 0.02, label: 'Per Page', prefix: '$', suffix: '' },
  { value: '16+', numericValue: 16, label: 'Languages', prefix: '', suffix: '+' },
];

const TESTIMONIALS = [
  { name: 'Yuki T.', text: 'I published my first manga volume in 3 days. It would have taken me years to draw.', role: 'Manga Creator' },
  { name: 'Marcus R.', text: 'The character chat feature is insane. My protagonist feels like a real person.', role: 'Indie Author' },
  { name: 'Ava C.', text: "I can't stop hitting 'Forge Next Chapter.' The cliffhangers are genuinely addicting.", role: 'Webtoon Artist' },
  { name: 'Kai M.', text: 'Finally a tool that understands manga panel flow. The RTL reading direction support is perfect.', role: 'Digital Artist' },
  { name: 'Sofia L.', text: 'Went from zero art skills to a published 12-chapter manhwa. This is magic.', role: 'Writer' },
  { name: 'Jin H.', text: "The style variety is incredible. I've created shonen, josei, and BD — all feel authentic.", role: 'Content Creator' },
];

const PRICING = [
  { tier: 'Free', price: '$0', period: '', credits: '10', features: ['1 project', 'Standard quality', 'Watermarked exports', '20 chat messages/mo'], cta: 'Start Free', highlight: false },
  { tier: 'Starter', price: '$9.99', period: '/mo', credits: '100', features: ['5 projects', 'High quality', 'Clean exports', 'Basic character chat'], cta: 'Get Started', highlight: false },
  { tier: 'Pro', price: '$24.99', period: '/mo', credits: '300', features: ['Unlimited projects', 'Ultra quality', 'Priority queue', 'Unlimited chat', 'Analytics'], cta: 'Go Pro', highlight: true },
  { tier: 'Unlimited', price: '$49.99', period: '/mo', credits: '800', features: ['Everything in Pro', 'Dedicated capacity', 'Custom style training', 'API access', 'Early features'], cta: 'Go Unlimited', highlight: false },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Describe', desc: 'Type your story idea — from a single sentence to a detailed plot.', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
  { step: '02', title: 'Choose Style', desc: 'Pick from 12 authentic comic styles — shonen, manhwa, BD, and more.', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { step: '03', title: 'Generate', desc: 'Watch your manga come to life page by page in real-time.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { step: '04', title: 'Share', desc: 'Publish to the marketplace or export for print.', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
];

const MANGA_SHOWCASE = [
  { style: 'Shonen', gradient: 'from-red-600 to-orange-500', panelLayout: '2x3', badge: 'Action', speedLines: true },
  { style: 'Shojo', gradient: 'from-pink-500 to-rose-300', panelLayout: '2x2', badge: 'Romance', speedLines: false },
  { style: 'Seinen', gradient: 'from-slate-700 to-slate-900', panelLayout: '3x2', badge: 'Mature', speedLines: true },
  { style: 'Manhwa', gradient: 'from-blue-500 to-cyan-400', panelLayout: '1x3', badge: 'Webtoon', speedLines: false },
  { style: 'BD', gradient: 'from-emerald-600 to-teal-400', panelLayout: '3x3', badge: 'Franco-Belgian', speedLines: false },
  { style: 'Noir', gradient: 'from-gray-800 to-black', panelLayout: '2x2', badge: 'Crime', speedLines: true },
  { style: 'Horror', gradient: 'from-red-900 to-gray-900', panelLayout: '2x3', badge: 'Horror', speedLines: true },
  { style: 'Watercolor', gradient: 'from-cyan-400 to-purple-400', panelLayout: '2x2', badge: 'Artistic', speedLines: false },
];

const SOUND_EFFECTS: Array<{ text: string; top: string; left?: string; right?: string; delay: string; duration: string }> = [
  { text: 'POW!', top: '15%', left: '8%', delay: '0s', duration: '5s' },
  { text: 'CRASH!', top: '60%', right: '5%', delay: '2s', duration: '6s' },
  { text: 'WHOOSH!', top: '35%', left: '85%', delay: '1s', duration: '7s' },
  { text: 'BAM!', top: '75%', left: '15%', delay: '3s', duration: '5.5s' },
  { text: 'ZAP!', top: '20%', right: '20%', delay: '4s', duration: '6.5s' },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );
    el.querySelectorAll('.reveal').forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);
  return ref;
}

function useAnimatedCounter(target: number, isVisible: boolean, prefix: string, suffix: string, decimals = 0): string {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isVisible, target]);

  const formatted = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString();
  return `${prefix}${formatted}${suffix}`;
}

function AnimatedStat({ stat }: { stat: typeof STATS[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const decimals = stat.numericValue < 1 ? 2 : 0;
  const display = useAnimatedCounter(stat.numericValue, visible, stat.prefix, stat.suffix, decimals);

  return (
    <div ref={ref} className="text-center reveal">
      <div className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black gradient-text">
        {visible ? display : stat.value}
      </div>
      <div className="text-sm text-ink-light/60 mt-1">{stat.label}</div>
    </div>
  );
}

function GlowingTitle() {
  const letters = 'InkForge'.split('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getGlowClass = useCallback((i: number) => {
    if (hoveredIndex === null) return '';
    if (i === hoveredIndex) return '';
    const dist = Math.abs(i - hoveredIndex);
    if (dist === 1) return 'adjacent-1';
    if (dist === 2) return 'adjacent-2';
    return '';
  }, [hoveredIndex]);

  return (
    <span className="inline-flex">
      {letters.map((letter, i) => (
        <span
          key={i}
          className={`glow-letter gradient-text ${getGlowClass(i)}`}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

function MangaCard({ card, index }: { card: typeof MANGA_SHOWCASE[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(10px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)';
  }, []);

  const panelGrid = card.panelLayout === '2x3' ? 'grid-cols-2 grid-rows-3'
    : card.panelLayout === '3x2' ? 'grid-cols-3 grid-rows-2'
    : card.panelLayout === '2x2' ? 'grid-cols-2 grid-rows-2'
    : card.panelLayout === '1x3' ? 'grid-cols-1 grid-rows-3'
    : 'grid-cols-3 grid-rows-3';

  return (
    <div
      ref={ref}
      className="manga-card-3d reveal cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className={`relative h-72 md:h-80 rounded-xl overflow-hidden bg-gradient-to-br ${card.gradient}`}>
        {/* Panel grid overlay */}
        <div className={`absolute inset-3 grid ${panelGrid} gap-[2px]`}>
          {Array.from({ length: parseInt(card.panelLayout[0]) * parseInt(card.panelLayout[2]) }).map((_, j) => (
            <div key={j} className="border border-white/20 rounded-sm bg-black/10 relative overflow-hidden">
              {card.speedLines && j % 2 === 0 && <div className="speed-lines" />}
            </div>
          ))}
        </div>

        {/* Style badge */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-mono text-white/80 border border-white/10">
          {card.badge}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="font-[family-name:var(--font-manga)] text-xl text-white tracking-wide">{card.style}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const scrollRef = useScrollReveal();

  return (
    <main ref={scrollRef} className="min-h-screen bg-ink-void relative overflow-hidden">
      {/* Mesh gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet/10 blur-[120px] animate-orb-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet/6 blur-[100px] animate-orb-2" />
        <div className="absolute top-[50%] left-[50%] w-[400px] h-[400px] rounded-full bg-cyan/5 blur-[80px] animate-orb-1 animation-delay-500" />
      </div>

      {/* Floating manga decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Speed lines cluster */}
        <div className="floating-element top-[20%] left-[5%] text-ink-light/10" style={{ animationDelay: '0s' }}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <line x1="0" y1="0" x2="60" y2="60" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10" y1="0" x2="60" y2="50" stroke="currentColor" strokeWidth="1" />
            <line x1="20" y1="0" x2="60" y2="40" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
        {/* Exclamation bubble */}
        <div className="floating-element top-[45%] right-[8%]" style={{ animationDelay: '3s', animationDuration: '10s' }}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <ellipse cx="25" cy="20" rx="20" ry="15" stroke="rgba(14,165,233,0.12)" strokeWidth="1.5" fill="rgba(14,165,233,0.03)" />
            <text x="25" y="24" textAnchor="middle" fill="rgba(14,165,233,0.15)" fontSize="14" fontWeight="bold">!</text>
          </svg>
        </div>
        {/* Star burst */}
        <div className="floating-element bottom-[30%] left-[10%]" style={{ animationDelay: '5s', animationDuration: '14s' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <polygon points="20,2 24,14 38,14 27,22 31,36 20,28 9,36 13,22 2,14 16,14" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.12)" strokeWidth="1" />
          </svg>
        </div>
        {/* Speed lines - right side */}
        <div className="floating-element top-[70%] right-[4%] text-ink-light/10" style={{ animationDelay: '7s', animationDuration: '11s' }}>
          <svg width="50" height="50" viewBox="0 0 50 50">
            <line x1="50" y1="0" x2="0" y2="50" stroke="currentColor" strokeWidth="1.5" />
            <line x1="40" y1="0" x2="0" y2="40" stroke="currentColor" strokeWidth="1" />
            <line x1="50" y1="10" x2="10" y2="50" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
        {/* Small star */}
        <div className="floating-element top-[15%] right-[25%]" style={{ animationDelay: '2s', animationDuration: '9s' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="rgba(14,165,233,0.08)" />
          </svg>
        </div>
      </div>

      {/* ========== HERO ========== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="animate-slideUp relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm text-ink-light animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-forest-green animate-pulse" />
            Now in Open Beta
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.9] mb-6 tracking-tight">
            <GlowingTitle />
          </h1>

          <p className="text-xl md:text-2xl text-paper-warm/70 mb-3 font-[family-name:var(--font-heading)] font-light animate-fadeIn animation-delay-500">
            Where Stories Become Art
          </p>

          <div className="text-sm md:text-base text-ink-light/40 italic mb-12 h-8 animate-fadeIn animation-delay-800">
            <TypewriterText />
          </div>
        </div>

        <div className="animate-fadeIn animation-delay-1000 relative z-10">
          <Link href="/create">
            <button className="group relative px-12 py-5 rounded-2xl btn-primary text-lg font-[family-name:var(--font-heading)] font-bold glow-pulse-cta btn-shimmer">
              <span className="relative z-10 flex items-center gap-3">
                Start Creating
                <span className="inline-block animate-bounceX">&rarr;</span>
              </span>
            </button>
          </Link>
          <p className="mt-4 text-xs text-ink-light/30">No credit card required &middot; 10 free credits</p>
        </div>

        <div className="absolute bottom-10 animate-bounce opacity-30">
          <svg className="w-6 h-6 text-ink-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="relative py-12 border-y border-ink-mid/10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <AnimatedStat key={s.label} stat={s} />
          ))}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="relative py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20 reveal">
            <p className="text-sm font-mono text-violet mb-3 tracking-wider uppercase">How it works</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-light">
              From <span className="gradient-text font-semibold">Idea</span> to <span className="gradient-text-pink-cyan font-semibold">Manga</span> in Minutes
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="reveal glass-card-hover p-6 text-center relative" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-violet/20 to-cyan/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div className="text-xs font-mono text-violet/60 mb-2">{item.step}</div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg mb-2 font-medium">{item.title}</h3>
                <p className="text-sm text-ink-light/60 leading-relaxed">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-ink-mid/20 text-lg">&rarr;</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== MANGA SHOWCASE ========== */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-sm font-mono text-cyan mb-3 tracking-wider uppercase">Gallery</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-light">
              Stunning <span className="gradient-text-pink-cyan font-semibold">Manga Pages</span>
            </h2>
            <p className="text-ink-light/50 mt-4">Every style. Every genre. Beautifully rendered.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5" style={{ perspective: '1200px' }}>
            {MANGA_SHOWCASE.map((card, i) => (
              <MangaCard key={card.style} card={card} index={i} />
            ))}
          </div>
        </div>

        {/* Floating sound effects */}
        {SOUND_EFFECTS.map((sfx) => (
          <div
            key={sfx.text}
            className="absolute font-[family-name:var(--font-manga)] text-2xl md:text-3xl text-violet/0 select-none pointer-events-none hidden md:block"
            style={{
              top: sfx.top,
              left: sfx.left,
              right: sfx.right,
              animation: `soundEffectPulse ${sfx.duration} ease-in-out infinite`,
              animationDelay: sfx.delay,
            } as React.CSSProperties}
          >
            {sfx.text}
          </div>
        ))}
      </section>

      {/* ========== FEATURES BENTO GRID ========== */}
      <section className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 reveal">
            <p className="text-sm font-mono text-pink mb-3 tracking-wider uppercase">Features</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-light">
              Built <span className="gradient-text-violet-pink font-semibold">Different</span>
            </h2>
            <p className="text-ink-light/50 mt-4 max-w-xl mx-auto">Not another AI toy. A production-grade creative platform.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="reveal gradient-border-animated glass-card-hover p-8" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-10 h-10 mb-4 rounded-lg bg-gradient-to-br from-violet/15 to-cyan/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg mb-2 font-medium">{f.title}</h3>
                <p className="text-sm text-ink-light/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== STYLE SHOWCASE ========== */}
      <section className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-sm font-mono text-cyan mb-3 tracking-wider uppercase">Styles</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-light">
              12 Authentic <span className="gradient-text-pink-cyan font-semibold">Styles</span>
            </h2>
            <p className="text-ink-light/50 mt-4">Each with authentic reading direction, page layout, and visual language.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {COMIC_STYLES.map((style, i) => (
              <div key={style.id} className="reveal group cursor-pointer" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="glass-card-hover overflow-hidden">
                  <div
                    className="h-32 flex items-center justify-center text-5xl opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                    style={{ background: `linear-gradient(135deg, ${style.accentColor}10, transparent)` }}
                  >
                    {style.icon}
                  </div>
                  <div className="p-3 border-t border-ink-mid/10">
                    <h4 className="font-[family-name:var(--font-heading)] text-sm font-medium">{style.name}</h4>
                    <p className="text-xs text-ink-light/40">{style.colorMode} &middot; {style.readingDirection}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS MARQUEE ========== */}
      <section className="relative py-24 overflow-hidden">
        <div className="text-center mb-16 reveal px-4">
          <p className="text-sm font-mono text-violet mb-3 tracking-wider uppercase">Testimonials</p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-light">
            Creators <span className="gradient-text font-semibold">Love</span> It
          </h2>
        </div>
        <div className="relative overflow-hidden">
          <div className="marquee-track">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={`${t.name}-${i}`} className="glass-card p-6 w-80 shrink-0">
                <p className="text-sm text-ink-light/70 italic mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-xs text-white font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{t.name}</span>
                    <p className="text-xs text-ink-light/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section className="relative py-32 px-4" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 reveal">
            <p className="text-sm font-mono text-gold-premium mb-3 tracking-wider uppercase">Pricing</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-light">
              Simple <span className="gradient-text font-semibold">Pricing</span>
            </h2>
            <p className="text-ink-light/50 mt-4">Start free. Scale as you create.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING.map((p, i) => (
              <div
                key={p.tier}
                className={`reveal glass-card p-6 relative transition-all duration-300 ${
                  p.highlight
                    ? 'gradient-border-glow glow-violet'
                    : 'hover:border-ink-mid/20'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet to-cyan text-xs text-white font-mono">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="font-[family-name:var(--font-heading)] text-xl mb-1 font-medium">{p.tier}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black">{p.price}</span>
                  {p.period && <span className="text-sm text-ink-light/40">{p.period}</span>}
                </div>
                <div className="text-sm text-cyan/70 mb-6 font-mono">&#9889; {p.credits} credits/mo</div>
                <ul className="space-y-2 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="text-sm text-ink-light/50 flex items-start gap-2">
                      <span className="text-violet mt-0.5">&#10003;</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    p.highlight ? 'btn-primary glow-pulse-violet' : 'btn-ghost'
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-32 px-4 text-center overflow-hidden">
        <div className="radial-burst" />
        <div className="reveal relative z-10 cta-sparkles">
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl lg:text-7xl font-black mb-6">
            <span className="gradient-text">Your Story Awaits</span>
          </h2>
          <p className="text-ink-light/40 text-lg mb-10 max-w-md mx-auto">
            Join thousands of creators turning imagination into manga.
          </p>
          <Link href="/create">
            <button className="px-16 py-6 rounded-2xl btn-primary font-[family-name:var(--font-heading)] font-bold text-2xl glow-pulse-cta btn-shimmer">
              Start Forging
            </button>
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-ink-mid/10 py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-lg gradient-text mb-4">InkForge</h3>
            <p className="text-sm text-ink-light/40">AI-powered manga creation platform. From idea to published manga in minutes.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm text-ink-light/60">Product</h4>
            <ul className="space-y-2 text-sm text-ink-light/40">
              <li><Link href="/create" className="hover:text-paper-warm transition-colors">Create</Link></li>
              <li><Link href="/library" className="hover:text-paper-warm transition-colors">Library</Link></li>
              <li><Link href="/store" className="hover:text-paper-warm transition-colors">Store</Link></li>
              <li><Link href="#pricing" className="hover:text-paper-warm transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm text-ink-light/60">Company</h4>
            <ul className="space-y-2 text-sm text-ink-light/40">
              <li><a href="#" className="hover:text-paper-warm transition-colors">About</a></li>
              <li><a href="#" className="hover:text-paper-warm transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-paper-warm transition-colors">API</a></li>
              <li><a href="#" className="hover:text-paper-warm transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm text-ink-light/60">Legal</h4>
            <ul className="space-y-2 text-sm text-ink-light/40">
              <li><a href="#" className="hover:text-paper-warm transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-paper-warm transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-paper-warm transition-colors">Content Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-ink-mid/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-light/20">&copy; 2026 InkForge. Built by Palabre.ai</p>
          <div className="flex gap-4 text-ink-light/20">
            <a href="#" className="hover:text-paper-warm transition-colors text-sm">X</a>
            <a href="#" className="hover:text-paper-warm transition-colors text-sm">Discord</a>
            <a href="#" className="hover:text-paper-warm transition-colors text-sm">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
