'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/navigation';

interface ShowcaseItem {
  id: string;
  title: string;
  creator: string;
  style: string;
  tags: string[];
  likes: number;
  views: number;
  shareSlug: string;
  previewImage?: string;
  chapterCount: number;
  pageCount: number;
  featured?: boolean;
}

function ShowcaseSkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="h-40 rounded-lg shimmer mb-4" />
      <div className="h-4 w-3/4 shimmer rounded mb-2" />
      <div className="h-3 w-1/2 shimmer rounded mb-4" />
      <div className="h-3 w-full shimmer rounded" />
    </div>
  );
}

export default function CommunityPage() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadShowcase() {
      try {
        const response = await fetch('/api/community', { signal: controller.signal });
        if (!response.ok) throw new Error('Failed to load community showcase');

        const data = (await response.json()) as { showcase?: ShowcaseItem[] };
        setItems(data.showcase ?? []);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError('Could not load community showcase right now.');
      } finally {
        setLoading(false);
      }
    }

    loadShowcase();
    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen mesh-gradient">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-mono text-cyan mb-2 tracking-wider uppercase">Community</p>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-light">
              Creator <span className="gradient-text font-semibold">Showcase</span>
            </h1>
            <p className="text-ink-light/65 mt-3 max-w-2xl">
              Discover publicly shared comics from the InkForge community. Explore finished chapters,
              visual styles, and storytelling approaches.
            </p>
          </div>
          <Link href="/create" className="btn-primary px-5 py-3 text-sm w-fit">
            + Publish your own
          </Link>
        </div>

        {error && (
          <div className="glass-card p-4 border border-red-400/20 text-red-200 text-sm mb-6">{error}</div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }, (_, i) => (
              <ShowcaseSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl mb-2">No showcase projects yet</h2>
            <p className="text-ink-light/60 mb-6">Be the first creator to publish a comic in the community feed.</p>
            <Link href="/create" className="btn-primary px-6 py-3 text-sm inline-block">
              Create a project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card-hover overflow-hidden"
              >
                <Link href={`/share/${item.shareSlug}`}>
                  <div className="h-44 bg-ink-deep relative overflow-hidden">
                    {item.previewImage ? (
                      <img src={item.previewImage} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet/20 to-cyan/20" />
                    )}
                    {item.featured && (
                      <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-gold-premium/20 text-gold-premium border border-gold-premium/40">
                        Featured
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <h2 className="font-[family-name:var(--font-heading)] text-lg font-medium leading-tight">
                    {item.title}
                  </h2>
                  <p className="text-sm text-ink-light/60 mt-1">by {item.creator}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full bg-violet/10 text-violet border border-violet/20">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 text-xs text-ink-light/55 flex items-center justify-between">
                    <span>{item.style}</span>
                    <span>
                      {item.chapterCount} ch · {item.pageCount} pages
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-ink-light/45 flex items-center justify-between">
                    <span>👁 {item.views}</span>
                    <span>❤️ {item.likes}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
