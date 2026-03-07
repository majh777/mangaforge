import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/server/api';
import { mutateDb, nowIso } from '@/lib/server/db';
import { ApiError } from '@/lib/server/errors';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;

  return withApiHandler(request, { routeId: 'share:get', parseJson: false, rateLimit: 'relaxed' }, async () => {
    const payload = await mutateDb((db) => {
      const projectId = db.shareIndex[slug];
      if (!projectId) return null;

      const project = db.projects.find((entry) => entry.id === projectId);
      if (!project || !project.isPublic) return null;

      project.views += 1;
      project.updatedAt = nowIso();

      const chapterCount = project.chapters.length;
      const pageCount = project.chapters.reduce((acc, chapter) => acc + chapter.pages.length, 0);

      return {
        id: project.id,
        title: project.title,
        style: project.style,
        stylePreset: project.stylePreset,
        tags: project.tags,
        coverImage: project.coverImage,
        chapters: project.chapters,
        chapterCount,
        pageCount,
        likes: project.likes,
        views: project.views,
        creator: project.ownerId,
      };
    });

    if (!payload) {
      throw new ApiError(404, 'NOT_FOUND', 'Shared project not found');
    }

    return NextResponse.json({ project: payload });
  });
}
