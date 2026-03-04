'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { COMIC_STYLES } from '@/lib/styles';

const VoxelBackground = dynamic(() => import('@/components/voxel-background'), { ssr: false });
const InkParticles = dynamic(
  () => import('@/components/ink-particles').then((m) => ({ default: m.InkParticles })),
  { ssr: false },
);
const TypewriterText = dynamic(
  () => import('@/components/typewriter-text').then((m) => ({ default: m.TypewriterText })),
  { ssr: false },
);

const FEATURES = [
  { icon: '🧬', title: 'AI Story Engine', desc: 'DeepSeek V3.2 writes multi-arc narratives with hidden overarching plots that unfold across volumes.' },
  { icon: '🎨', title: 'NanoBanana 2 Art', desc: 'State-of-the-art manga generation at $0.02/page. Professional screentones, speed lines, and panel layouts.' },
  { icon: '🔥', title: 'Hook Engine', desc: '10 chapter-end hook types engineered to make you say "just one more chapter" every single time.' },
  { icon: '💬', title: 'Living Characters', desc: '10-model personality matrix makes every character feel real. Chat with them between chapters.' },
  { icon: '🌍', title: '16+ Languages', desc: 'Create manga in any language. Programmatic text overlay ensures perfect rendering everywhere.' },
  { icon: '🏪', title: 'Creator Marketplace', desc: 'Publish and sell your manga. 70/30 creator-platform split. Build an audience and earn.' },
];

const STATS = [
  { value: '12', label: 'Comic Styles', prefix: '', suffix: '' },
  { value: '0.02', label: 'Per Page', prefix: '$', suffix: '' },
  { value: '16', label: 'Languages', prefix: '', suffix: '+' },
  { value: '10', label: 'Hook Types', prefix: '', suffix: '' },
];

const TESTIMONIALS = [
  { name: 'Yuki T.', text: 'I published my first manga volume in 3 days. It would have taken me years to draw.', avatar: '🎌' },
  { name: 'Marcus R.', text: 'The character chat feature is insane. My protagonist feels like a real person.', avatar: '🎭' },
  { name: 'Ava C.', text: 'I can\'t stop hitting "Forge Next Chapter." The cliffhangers are genuinely addicting.', avatar: '📖' },
];

const PRICING = [
  { tier: 'Free', price: '$0', credits: '10', features: ['1 project', 'Standard quality', 'Watermarked exports', '20 chat messages/mo'], cta: 'Start Free', highlight: false },
  { tier: 'Starter', price: '$9.99', credits: '100', features: ['5 projects', 'High quality', 'Clean exports', 'Basic character chat'], cta: 'Get Started', highlight: false },
  { tier: 'Pro', price: '$24.99', credits: '300', features: ['Unlimited projects', 'Ultra quality', 'Priority queue', 'Unlimited chat', 'Analytics'], cta: 'Go Pro', highlight: true },
  { tier: 'Unlimited', price: '$49.99', credits: '800', features: ['Everything in Pro', 'Dedicated capacity', 'Custom style training', 'API access', 'Early features'], cta: 'Go Unlimited', highlight: false },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink-void relative overflow-hidden">
      <VoxelBackground />
      <InkParticles />

      {/* ========== HERO ========== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
        <div className="animate-slideUp">
          <h1 className="font-[family-name:var(--font-display)] text-6xl md:text-8xl lg:text-9xl font-black leading-none mb-4">
            <span className="bg-gradient-to-r from-sakura-pink via-[#FF8FAB] to-neon-cyan bg-clip-text text-transparent">
              MangaForge
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-paper-warm/80 mb-3 font-[family-name:var(--font-body)] animate-fadeIn animation-delay-500">
            Where Stories Come Alive
          </p>
          <div className="text-sm md:text-base text-ink-light italic mb-10 h-8 opacity-60 animate-fadeIn animation-delay-800">
            <TypewriterText />
          </div>
        </div>

        <div className="animate-fadeIn animation-delay-1000">
          <Link href="/create">
            <button className="group relative px-12 py-5 rounded-2xl bg-sakura-pink text-paper-pure font-[family-name:var(--font-heading)] font-bold text-xl overflow-hidden sakura-glow-pulse hover:scale-105 transition-transform">
              <span className="relative z-10 flex items-center gap-3">
                Start Creating
                <span className="inline-block animate-bounceX">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-sakura-pink to-[#FF8FAB] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </Link>
          <p className="mt-4 text-xs text-ink-light/50">No credit card required · 10 free credits</p>
        </div>

        <div className="absolute bottom-10 animate-bounce">
          <svg className="w-6 h-6 text-ink-light/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="relative py-12 border-y border-ink-mid/20">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-black text-paper-warm">
                {s.prefix && <span className="text-neon-cyan text-2xl">{s.prefix}</span>}
                {s.value}
                {s.suffix && <span className="text-sakura-pink">{s.suffix}</span>}
              </div>
              <div className="text-sm text-ink-light mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="relative py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl text-center mb-20">
            From <span className="text-neon-cyan">Idea</span> to <span className="text-sakura-pink">Manga</span> in Minutes
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Describe', desc: 'Type your story idea — from a single sentence to a detailed plot.', icon: '✍️' },
              { step: '02', title: 'Choose', desc: 'Pick from 12 authentic comic styles — shōnen, manhwa, BD, and more.', icon: '🎨' },
              { step: '03', title: 'Generate', desc: 'Watch your manga come to life page by page in real-time.', icon: '⚡' },
              { step: '04', title: 'Share', desc: 'Publish to the marketplace or export for print.', icon: '🌟' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center group">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-xs font-mono text-neon-cyan mb-2">{item.step}</div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl mb-2">{item.title}</h3>
                <p className="text-sm text-ink-light">{item.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-8 -right-4 text-ink-mid/30 text-3xl">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl text-center mb-4">
            Built <span className="text-sakura-pink">Different</span>
          </h2>
          <p className="text-center text-ink-light mb-20 max-w-xl mx-auto">Not another AI toy. A production-grade creative platform.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card p-6 group hover:border-sakura-pink/30 transition-colors">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg mb-2 group-hover:text-sakura-pink transition-colors">{f.title}</h3>
                <p className="text-sm text-ink-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== STYLE SHOWCASE ========== */}
      <section className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl text-center mb-4">
            12 Authentic <span className="text-neon-cyan">Styles</span>
          </h2>
          <p className="text-center text-ink-light mb-16">Each with authentic reading direction, page layout, and visual language.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {COMIC_STYLES.map((style) => (
              <div key={style.id} className="group cursor-pointer">
                <div
                  className="relative rounded-xl overflow-hidden border border-ink-mid/30 hover:border-sakura-pink/50 transition-all duration-300"
                  style={{ background: `linear-gradient(135deg, ${style.accentColor}15, transparent)` }}
                >
                  <div className="h-32 flex items-center justify-center text-5xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    {style.icon}
                  </div>
                  <div className="p-3 bg-ink-deep/80 backdrop-blur">
                    <h4 className="font-[family-name:var(--font-heading)] text-sm">{style.name}</h4>
                    <p className="text-xs text-ink-light">{style.colorMode} · {style.readingDirection}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl text-center mb-16">
            Creators <span className="text-sakura-pink">Love</span> It
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass-card p-6">
                <p className="text-sm text-ink-light italic mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{t.avatar}</div>
                  <span className="text-sm font-medium">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section className="relative py-32 px-4" id="pricing">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl text-center mb-4">
            Simple <span className="text-gold-premium">Pricing</span>
          </h2>
          <p className="text-center text-ink-light mb-16">Start free. Scale as you create.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING.map((p) => (
              <div
                key={p.tier}
                className={`rounded-2xl p-6 border transition-all ${
                  p.highlight
                    ? 'border-sakura-pink/50 bg-sakura-pink/5 shadow-lg shadow-sakura-pink/10'
                    : 'border-ink-mid/30 bg-ink-deep/50'
                }`}
              >
                {p.highlight && <div className="text-xs font-mono text-sakura-pink mb-3">⭐ MOST POPULAR</div>}
                <h3 className="font-[family-name:var(--font-heading)] text-xl mb-1">{p.tier}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black">{p.price}</span>
                  {p.price !== '$0' && <span className="text-sm text-ink-light">/mo</span>}
                </div>
                <div className="text-sm text-neon-cyan mb-6">⚡ {p.credits} credits/mo</div>
                <ul className="space-y-2 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="text-sm text-ink-light flex items-start gap-2">
                      <span className="text-sakura-pink mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    p.highlight
                      ? 'bg-sakura-pink text-paper-pure hover:bg-sakura-soft sakura-glow-pulse'
                      : 'bg-ink-wash text-paper-warm hover:bg-ink-mid border border-ink-mid'
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
      <section className="relative py-32 px-4 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl font-black mb-6">
          <span className="bg-gradient-to-r from-sakura-pink to-neon-cyan bg-clip-text text-transparent">
            Your Story Awaits
          </span>
        </h2>
        <p className="text-ink-light text-lg mb-10 max-w-md mx-auto">
          Join thousands of creators turning imagination into manga.
        </p>
        <Link href="/create">
          <button className="px-16 py-6 rounded-2xl bg-sakura-pink text-paper-pure font-[family-name:var(--font-heading)] font-bold text-2xl sakura-glow-pulse hover:scale-105 transition-transform">
            ⚒️ Start Forging
          </button>
        </Link>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-ink-mid/20 py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-lg text-sakura-pink mb-4">MangaForge</h3>
            <p className="text-sm text-ink-light">AI-powered manga creation platform. From idea to published manga in minutes.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-ink-light">
              <li><Link href="/create" className="hover:text-paper-warm transition-colors">Create</Link></li>
              <li><Link href="/library" className="hover:text-paper-warm transition-colors">Library</Link></li>
              <li><Link href="/store" className="hover:text-paper-warm transition-colors">Store</Link></li>
              <li><Link href="#pricing" className="hover:text-paper-warm transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-ink-light">
              <li><a href="#" className="hover:text-paper-warm transition-colors">About</a></li>
              <li><a href="#" className="hover:text-paper-warm transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-paper-warm transition-colors">API</a></li>
              <li><a href="#" className="hover:text-paper-warm transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-ink-light">
              <li><a href="#" className="hover:text-paper-warm transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-paper-warm transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-paper-warm transition-colors">Content Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-ink-mid/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-light/50">© 2026 MangaForge. Built by Palabre.ai</p>
          <div className="flex gap-4 text-ink-light/50">
            <a href="#" className="hover:text-paper-warm transition-colors text-lg">𝕏</a>
            <a href="#" className="hover:text-paper-warm transition-colors text-lg">📱</a>
            <a href="#" className="hover:text-paper-warm transition-colors text-lg">💬</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
