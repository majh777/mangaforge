'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/navigation';
import { getClientUserId } from '@/lib/client-user';

const CREDIT_PACKS = [
  { id: 'spark', name: 'Spark', credits: 50, bonus: 0, price: '$4.99', popular: false },
  { id: 'flame', name: 'Flame', credits: 120, bonus: 15, price: '$9.99', popular: false },
  { id: 'blaze', name: 'Blaze', credits: 300, bonus: 50, price: '$24.99', popular: true },
  { id: 'inferno', name: 'Inferno', credits: 700, bonus: 130, price: '$49.99', popular: false },
  { id: 'supernova', name: 'Supernova', credits: 1600, bonus: 320, price: '$99.99', popular: false },
];

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    dailyLimit: 20,
    current: false,
    features: ['Daily credit reset', '1 active project', 'Public share links', 'Community showcase'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$9.99/mo',
    dailyLimit: 250,
    current: false,
    features: ['5 active projects', 'Priority generation', 'No watermark', 'Character chat'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$24.99/mo',
    dailyLimit: 1000,
    current: false,
    features: ['Unlimited projects', 'Faster batch generation', 'Advanced styles', 'Publishing analytics'],
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$49.99/mo',
    dailyLimit: 999999,
    current: false,
    features: ['Dedicated throughput', 'Studio workflows', 'Priority support', 'Roadmap access'],
  },
];

interface UsagePayload {
  tier: 'free' | 'starter' | 'pro' | 'unlimited';
  dailyLimit: number;
  remaining: number | null;
  usage: {
    creditsUsed: number;
    requests: number;
    byFeature: Record<string, number>;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'credits' | 'subscription' | 'profile' | 'analytics'>('credits');
  const [usage, setUsage] = useState<UsagePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingPack, setProcessingPack] = useState<string | null>(null);

  const userId = useMemo(() => getClientUserId(), []);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/usage?userId=${encodeURIComponent(userId)}`, {
      signal: controller.signal,
      headers: { 'x-user-id': userId },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload) {
          setUsage(payload as UsagePayload);
        }
      })
      .catch(() => {
        setError('Unable to load current usage data.');
      });

    return () => controller.abort();
  }, [userId]);

  const handleCheckout = async (type: 'credits' | 'subscription', packId: string) => {
    setError(null);
    setProcessingPack(`${type}:${packId}`);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          type,
          packId,
          userId,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Checkout failed');
      }

      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message || 'Checkout failed');
    } finally {
      setProcessingPack(null);
    }
  };

  const dailyLimit = usage?.dailyLimit ?? 20;
  const remaining = usage?.remaining ?? Math.max(dailyLimit - (usage?.usage.creditsUsed || 0), 0);
  const used = usage?.usage.creditsUsed ?? 0;
  const usagePercent = dailyLimit > 0 ? Math.min((used / dailyLimit) * 100, 100) : 0;

  const normalizedPlans = PLANS.map((plan) => ({
    ...plan,
    current: usage ? usage.tier === plan.id : false,
  }));

  return (
    <main className="min-h-screen bg-ink-void mesh-gradient">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-32">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-light mb-8">Settings</h1>

        {error && <div className="glass-card p-4 border border-red-400/30 text-red-200 text-sm mb-6">{error}</div>}

        <div className="flex gap-1 glass rounded-xl p-1 mb-10 w-fit overflow-x-auto">
          {(['credits', 'subscription', 'profile', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm capitalize transition-all ${
                activeTab === tab
                  ? 'bg-violet/15 text-paper-warm font-medium border border-violet/10'
                  : 'text-ink-light/60 hover:text-paper-warm'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'credits' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card p-8 mb-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <p className="text-ink-light/70 text-sm mb-1">Daily credit window</p>
                  <div className="flex items-center gap-3">
                    <span className="font-[family-name:var(--font-display)] text-5xl font-black gradient-text">
                      {remaining === null ? '∞' : remaining}
                    </span>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <p className="text-xs text-ink-light/60 mt-2">
                    Tier: {usage?.tier || 'free'} · Limit: {dailyLimit === 999999 ? 'Unlimited' : dailyLimit}
                  </p>
                </div>
                <div className="max-w-xs w-full">
                  <p className="text-xs text-ink-light/65 mb-2">Today&apos;s usage: {used} credits</p>
                  <div className="w-full h-2 rounded-full bg-ink-deep overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet to-cyan" style={{ width: `${usagePercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-[family-name:var(--font-heading)] text-xl font-light mb-6">Buy Credit Packs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {CREDIT_PACKS.map((pack, index) => {
                const total = pack.credits + pack.bonus;
                const loading = processingPack === `credits:${pack.id}`;

                return (
                  <motion.button
                    key={pack.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`glass-card-hover p-5 text-left ${pack.popular ? 'gradient-border-glow glow-violet' : ''}`}
                    onClick={() => handleCheckout('credits', pack.id)}
                    disabled={Boolean(processingPack)}
                  >
                    {pack.popular && <div className="text-xs text-gold-premium font-mono mb-2">BEST VALUE</div>}
                    <h4 className="font-[family-name:var(--font-heading)] text-lg font-medium">{pack.name}</h4>
                    <div className="text-2xl font-black gradient-text my-2">⚡ {total}</div>
                    {pack.bonus > 0 && <div className="text-xs text-forest-green mb-2">+{pack.bonus} bonus</div>}
                    <div className="text-lg font-bold">{loading ? 'Opening…' : pack.price}</div>
                  </motion.button>
                );
              })}
            </div>

            <h3 className="font-[family-name:var(--font-heading)] text-xl font-light mt-12 mb-6">Feature Costs</h3>
            <div className="glass-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {[
                  { action: 'Generate synopsis', cost: '1' },
                  { action: 'Generate cast', cost: '3' },
                  { action: 'Generate chapter script + pages', cost: '8+' },
                  { action: 'Regenerate portrait', cost: '2' },
                  { action: 'Public share link', cost: '0' },
                  { action: 'Community publish', cost: '0' },
                  { action: 'PDF/CBZ export', cost: '0' },
                  { action: 'Image pack export', cost: '0' },
                ].map((item) => (
                  <div key={item.action} className="flex items-center justify-between bg-ink-wash/40 rounded-lg px-3 py-2">
                    <span className="text-ink-light/75">{item.action}</span>
                    <span className="font-mono text-violet">⚡ {item.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'subscription' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {normalizedPlans.map((plan, index) => {
                const loading = processingPack === `subscription:${plan.id}`;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className={`glass-card p-6 ${
                      plan.current
                        ? 'gradient-border-glow glow-cyan'
                        : plan.id === 'pro'
                          ? 'gradient-border-glow glow-violet'
                          : ''
                    }`}
                  >
                    {plan.current && <div className="text-xs text-cyan font-mono mb-2">✓ CURRENT PLAN</div>}
                    {plan.id === 'pro' && !plan.current && (
                      <div className="text-xs text-violet font-mono mb-2">RECOMMENDED</div>
                    )}
                    <h4 className="font-[family-name:var(--font-heading)] text-xl font-medium mb-1">{plan.name}</h4>
                    <div className="text-2xl font-black mb-1">{plan.price}</div>
                    <div className="text-sm text-cyan/70 mb-4 font-mono">
                      ⚡ Daily limit: {plan.dailyLimit === 999999 ? 'Unlimited' : plan.dailyLimit}
                    </div>
                    <ul className="space-y-1.5 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="text-xs text-ink-light/75 flex items-start gap-2">
                          <span className="text-violet">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                    {!plan.current && plan.id !== 'free' && (
                      <button
                        onClick={() => handleCheckout('subscription', plan.id)}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold ${plan.id === 'pro' ? 'btn-primary' : 'btn-ghost'}`}
                        disabled={Boolean(processingPack)}
                      >
                        {loading ? 'Opening…' : `Upgrade to ${plan.name}`}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg">
            <div className="glass-card p-6 space-y-6">
              <div>
                <label className="text-sm text-ink-light/65 mb-2 block">Display Name</label>
                <input type="text" defaultValue="Creator" className="w-full input-glass px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm text-ink-light/65 mb-2 block">Email</label>
                <input type="email" defaultValue="creator@example.com" className="w-full input-glass px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm text-ink-light/65 mb-2 block">Preferred Language</label>
                <select className="w-full input-glass px-4 py-2.5 text-sm">
                  <option>English</option>
                  <option>Japanese</option>
                  <option>Korean</option>
                  <option>French</option>
                  <option>Spanish</option>
                </select>
              </div>
              <button className="w-full py-3 rounded-xl btn-primary text-sm">Save Changes</button>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid md:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Requests today', value: usage?.usage.requests ?? 0 },
                { label: 'Credits used', value: usage?.usage.creditsUsed ?? 0 },
                { label: 'Remaining', value: remaining ?? '∞' },
                { label: 'Current tier', value: usage?.tier || 'free' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-5 text-center"
                >
                  <div className="font-[family-name:var(--font-display)] text-2xl font-black gradient-text">{stat.value}</div>
                  <div className="text-xs text-ink-light/65 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-light mb-4">Feature Usage</h3>
              <div className="space-y-2">
                {Object.entries(usage?.usage.byFeature ?? {}).length === 0 ? (
                  <p className="text-sm text-ink-light/65">No tracked usage yet today.</p>
                ) : (
                  Object.entries(usage?.usage.byFeature ?? {}).map(([feature, count]) => (
                    <div key={feature} className="flex items-center justify-between text-sm bg-ink-wash/40 rounded-lg px-3 py-2">
                      <span className="text-ink-light/80">{feature.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-cyan/80">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
