'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getClientUserId } from '@/lib/client-user';

type UsageResponse = {
  tier: 'free' | 'starter' | 'pro' | 'unlimited';
  dailyLimit: number;
  remaining: number | null;
};

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [usage, setUsage] = useState<UsageResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const userId = getClientUserId();

    fetch(`/api/usage?userId=${encodeURIComponent(userId)}`, {
      signal: controller.signal,
      headers: { 'x-user-id': userId },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return;
        setUsage(data as UsageResponse);
      })
      .catch(() => {
        // Silent failure to avoid noisy navigation errors.
      });

    return () => controller.abort();
  }, []);

  if (pathname.startsWith('/read') || pathname.startsWith('/chat')) return null;

  const links = [
    { href: '/create', label: 'Create' },
    { href: '/library', label: 'Library' },
    { href: '/community', label: 'Community' },
    { href: '/store', label: 'Store' },
    { href: '/settings', label: 'Settings' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);
  const creditText =
    usage && usage.remaining !== null
      ? `${usage.remaining}/${usage.dailyLimit}`
      : usage?.tier === 'unlimited'
        ? '∞'
        : '—';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-[family-name:var(--font-display)] text-lg gradient-text group-hover:opacity-80 transition-opacity">
            InkForge
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors relative ${
                isActive(link.href) ? 'text-paper-warm' : 'text-ink-light hover:text-paper-warm'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-violet to-cyan opacity-70" />
              )}
            </Link>
          ))}

          <div className="h-4 w-px bg-ink-mid/30" />
          <Link href="/settings" className="flex items-center gap-1.5 text-cyan font-mono text-sm" title="Daily credits remaining">
            <span className="animate-pulse-soft">⚡</span>
            <span>{creditText}</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-xs font-bold text-white">
            C
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-ink-light"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-panel mx-4 mb-4 mt-1 rounded-xl overflow-hidden">
          <div className="p-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm transition-colors ${
                  isActive(link.href)
                    ? 'bg-violet/10 text-paper-warm border border-violet/20'
                    : 'text-ink-light hover:bg-ink-wash'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 py-3 rounded-xl bg-ink-deep/50 text-xs text-cyan/80 font-mono">
              Daily credits: {creditText}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
