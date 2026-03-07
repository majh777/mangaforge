import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mutateDb, nowIso, readDb } from '@/lib/server/db';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

async function getSharedProject(slug: string) {
  return mutateDb((db) => {
    const projectId = db.shareIndex[slug];
    if (!projectId) return null;

    const project = db.projects.find((entry) => entry.id === projectId);
    if (!project || !project.isPublic) return null;

    project.views += 1;
    project.updatedAt = nowIso();

    return project;
  });
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const project = await getSharedProject(slug);

  if (!project) {
    return {
      title: 'Shared Comic Not Found | InkForge',
    };
  }

  const chapterCount = project.chapters.length;
  const pageCount = project.chapters.reduce((acc, chapter) => acc + chapter.pages.length, 0);

  return {
    title: `${project.title} | InkForge Showcase`,
    description: `${project.title} · ${chapterCount} chapters · ${pageCount} pages`,
    openGraph: {
      title: `${project.title} · InkForge`,
      description: `${chapterCount} chapters · ${pageCount} pages`,
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} · InkForge`,
      description: `${chapterCount} chapters · ${pageCount} pages`,
      images: project.coverImage ? [project.coverImage] : undefined,
    },
  };
}

export default async function SharedProjectPage({ params }: RouteParams) {
  const { slug } = await params;
  const project = await getSharedProject(slug);

  if (!project) {
    notFound();
  }

  const totalPages = project.chapters.reduce((acc, chapter) => acc + chapter.pages.length, 0);

  return (
    <main className="min-h-screen bg-ink-void mesh-gradient pb-20">
      <header className="sticky top-0 z-20 glass-nav border-b border-ink-mid/20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-display)] text-lg gradient-text">
            InkForge
          </Link>
          <Link href="/create" className="btn-ghost px-4 py-2 text-sm">
            Create your own
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 pt-10">
        <div className="glass-card p-6 md:p-8 mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan/70 mb-2">Public Share</p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-semibold mb-2">
            {project.title}
          </h1>
          <p className="text-ink-light/70 text-sm md:text-base">
            By {project.ownerId} · {project.stylePreset} preset · {project.style}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {project.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-violet/10 border border-violet/30 text-xs text-violet">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="glass p-3 rounded-xl">
              <p className="text-ink-light/50">Chapters</p>
              <p className="text-xl font-semibold">{project.chapters.length}</p>
            </div>
            <div className="glass p-3 rounded-xl">
              <p className="text-ink-light/50">Pages</p>
              <p className="text-xl font-semibold">{totalPages}</p>
            </div>
            <div className="glass p-3 rounded-xl">
              <p className="text-ink-light/50">Views</p>
              <p className="text-xl font-semibold">{project.views}</p>
            </div>
            <div className="glass p-3 rounded-xl">
              <p className="text-ink-light/50">Likes</p>
              <p className="text-xl font-semibold">{project.likes}</p>
            </div>
          </div>
        </div>

        {project.chapters.length === 0 ? (
          <div className="glass-card p-10 text-center text-ink-light/70">No chapters published yet.</div>
        ) : (
          <div className="space-y-10">
            {project.chapters.map((chapter) => (
              <article key={chapter.id} className="glass-card p-6 md:p-8">
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan/60 mb-1">Chapter {chapter.chapterNumber}</p>
                  <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">{chapter.title}</h2>
                  {chapter.summary && <p className="text-ink-light/70 mt-2">{chapter.summary}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {chapter.pages.map((page) => (
                    <figure key={`${chapter.id}-${page.pageNumber}`} className="glass p-3 rounded-xl">
                      <img
                        src={page.imageUrl}
                        alt={`${chapter.title} page ${page.pageNumber}`}
                        className="w-full rounded-lg object-cover"
                      />
                      <figcaption className="text-xs text-ink-light/60 mt-2">Page {page.pageNumber}</figcaption>
                    </figure>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
