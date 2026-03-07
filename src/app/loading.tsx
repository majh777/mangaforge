export default function GlobalLoading() {
  return (
    <main className="min-h-screen mesh-gradient flex items-center justify-center px-4">
      <div className="glass-card p-10 text-center max-w-sm w-full">
        <div className="w-14 h-14 mx-auto rounded-full border border-violet/40 border-t-transparent animate-spin mb-5" />
        <h1 className="font-[family-name:var(--font-heading)] text-2xl mb-2">InkForge is loading</h1>
        <p className="text-ink-light/65 text-sm">Preparing your creative workspace…</p>
      </div>
    </main>
  );
}
