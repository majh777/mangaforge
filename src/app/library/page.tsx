'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const VoxelBackground = dynamic(() => import('@/components/voxel-background'), { ssr: false });

type ViewMode = 'shelf' | 'grid' | 'list';
type ProjectStatus = 'draft' | 'in_progress' | 'published' | 'archived';

interface Project {
  id: string;
  title: string;
  style: string;
  styleIcon: string;
  chapters: number;
  totalChapters: number;
  pages: number;
  words: number;
  status: ProjectStatus;
  coverColor: string;
  lastEdited: string;
  contentRating: string;
}

const DEMO_PROJECTS: Project[] = [
  { id: '1', title: 'Blade of the Eternal Night', style: 'Shōnen Manga', styleIcon: '⚡', chapters: 4, totalChapters: 12, pages: 88, words: 12400, status: 'in_progress', coverColor: '#FF6B9D', lastEdited: '2 hours ago', contentRating: 'PG-13' },
  { id: '2', title: 'Moonlit Garden', style: 'Shōjo Manga', styleIcon: '🌸', chapters: 7, totalChapters: 10, pages: 154, words: 28000, status: 'in_progress', coverColor: '#C084FC', lastEdited: '1 day ago', contentRating: 'PG' },
  { id: '3', title: 'Steel Requiem', style: 'Seinen Manga', styleIcon: '🗡️', chapters: 12, totalChapters: 12, pages: 264, words: 45000, status: 'published', coverColor: '#64748B', lastEdited: '3 days ago', contentRating: 'R' },
  { id: '4', title: 'The Jade Emperor\'s Court', style: 'Manhua', styleIcon: '🐉', chapters: 2, totalChapters: 24, pages: 40, words: 6200, status: 'draft', coverColor: '#F59E0B', lastEdited: '1 week ago', contentRating: 'PG-13' },
  { id: '5', title: 'Solo Return', style: 'Manhwa', styleIcon: '💎', chapters: 15, totalChapters: 20, pages: 375, words: 52000, status: 'in_progress', coverColor: '#3B82F6', lastEdited: '5 hours ago', contentRating: 'PG-13' },
  { id: '6', title: 'Paris Ink', style: 'Franco-Belgian BD', styleIcon: '🎭', chapters: 3, totalChapters: 5, pages: 132, words: 18000, status: 'in_progress', coverColor: '#10B981', lastEdited: '2 days ago', contentRating: 'PG' },
];

const STATUS_BADGES: Record<ProjectStatus, { color: string; label: string }> = {
  draft: { color: 'bg-ink-mid text-ink-light', label: 'Draft' },
  in_progress: { color: 'bg-neon-cyan/20 text-neon-cyan', label: 'In Progress' },
  published: { color: 'bg-green-500/20 text-green-400', label: 'Published' },
  archived: { color: 'bg-ink-wash text-ink-light/50', label: 'Archived' },
};

function ShelfView({ projects }: { projects: Project[] }) {
  return (
    <div className="relative">
      {/* Wooden shelf effect */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, rotateY: -20 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer"
          >
            <Link href={`/library/${p.id}`}>
              <div className="relative perspective-1000">
                {/* Book spine */}
                <div
                  className="relative h-64 rounded-lg overflow-hidden border border-ink-mid/30 group-hover:border-sakura-pink/40 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-sakura-pink/10"
                  style={{ background: `linear-gradient(135deg, ${p.coverColor}30, ${p.coverColor}10, transparent)` }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{p.styleIcon}</div>
                    <h3 className="font-[family-name:var(--font-heading)] text-sm leading-tight mb-2">{p.title}</h3>
                    <div className="text-xs text-ink-light">{p.chapters}/{p.totalChapters} ch</div>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-ink-deep">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${(p.chapters / p.totalChapters) * 100}%`,
                        background: p.status === 'published' ? '#10B981' : p.coverColor,
                      }}
                    />
                  </div>
                </div>
                {/* Status badge */}
                <div className={`mt-2 text-center text-xs px-2 py-0.5 rounded-full inline-flex ${STATUS_BADGES[p.status].color}`}>
                  {STATUS_BADGES[p.status].label}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GridView({ projects }: { projects: Project[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <Link href={`/library/${p.id}`}>
            <div className="glass-card overflow-hidden group hover:border-sakura-pink/30 transition-all">
              <div
                className="h-40 flex items-center justify-center text-6xl"
                style={{ background: `linear-gradient(135deg, ${p.coverColor}20, transparent)` }}
              >
                {p.styleIcon}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-[family-name:var(--font-heading)] text-lg group-hover:text-sakura-pink transition-colors">{p.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGES[p.status].color}`}>{STATUS_BADGES[p.status].label}</span>
                </div>
                <p className="text-sm text-ink-light mb-3">{p.style}</p>
                <div className="flex justify-between text-xs text-ink-light/60">
                  <span>{p.chapters}/{p.totalChapters} chapters</span>
                  <span>{p.pages} pages</span>
                  <span>{(p.words / 1000).toFixed(1)}K words</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-ink-deep overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(p.chapters / p.totalChapters) * 100}%`,
                      background: `linear-gradient(90deg, ${p.coverColor}, ${p.coverColor}80)`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-ink-light/40">
                  <span>{p.contentRating}</span>
                  <span>{p.lastEdited}</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function ListView({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-ink-light/50 font-mono">
        <div className="col-span-4">Title</div>
        <div className="col-span-2">Style</div>
        <div className="col-span-1">Ch</div>
        <div className="col-span-1">Pages</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Last Edited</div>
      </div>
      {projects.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link href={`/library/${p.id}`}>
            <div className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-ink-wash/50 transition-colors items-center cursor-pointer">
              <div className="col-span-4 flex items-center gap-3">
                <span className="text-lg">{p.styleIcon}</span>
                <span className="font-medium text-sm">{p.title}</span>
              </div>
              <div className="col-span-2 text-sm text-ink-light">{p.style}</div>
              <div className="col-span-1 text-sm text-ink-light">{p.chapters}/{p.totalChapters}</div>
              <div className="col-span-1 text-sm text-ink-light">{p.pages}</div>
              <div className="col-span-2"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGES[p.status].color}`}>{STATUS_BADGES[p.status].label}</span></div>
              <div className="col-span-2 text-sm text-ink-light/50">{p.lastEdited}</div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');

  const filtered = filter === 'all' ? DEMO_PROJECTS : DEMO_PROJECTS.filter(p => p.status === filter);

  return (
    <main className="min-h-screen relative">
      <VoxelBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ink-void/80 backdrop-blur-xl border-b border-ink-mid/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-heading)] text-sakura-pink text-lg">MangaForge</Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/create" className="text-ink-light hover:text-paper-warm transition-colors">Create</Link>
            <Link href="/library" className="text-paper-warm">Library</Link>
            <Link href="/store" className="text-ink-light hover:text-paper-warm transition-colors">Store</Link>
            <div className="flex items-center gap-1 text-neon-cyan font-mono">
              <span>⚡</span><span>247</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl mb-2">
              The <span className="text-gold-premium">Archive</span>
            </h1>
            <p className="text-ink-light">{DEMO_PROJECTS.length} projects · {DEMO_PROJECTS.reduce((a, p) => a + p.pages, 0)} pages total</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Filters */}
            <div className="flex gap-1 bg-ink-deep rounded-lg p-1">
              {(['all', 'in_progress', 'published', 'draft'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-all ${filter === f ? 'bg-ink-wash text-paper-warm' : 'text-ink-light hover:text-paper-warm'}`}
                >
                  {f === 'all' ? 'All' : f === 'in_progress' ? 'Active' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {/* View toggles */}
            <div className="flex gap-1 bg-ink-deep rounded-lg p-1">
              {([['shelf', '📚'], ['grid', '⊞'], ['list', '≡']] as [ViewMode, string][]).map(([mode, icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === mode ? 'bg-ink-wash' : 'text-ink-light hover:text-paper-warm'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
            {/* New project */}
            <Link href="/create">
              <button className="px-4 py-2 rounded-lg bg-sakura-pink text-paper-pure text-sm font-semibold hover:bg-sakura-soft transition-colors">
                + New Project
              </button>
            </Link>
          </div>
        </div>

        {/* Projects */}
        <AnimatePresence mode="wait">
          <motion.div key={viewMode + filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {viewMode === 'shelf' && <ShelfView projects={filtered} />}
            {viewMode === 'grid' && <GridView projects={filtered} />}
            {viewMode === 'list' && <ListView projects={filtered} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
