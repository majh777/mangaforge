import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen mesh-gradient flex items-center justify-center px-4">
      <div className="glass-card p-10 text-center max-w-md w-full">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan/70 mb-3">404</p>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl mb-3">Panel not found</h1>
        <p className="text-ink-light/70 mb-6">
          This page does not exist or may have been removed from the storyboard.
        </p>
        <Link href="/" className="btn-primary px-6 py-3 text-sm inline-block">
          Back to InkForge
        </Link>
      </div>
    </main>
  );
}
