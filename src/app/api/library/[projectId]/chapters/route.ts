import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/server/api';
import { mutateDb, createId, nowIso } from '@/lib/server/db';
import { ApiError } from '@/lib/server/errors';
import { readNumber, readString } from '@/lib/server/validation';
import type { ChapterPage, ChapterRecord } from '@/lib/types';

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

interface SaveChapterBody {
  chapterNumber?: number;
  title?: string;
  summary?: string;
  hookTeaseLine?: string;
  pages?: Array<{ pageNumber?: number; imageUrl?: string; prompt?: string; status?: 'complete' | 'error' }>;
}

function normalizePages(input: SaveChapterBody['pages']): ChapterPage[] {
  if (!input || !Array.isArray(input)) return [];

  return input
    .map((page, index) => {
      const pageNumber = readNumber(page.pageNumber ?? index + 1, {
        field: `pages[${index}].pageNumber`,
        min: 1,
        max: 300,
      });

      const imageUrl = readString(page.imageUrl, {
        field: `pages[${index}].imageUrl`,
        required: false,
        fallback: '',
        max: 300000,
      });

      return {
        pageNumber,
        imageUrl,
        prompt: typeof page.prompt === 'string' ? page.prompt : undefined,
        status: page.status === 'error' ? 'error' : 'complete',
      } satisfies ChapterPage;
    })
    .filter((page) => Boolean(page.imageUrl));
}

export async function POST(request: Request, { params }: RouteParams) {
  const { projectId } = await params;

  return withApiHandler<SaveChapterBody>(request, { routeId: 'library:saveChapter', rateLimit: 'strict' }, async (ctx) => {
    const chapterNumber = readNumber(ctx.body.chapterNumber, {
      field: 'chapterNumber',
      min: 1,
      max: 999,
    });

    const title = readString(ctx.body.title, {
      field: 'title',
      min: 2,
      max: 160,
    });

    const summary = readString(ctx.body.summary, {
      field: 'summary',
      required: false,
      fallback: '',
      max: 5000,
    });

    const pages = normalizePages(ctx.body.pages);

    const chapter: ChapterRecord = {
      id: createId('chapter'),
      chapterNumber,
      title,
      summary,
      hookTeaseLine:
        typeof ctx.body.hookTeaseLine === 'string' ? ctx.body.hookTeaseLine.slice(0, 500) : undefined,
      pages,
      createdAt: nowIso(),
    };

    const project = await mutateDb((db) => {
      const target = db.projects.find((entry) => entry.id === projectId || entry.slug === projectId);
      if (!target) return null;
      if (target.ownerId !== ctx.userId) {
        throw new ApiError(403, 'FORBIDDEN', 'Cannot update a project you do not own');
      }

      target.chapters = target.chapters.filter((entry) => entry.chapterNumber !== chapterNumber);
      target.chapters.push(chapter);
      target.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
      target.status = 'in_progress';
      target.updatedAt = nowIso();

      if (!target.coverImage && pages[0]?.imageUrl) {
        target.coverImage = pages[0].imageUrl;
      }

      return target;
    });

    if (!project) {
      throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    }

    return NextResponse.json({ project, chapter }, { status: 201 });
  });
}
