'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { loadBible } from '@/lib/bible';
import { useEffect, useState } from 'react';

interface Step {
  label: string;
  href: string;
  pattern: string;
}

const BASE_STEPS: Step[] = [
  { label: 'Prompt', href: '/create', pattern: '/create' },
  { label: 'Synopsis', href: '/create/synopsis', pattern: '/create/synopsis' },
  { label: 'Characters', href: '/create/characters', pattern: '/create/characters' },
];

export function CreateBreadcrumb() {
  const pathname = usePathname();
  const [chapterCount, setChapterCount] = useState(0);

  useEffect(() => {
    const bible = loadBible();
    setChapterCount(bible?.chapters?.length ?? 0);
  }, [pathname]);

  const steps: Step[] = [
    ...BASE_STEPS,
    // Always show current chapter step
    { label: `Chapter ${chapterCount + 1}`, href: '/create/chapter', pattern: '/create/chapter' },
  ];

  // Add completed chapters
  if (chapterCount > 0) {
    // The last step becomes the next chapter to forge
    steps[steps.length - 1] = {
      label: `Chapter ${chapterCount + 1}`,
      href: '/create/chapter',
      pattern: '/create/chapter',
    };
  }

  const currentIndex = steps.findIndex(s => pathname === s.pattern || pathname.startsWith(s.pattern + '/'));

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-ink-void/80 backdrop-blur-lg border-b border-ink-mid/10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-1 overflow-x-auto scrollbar-hide">
        <Link href="/" className="font-[family-name:var(--font-display)] text-sm gradient-text mr-3 shrink-0">
          InkForge
        </Link>
        {steps.map((step, i) => {
          const isActive = i === currentIndex;
          const isPast = i < currentIndex;
          const isFuture = i > currentIndex;

          return (
            <div key={step.pattern} className="flex items-center shrink-0">
              {i > 0 && (
                <svg className="w-4 h-4 text-ink-light/20 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
              {isPast ? (
                <Link
                  href={step.href}
                  className="px-3 py-1 rounded-full text-xs font-mono text-cyan/70 hover:text-cyan transition-colors bg-cyan/5"
                >
                  {step.label}
                </Link>
              ) : isActive ? (
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-gradient-to-r from-violet to-cyan text-white">
                  {step.label}
                </span>
              ) : (
                <span className={`px-3 py-1 rounded-full text-xs font-mono ${isFuture ? 'text-ink-light/20' : 'text-ink-light/40'}`}>
                  {step.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
