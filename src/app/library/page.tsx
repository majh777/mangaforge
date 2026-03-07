'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { CardSkeleton } from '@/components/skeletons';
import { getClientUserId } from '@/lib/client-user';
import type { ComicProject, ProjectStatus } from '@/lib/types';

type ViewMode = 'shelf' | 'grid' | 'list';

const STATUS_BADGES: Record<ProjectStatus, { color: string; label: string }> = {
  draft: { color: 'bg-ink-mid/20 text-ink-light/80', label: 'Draft' },
  in_progress: { color: 'bg-violet/10 text-violet', label: 'In Progress' },
  published: { color: 'bg-forest-green/10 text-forest-green', label: 'Published' },
  archived: { color: 'bg-ink-wash text-ink-light/55', label: 'Archived' },
};

function projectProgress(project: ComicProject): number {
  const chapterCount = project.chapters.length;
  if (chapterCount === 0) return 5;
  if (project.status === 'published') return 100;
  return Math.min(15 + chapterCount * 18, 95);
}

function getCover(project: ComicProject): string | null {
  if (project.coverImage) return project.coverImage;
  const firstImage = project.chapters[0]?.pages[0]?.imageUrl;
  return firstImage || null;
}

function ShelfView({
  projects,
  onShare,
}: {
  projects: ComicProject[];
  onShare: (projectId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, rotateY: -12 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group"
        >
          <div className="relative">
            <Link href={`/share/${project.shareSlug || project.slug}`}>
              <div className="relative h-64 glass-card overflow-hidden group-hover:border-violet/20 transition-all duration-300 group-hover:-translate-y-1">
                {getCover(project) ? (
                  <img src={getCover(project) || ''} alt={project.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-violet/20 to-cyan/10" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-[family-name:var(--font-heading)] text-sm leading-tight mb-1">{project.title}</h3>
                  <p className="text-xs text-ink-light/70">{project.chapters.length} chapters</p>
                </div>
              </div>
            </Link>

            <div className="mt-2 flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGES[project.status].color}`}>
                {STATUS_BADGES[project.status].label}
              </span>
              <button onClick={() => onShare(project.id)} className="text-xs btn-ghost px-2 py-1">
                Share
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function GridView({
  projects,
  onStatusChange,
  onDelete,
  onShare,
}: {
  projects: ComicProject[];
  onStatusChange: (projectId: string, status: ProjectStatus) => void;
  onDelete: (projectId: string) => void;
  onShare: (projectId: string) => void;
}) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="glass-card-hover overflow-hidden"
        >
          <Link href={`/share/${project.shareSlug || project.slug}`}>
            <div className="h-40 relative overflow-hidden">
              {getCover(project) ? (
                <img src={getCover(project) || ''} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet/15 to-cyan/15" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            </div>
          </Link>

          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-medium leading-tight">{project.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGES[project.status].color}`}>
                {STATUS_BADGES[project.status].label}
              </span>
            </div>

            <p className="text-sm text-ink-light/65 mb-3">
              {project.stylePreset} · {project.style}
            </p>

            <div className="h-1.5 rounded-full bg-ink-deep overflow-hidden mb-3">
              <div className="h-full rounded-full bg-gradient-to-r from-violet to-cyan" style={{ width: `${projectProgress(project)}%` }} />
            </div>

            <div className="text-xs text-ink-light/60 flex justify-between mb-4">
              <span>{project.chapters.length} chapters</span>
              <span>{project.views} views</span>
              <span>{project.likes} likes</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={() => onShare(project.id)} className="btn-ghost py-2 text-xs">
                Share
              </button>
              <button
                onClick={() => onStatusChange(project.id, project.status === 'published' ? 'in_progress' : 'published')}
                className="btn-ghost py-2 text-xs"
              >
                {project.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
            </div>
            <button onClick={() => onDelete(project.id)} className="w-full py-2 text-xs btn-ghost text-red-200">
              Delete
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ListView({
  projects,
  onStatusChange,
}: {
  projects: ComicProject[];
  onStatusChange: (projectId: string, status: ProjectStatus) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs text-ink-light/50 font-mono">
        <div className="col-span-4">Title</div>
        <div className="col-span-2">Preset</div>
        <div className="col-span-2">Chapters</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Updated</div>
      </div>
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
          className="grid grid-cols-12 gap-3 px-4 py-3 rounded-lg hover:bg-ink-wash/25 items-center"
        >
          <div className="col-span-4">
            <p className="font-medium text-sm truncate">{project.title}</p>
            <p className="text-xs text-ink-light/60 truncate">{project.style}</p>
          </div>
          <div className="col-span-2 text-sm text-ink-light/75 capitalize">{project.stylePreset}</div>
          <div className="col-span-2 text-sm text-ink-light/75">{project.chapters.length}</div>
          <div className="col-span-2">
            <button
              onClick={() =>
                onStatusChange(project.id, project.status === 'published' ? 'in_progress' : 'published')
              }
              className={`text-xs px-2 py-1 rounded-full ${STATUS_BADGES[project.status].color}`}
            >
              {STATUS_BADGES[project.status].label}
            </button>
          </div>
          <div className="col-span-2 text-xs text-ink-light/55">{new Date(project.updatedAt).toLocaleDateString()}</div>
        </motion.div>
      ))}
    </div>
  );
}

export default function LibraryPage() {
  const [projects, setProjects] = useState<ComicProject[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = useMemo(() => getClientUserId(), []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/library?userId=${encodeURIComponent(userId)}`, {
        headers: { 'x-user-id': userId },
      });

      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = (await response.json()) as { projects?: ComicProject[] };
      setProjects(data.projects ?? []);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesFilter = filter === 'all' ? true : project.status === filter;
      const query = search.trim().toLowerCase();
      const matchesQuery =
        query.length === 0 ||
        project.title.toLowerCase().includes(query) ||
        project.style.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
  }, [projects, filter, search]);

  const handleStatusChange = async (projectId: string, status: ProjectStatus) => {
    await fetch(`/api/library/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ status }),
    });
    await loadProjects();
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Delete this project from your library?')) return;

    await fetch(`/api/library/${projectId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': userId },
    });
    await loadProjects();
  };

  const handleShare = async (projectId: string) => {
    try {
      const response = await fetch(`/api/library/${projectId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ makePublic: true }),
      });

      if (!response.ok) throw new Error('Failed to share project');

      const data = (await response.json()) as { publicUrl?: string };
      if (data.publicUrl) {
        const absoluteUrl = `${window.location.origin}${data.publicUrl}`;
        await navigator.clipboard.writeText(absoluteUrl);
      }

      await loadProjects();
    } catch {
      alert('Unable to create share link right now.');
    }
  };

  return (
    <main className="min-h-screen relative mesh-gradient">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-32">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-sm font-mono text-gold-premium mb-2 tracking-wider uppercase">Library</p>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-light mb-2">
              Your <span className="gradient-text font-semibold">Collection</span>
            </h1>
            <p className="text-ink-light/70">
              {projects.length} projects · {projects.reduce((acc, project) => acc + project.chapters.length, 0)} chapters total
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your library"
              className="input-glass px-4 py-2.5 text-sm w-full sm:w-56"
            />

            <div className="flex gap-1 glass rounded-lg p-1">
              {(['all', 'in_progress', 'published', 'draft', 'archived'] as const).map((entry) => (
                <button
                  key={entry}
                  onClick={() => setFilter(entry)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                    filter === entry
                      ? 'bg-violet/15 text-paper-warm border border-violet/10'
                      : 'text-ink-light/60 hover:text-paper-warm'
                  }`}
                >
                  {entry === 'all' ? 'All' : entry.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex gap-1 glass rounded-lg p-1">
              {([
                ['shelf', '📚'],
                ['grid', '⊞'],
                ['list', '≡'],
              ] as [ViewMode, string][]).map(([mode, icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                    viewMode === mode ? 'bg-violet/15 text-paper-warm' : 'text-ink-light/60 hover:text-paper-warm'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <Link href="/create" className="btn-primary px-4 py-2 text-sm text-center">
              + New Project
            </Link>
          </div>
        </div>

        {error && <div className="glass-card p-4 border border-red-400/30 text-red-200 text-sm mb-6">{error}</div>}

        {loading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl mb-2">No projects found</h2>
            <p className="text-ink-light/65 mb-6">Start your first comic and it will appear here.</p>
            <Link href="/create" className="btn-primary px-6 py-3 text-sm inline-block">
              Create a project
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={`${viewMode}-${filter}-${search}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {viewMode === 'shelf' && <ShelfView projects={filteredProjects} onShare={handleShare} />}
              {viewMode === 'grid' && (
                <GridView
                  projects={filteredProjects}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onShare={handleShare}
                />
              )}
              {viewMode === 'list' && <ListView projects={filteredProjects} onStatusChange={handleStatusChange} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
