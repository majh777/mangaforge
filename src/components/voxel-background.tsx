'use client';

import React, { useState, useEffect } from 'react';

// Pure CSS animated background — works everywhere, no WebGL needed
function CSSBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute w-[600px] h-[600px] -top-40 -left-40 rounded-full bg-sakura-pink/5 blur-[120px] animate-pulse" />
      <div
        className="absolute w-[500px] h-[500px] top-1/3 -right-20 rounded-full bg-neon-cyan/5 blur-[100px] animate-pulse"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute w-[400px] h-[400px] -bottom-20 left-1/3 rounded-full bg-[#8B5CF6]/5 blur-[80px] animate-pulse"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,107,157,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// Inline error boundary for Three.js — falls back to CSS if WebGL crashes
class ThreeErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn('[MangaForge] WebGL background failed, using CSS fallback:', err.message);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default function VoxelBackground() {
  const [ThreeComp, setThreeComp] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // Skip Three.js on devices with no WebGL or low-end GPUs
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return; // No WebGL — stay on CSS
    } catch {
      return;
    }

    import('./voxel-three')
      .then((mod) => setThreeComp(() => mod.default))
      .catch(() => {});
  }, []);

  if (!ThreeComp) return <CSSBackground />;
  return (
    <ThreeErrorBoundary fallback={<CSSBackground />}>
      <ThreeComp />
    </ThreeErrorBoundary>
  );
}
