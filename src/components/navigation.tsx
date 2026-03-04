'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't show nav on reader or chat (they have their own)
  if (pathname.startsWith('/read') || pathname.startsWith('/chat')) return null;

  const links = [
    { href: '/create', label: 'Create' },
    { href: '/library', label: 'Library' },
    { href: '/store', label: 'Store' },
    { href: '/settings', label: 'Settings' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ink-void/80 backdrop-blur-xl border-b border-ink-mid/20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-[family-name:var(--font-heading)] text-sakura-pink text-lg hover:text-sakura-soft transition-colors">
          MangaForge
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-colors ${isActive(l.href) ? 'text-paper-warm' : 'text-ink-light hover:text-paper-warm'}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="h-4 w-px bg-ink-mid/30" />
          <Link href="/settings" className="flex items-center gap-1.5 text-neon-cyan font-mono text-sm">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ⚡
            </motion.span>
            <span>247</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sakura-pink to-neon-cyan flex items-center justify-center text-xs font-bold">
            C
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-ink-light" onClick={() => setMobileOpen(!mobileOpen)}>
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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-ink-mid/20 bg-ink-deep"
          >
            <div className="p-4 space-y-2">
              {links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm transition-colors ${
                    isActive(l.href) ? 'bg-ink-wash text-paper-warm' : 'text-ink-light hover:bg-ink-wash'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
