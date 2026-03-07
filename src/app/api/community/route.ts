import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/server/api';
import { mutateDb, createId, nowIso } from '@/lib/server/db';
import { ApiError } from '@/lib/server/errors';
import { readString, readStringArray } from '@/lib/server/validation';

interface PublishBody {
  projectId?: string;
  headline?: string;
  tags?: string[];
}

export async function GET(request: Request) {
  return withApiHandler(request, { routeId: 'community:list', parseJson: false, rateLimit: 'relaxed' }, async () => {
    const showcase = await mutateDb((db) => {
      return db.showcase
        .map((entry) => {
          const project = db.projects.find((candidate) => candidate.id === entry.projectId);
          if (!project || !project.isPublic) return null;

          return {
            ...entry,
            chapterCount: project.chapters.length,
            pageCount: project.chapters.reduce((acc, chapter) => acc + chapter.pages.length, 0),
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
        .sort((a, b) => {
          if (Number(Boolean(b.featured)) !== Number(Boolean(a.featured))) {
            return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
          }
          return b.createdAt.localeCompare(a.createdAt);
        });
    });

    return NextResponse.json({ showcase });
  });
}

export async function POST(request: Request) {
  return withApiHandler<PublishBody>(request, { routeId: 'community:publish', rateLimit: 'strict' }, async (ctx) => {
    const projectId = readString(ctx.body.projectId, { field: 'projectId', min: 3, max: 100 });
    const headline = readString(ctx.body.headline, {
      field: 'headline',
      required: false,
      fallback: '',
      max: 160,
    });

    const showcaseEntry = await mutateDb((db) => {
      const project = db.projects.find((entry) => entry.id === projectId || entry.slug === projectId);
      if (!project) return null;
      if (project.ownerId !== ctx.userId) {
        throw new ApiError(403, 'FORBIDDEN', 'Cannot publish a project you do not own');
      }

      if (!project.isPublic || !project.shareSlug) {
        throw new ApiError(
          400,
          'PROJECT_NOT_PUBLIC',
          'Project must be public and shared before it can be showcased'
        );
      }

      const existing = db.showcase.find((entry) => entry.projectId === project.id);
      if (existing) {
        existing.title = headline || project.title;
        existing.previewImage = project.coverImage;
        existing.tags = readStringArray(ctx.body.tags, 'tags', 8);
        existing.views = project.views;
        existing.likes = project.likes;
        return existing;
      }

      const entry = {
        id: createId('showcase'),
        projectId: project.id,
        title: headline || project.title,
        creator: project.ownerId,
        previewImage: project.coverImage,
        style: project.style,
        likes: project.likes,
        views: project.views,
        tags: readStringArray(ctx.body.tags, 'tags', 8),
        shareSlug: project.shareSlug,
        createdAt: nowIso(),
      };

      db.showcase.push(entry);
      return entry;
    });

    if (!showcaseEntry) {
      throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    }

    return NextResponse.json({ showcase: showcaseEntry }, { status: 201 });
  });
}
