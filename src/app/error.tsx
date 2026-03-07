'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[InkForge] Unhandled route error:', error);
  }, [error]);

  return (
    <main className="min-h-screen mesh-gradient flex items-center justify-center px-4">
      <div className="glass-card p-10 text-center max-w-lg w-full">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl mb-3">Something broke mid-panel</h1>
        <p className="text-ink-light/70 mb-6">
          InkForge hit an unexpected issue while rendering this page.
        </p>
        <button onClick={reset} className="btn-primary px-6 py-3 text-sm">
          Retry
        </button>
      </div>
    </main>
  );
}
