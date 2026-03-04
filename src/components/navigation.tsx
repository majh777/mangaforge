"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 right-0 left-0 z-50 border-b border-ink-mid/20 bg-ink-void/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-display)] text-xl text-sakura-pink">
            MangaForge
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#how-it-works"
            className="ink-underline text-sm text-ink-light transition-colors hover:text-paper-warm"
          >
            How it Works
          </Link>
          <Link
            href="#styles"
            className="ink-underline text-sm text-ink-light transition-colors hover:text-paper-warm"
          >
            Styles
          </Link>
          <Link
            href="#pricing"
            className="ink-underline text-sm text-ink-light transition-colors hover:text-paper-warm"
          >
            Pricing
          </Link>
          <Link
            href="/create"
            className="sakura-glow rounded-full bg-sakura-pink px-6 py-2 text-sm font-semibold text-ink-void transition-all hover:bg-sakura-soft"
          >
            Start Creating
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block h-0.5 w-6 bg-paper-warm"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block h-0.5 w-6 bg-paper-warm"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block h-0.5 w-6 bg-paper-warm"
          />
        </button>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        className="overflow-hidden border-t border-ink-mid/20 md:hidden"
      >
        <div className="flex flex-col gap-4 p-6">
          <Link
            href="#how-it-works"
            onClick={() => setIsOpen(false)}
            className="text-ink-light transition-colors hover:text-paper-warm"
          >
            How it Works
          </Link>
          <Link
            href="#styles"
            onClick={() => setIsOpen(false)}
            className="text-ink-light transition-colors hover:text-paper-warm"
          >
            Styles
          </Link>
          <Link
            href="#pricing"
            onClick={() => setIsOpen(false)}
            className="text-ink-light transition-colors hover:text-paper-warm"
          >
            Pricing
          </Link>
          <Link
            href="/create"
            className="sakura-glow inline-block rounded-full bg-sakura-pink px-6 py-2 text-center text-sm font-semibold text-ink-void"
          >
            Start Creating
          </Link>
        </div>
      </motion.div>
    </motion.nav>
  );
}
