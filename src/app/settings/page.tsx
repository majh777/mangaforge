'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const CREDIT_PACKS = [
  { id: 'spark', name: 'Spark', credits: 40, bonus: 0, price: '$4.99' },
  { id: 'flame', name: 'Flame', credits: 90, bonus: 10, price: '$9.99' },
  { id: 'blaze', name: 'Blaze', credits: 250, bonus: 25, price: '$24.99' },
  { id: 'inferno', name: 'Inferno', credits: 550, bonus: 75, price: '$49.99' },
  { id: 'supernova', name: 'Supernova', credits: 1200, bonus: 200, price: '$99.99' },
];

const PLANS = [
  { id: 'free', name: 'Free', price: '$0', credits: 10, current: false, features: ['1 project', 'Standard quality', 'Watermarked'] },
  { id: 'starter', name: 'Starter', price: '$9.99/mo', credits: 100, current: true, features: ['5 projects', 'High quality', 'No watermark', 'Basic chat'] },
  { id: 'pro', name: 'Pro', price: '$24.99/mo', credits: 300, current: false, features: ['Unlimited projects', 'Ultra quality', 'Priority queue', 'Full chat', 'Analytics'] },
  { id: 'unlimited', name: 'Unlimited', price: '$49.99/mo', credits: 800, current: false, features: ['Everything in Pro', 'Dedicated capacity', 'Custom styles', 'API access'] },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'credits' | 'subscription' | 'profile' | 'analytics'>('credits');

  const handleBuyPack = async (packId: string) => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'credits', packId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subscription', packId: planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  return (
    <main className="min-h-screen bg-ink-void">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ink-void/80 backdrop-blur-xl border-b border-ink-mid/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-heading)] text-sakura-pink text-lg">MangaForge</Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/create" className="text-ink-light hover:text-paper-warm transition-colors">Create</Link>
            <Link href="/library" className="text-ink-light hover:text-paper-warm transition-colors">Library</Link>
            <Link href="/store" className="text-ink-light hover:text-paper-warm transition-colors">Store</Link>
            <div className="flex items-center gap-1 text-neon-cyan font-mono">⚡ 247</div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-32">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl mb-8">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-ink-deep rounded-xl p-1 mb-10 w-fit">
          {(['credits', 'subscription', 'profile', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm capitalize transition-all ${
                activeTab === tab ? 'bg-ink-wash text-paper-warm font-medium' : 'text-ink-light hover:text-paper-warm'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Current Balance */}
            <div className="glass-card p-8 mb-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ink-light text-sm mb-1">Current Balance</p>
                  <div className="flex items-center gap-3">
                    <span className="font-[family-name:var(--font-display)] text-5xl font-black text-neon-cyan">247</span>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <p className="text-xs text-ink-light/50 mt-2">~30 chapters remaining at your pace</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-light/50">This month&apos;s usage</p>
                  <p className="text-lg font-mono text-paper-warm">53 credits used</p>
                  <div className="w-32 h-2 rounded-full bg-ink-deep mt-2 overflow-hidden">
                    <div className="w-[18%] h-full rounded-full bg-neon-cyan" />
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Packs */}
            <h3 className="font-[family-name:var(--font-heading)] text-xl mb-6">Buy Credits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {CREDIT_PACKS.map((pack, i) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-xl p-5 border transition-all cursor-pointer hover:border-sakura-pink/40 ${
                    pack.id === 'blaze' ? 'border-gold-premium/40 bg-gold-premium/5' : 'border-ink-mid/30 bg-ink-deep/50'
                  }`}
                  onClick={() => handleBuyPack(pack.id)}
                >
                  {pack.id === 'blaze' && <div className="text-xs text-gold-premium font-mono mb-2">⭐ BEST VALUE</div>}
                  <h4 className="font-[family-name:var(--font-heading)] text-lg">{pack.name}</h4>
                  <div className="text-2xl font-black text-neon-cyan my-2">⚡ {pack.credits}</div>
                  {pack.bonus > 0 && <div className="text-xs text-green-400 mb-2">+{pack.bonus} bonus</div>}
                  <div className="text-lg font-bold">{pack.price}</div>
                </motion.div>
              ))}
            </div>

            {/* Usage Breakdown */}
            <h3 className="font-[family-name:var(--font-heading)] text-xl mt-12 mb-6">Cost Reference</h3>
            <div className="glass-card p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {[
                  { action: 'Generate Synopsis', cost: '1' },
                  { action: 'Generate Characters', cost: '3' },
                  { action: 'Generate Chapter', cost: '8' },
                  { action: 'Regenerate Page (4 variants)', cost: '2' },
                  { action: 'Remix to New Style', cost: '6' },
                  { action: 'Translate Chapter', cost: '1' },
                  { action: 'Chat (10 messages)', cost: '1' },
                  { action: 'Export (PDF/CBZ)', cost: '0' },
                ].map(item => (
                  <div key={item.action} className="flex items-center justify-between bg-ink-wash/50 rounded-lg px-3 py-2">
                    <span className="text-ink-light">{item.action}</span>
                    <span className="font-mono text-neon-cyan">⚡{item.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-xl p-6 border transition-all ${
                    plan.current
                      ? 'border-neon-cyan/50 bg-neon-cyan/5'
                      : plan.id === 'pro'
                      ? 'border-sakura-pink/40 bg-sakura-pink/5'
                      : 'border-ink-mid/30 bg-ink-deep/50'
                  }`}
                >
                  {plan.current && <div className="text-xs text-neon-cyan font-mono mb-2">✓ CURRENT PLAN</div>}
                  {plan.id === 'pro' && !plan.current && <div className="text-xs text-sakura-pink font-mono mb-2">⭐ RECOMMENDED</div>}
                  <h4 className="font-[family-name:var(--font-heading)] text-xl mb-1">{plan.name}</h4>
                  <div className="text-2xl font-black mb-1">{plan.price}</div>
                  <div className="text-sm text-neon-cyan mb-4">⚡ {plan.credits} credits/mo</div>
                  <ul className="space-y-1.5 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="text-xs text-ink-light flex items-start gap-2">
                        <span className="text-sakura-pink">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  {!plan.current && plan.id !== 'free' && (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        plan.id === 'pro'
                          ? 'bg-sakura-pink text-paper-pure hover:bg-sakura-soft'
                          : 'bg-ink-wash text-paper-warm hover:bg-ink-mid border border-ink-mid'
                      }`}
                    >
                      Upgrade to {plan.name}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg">
            <div className="glass-card p-6 space-y-6">
              <div>
                <label className="text-sm text-ink-light mb-2 block">Display Name</label>
                <input type="text" defaultValue="Creator_42" className="w-full px-4 py-2.5 rounded-xl bg-ink-deep border border-ink-mid text-paper-warm text-sm outline-none focus:border-neon-cyan/50 transition-colors" />
              </div>
              <div>
                <label className="text-sm text-ink-light mb-2 block">Email</label>
                <input type="email" defaultValue="creator@example.com" className="w-full px-4 py-2.5 rounded-xl bg-ink-deep border border-ink-mid text-paper-warm text-sm outline-none focus:border-neon-cyan/50 transition-colors" />
              </div>
              <div>
                <label className="text-sm text-ink-light mb-2 block">Content Rating Preference</label>
                <select className="w-full px-4 py-2.5 rounded-xl bg-ink-deep border border-ink-mid text-paper-warm text-sm outline-none">
                  <option>G — General</option>
                  <option>PG — Parental Guidance</option>
                  <option selected>PG-13 — Some Mature</option>
                  <option>R — Mature</option>
                  <option>M — Adults Only</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-ink-light mb-2 block">Preferred Language</label>
                <select className="w-full px-4 py-2.5 rounded-xl bg-ink-deep border border-ink-mid text-paper-warm text-sm outline-none">
                  <option>English</option>
                  <option>日本語 (Japanese)</option>
                  <option>한국어 (Korean)</option>
                  <option>Français (French)</option>
                  <option>Español (Spanish)</option>
                  <option>Português (Portuguese)</option>
                  <option>中文 (Chinese)</option>
                  <option>العربية (Arabic)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-light">Push Notifications</span>
                <button className="w-12 h-6 rounded-full bg-neon-cyan/30 relative">
                  <div className="w-5 h-5 rounded-full bg-neon-cyan absolute right-0.5 top-0.5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-light">Creation Streak Reminders</span>
                <button className="w-12 h-6 rounded-full bg-neon-cyan/30 relative">
                  <div className="w-5 h-5 rounded-full bg-neon-cyan absolute right-0.5 top-0.5" />
                </button>
              </div>
              <button className="w-full py-3 rounded-xl bg-sakura-pink text-paper-pure font-semibold text-sm hover:bg-sakura-soft transition-colors">
                Save Changes
              </button>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid md:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Total Chapters', value: '34', icon: '📖' },
                { label: 'Total Pages', value: '748', icon: '📄' },
                { label: 'Store Sales', value: '$127.50', icon: '💰' },
                { label: 'Creation Streak', value: '🔥 x 7', icon: '🔥' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5 text-center"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="font-[family-name:var(--font-display)] text-2xl font-black">{stat.value}</div>
                  <div className="text-xs text-ink-light mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h3 className="font-[family-name:var(--font-heading)] text-lg mb-4">Credit Usage (Last 30 Days)</h3>
              <div className="h-48 flex items-end gap-1">
                {Array.from({ length: 30 }, (_, i) => {
                  const h = Math.random() * 80 + 10;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all hover:opacity-80 cursor-pointer"
                      style={{
                        height: `${h}%`,
                        background: `linear-gradient(to top, #FF6B9D${h > 50 ? '' : '80'}, #00F5FF${h > 50 ? '' : '40'})`,
                      }}
                      title={`Day ${i + 1}: ${Math.floor(h / 10)} credits`}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
