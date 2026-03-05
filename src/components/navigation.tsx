'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname.startsWith('/read') || pathname.startsWith('/chat')) return null;

  const links = [
    { href: '/create', label: 'Create' },
    { href: '/library', label: 'Library' },
    { href: '/store', label: 'Store' },
    { href: '/settings', label: 'Settings' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-[family-name:var(--font-display)] text-lg gradient-text group-hover:opacity-80 transition-opacity">
            InkForge
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-colors relative ${
                isActive(l.href) ? 'text-paper-warm' : 'text-ink-light hover:text-paper-warm'
              }`}
            >
              {l.label}
              {isActive(l.href) && (
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-violet to-cyan opacity-60" />
              )}
            </Link>
          ))}
          <div className="h-4 w-px bg-ink-mid/30" />
          <Link href="/settings" className="flex items-center gap-1.5 text-cyan font-mono text-sm">
            <span className="animate-pulse-soft">&#9889;</span>
            <span>247</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-xs font-bold text-white">
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
      {mobileOpen && (
        <div className="md:hidden glass-panel mx-4 mb-4 mt-1 rounded-xl overflow-hidden">
          <div className="p-3 space-y-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm transition-colors ${
                  isActive(l.href) ? 'bg-violet/10 text-paper-warm border border-violet/20' : 'text-ink-light hover:bg-ink-wash'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
