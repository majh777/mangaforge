'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';

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
    <main className="min-h-screen bg-ink-void mesh-gradient">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-32">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-light mb-8">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 mb-10 w-fit">
          {(['credits', 'subscription', 'profile', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm capitalize transition-all ${
                activeTab === tab ? 'bg-violet/15 text-paper-warm font-medium border border-violet/10' : 'text-ink-light/60 hover:text-paper-warm'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card p-8 mb-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ink-light/40 text-sm mb-1">Current Balance</p>
                  <div className="flex items-center gap-3">
                    <span className="font-[family-name:var(--font-display)] text-5xl font-black gradient-text">247</span>
                    <span className="text-2xl">&#9889;</span>
                  </div>
                  <p className="text-xs text-ink-light/30 mt-2">~30 chapters remaining at your pace</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-light/30">This month&apos;s usage</p>
                  <p className="text-lg font-mono text-paper-warm/80">53 credits used</p>
                  <div className="w-32 h-1.5 rounded-full bg-ink-deep mt-2 overflow-hidden">
                    <div className="w-[18%] h-full rounded-full bg-gradient-to-r from-violet to-pink" />
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-[family-name:var(--font-heading)] text-xl font-light mb-6">Buy Credits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {CREDIT_PACKS.map((pack, i) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`glass-card-hover p-5 cursor-pointer ${
                    pack.id === 'blaze' ? 'gradient-border-glow' : ''
                  }`}
                  onClick={() => handleBuyPack(pack.id)}
                >
                  {pack.id === 'blaze' && <div className="text-xs text-gold-premium font-mono mb-2">BEST VALUE</div>}
                  <h4 className="font-[family-name:var(--font-heading)] text-lg font-medium">{pack.name}</h4>
                  <div className="text-2xl font-black gradient-text my-2">&#9889; {pack.credits}</div>
                  {pack.bonus > 0 && <div className="text-xs text-forest-green mb-2">+{pack.bonus} bonus</div>}
                  <div className="text-lg font-bold">{pack.price}</div>
                </motion.div>
              ))}
            </div>

            <h3 className="font-[family-name:var(--font-heading)] text-xl font-light mt-12 mb-6">Cost Reference</h3>
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
                  <div key={item.action} className="flex items-center justify-between bg-ink-wash/30 rounded-lg px-3 py-2">
                    <span className="text-ink-light/50">{item.action}</span>
                    <span className="font-mono text-violet">&#9889;{item.cost}</span>
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
                  className={`glass-card p-6 transition-all ${
                    plan.current
                      ? 'gradient-border-glow glow-cyan'
                      : plan.id === 'pro'
                      ? 'gradient-border-glow glow-violet'
                      : ''
                  }`}
                >
                  {plan.current && <div className="text-xs text-cyan font-mono mb-2">&#10003; CURRENT PLAN</div>}
                  {plan.id === 'pro' && !plan.current && <div className="text-xs text-violet font-mono mb-2">RECOMMENDED</div>}
                  <h4 className="font-[family-name:var(--font-heading)] text-xl font-medium mb-1">{plan.name}</h4>
                  <div className="text-2xl font-black mb-1">{plan.price}</div>
                  <div className="text-sm text-cyan/60 mb-4 font-mono">&#9889; {plan.credits} credits/mo</div>
                  <ul className="space-y-1.5 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="text-xs text-ink-light/50 flex items-start gap-2">
                        <span className="text-violet">&#10003;</span> {f}
                      </li>
                    ))}
                  </ul>
                  {!plan.current && plan.id !== 'free' && (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        plan.id === 'pro' ? 'btn-primary' : 'btn-ghost'
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
                <label className="text-sm text-ink-light/40 mb-2 block">Display Name</label>
                <input type="text" defaultValue="Creator_42" className="w-full input-glass px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm text-ink-light/40 mb-2 block">Email</label>
                <input type="email" defaultValue="creator@example.com" className="w-full input-glass px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm text-ink-light/40 mb-2 block">Content Rating Preference</label>
                <select defaultValue="PG-13" className="w-full input-glass px-4 py-2.5 text-sm">
                  <option value="G">G &mdash; General</option>
                  <option value="PG">PG &mdash; Parental Guidance</option>
                  <option value="PG-13">PG-13 &mdash; Some Mature</option>
                  <option value="R">R &mdash; Mature</option>
                  <option value="M">M &mdash; Adults Only</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-ink-light/40 mb-2 block">Preferred Language</label>
                <select className="w-full input-glass px-4 py-2.5 text-sm">
                  <option>English</option>
                  <option>Japanese</option>
                  <option>Korean</option>
                  <option>French</option>
                  <option>Spanish</option>
                  <option>Portuguese</option>
                  <option>Chinese</option>
                  <option>Arabic</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-light/40">Push Notifications</span>
                <button className="w-12 h-6 rounded-full bg-violet/30 relative">
                  <div className="w-5 h-5 rounded-full bg-violet absolute right-0.5 top-0.5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-light/40">Creation Streak Reminders</span>
                <button className="w-12 h-6 rounded-full bg-violet/30 relative">
                  <div className="w-5 h-5 rounded-full bg-violet absolute right-0.5 top-0.5" />
                </button>
              </div>
              <button className="w-full py-3 rounded-xl btn-primary text-sm">
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
                { label: 'Total Chapters', value: '34' },
                { label: 'Total Pages', value: '748' },
                { label: 'Store Sales', value: '$127.50' },
                { label: 'Creation Streak', value: '7 days' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5 text-center"
                >
                  <div className="font-[family-name:var(--font-display)] text-2xl font-black gradient-text">{stat.value}</div>
                  <div className="text-xs text-ink-light/40 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-light mb-4">Credit Usage (Last 30 Days)</h3>
              <div className="h-48 flex items-end gap-1">
                {Array.from({ length: 30 }, (_, i) => {
                  const h = Math.random() * 80 + 10;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all hover:opacity-80 cursor-pointer"
                      style={{
                        height: `${h}%`,
                        background: `linear-gradient(to top, #7C3AED${h > 50 ? '' : '80'}, #06B6D4${h > 50 ? '' : '40'})`,
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
