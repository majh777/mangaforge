import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/server/api';
import { mutateDb, createId, createSlug, nowIso } from '@/lib/server/db';
import { readString, readEnum, readStringArray } from '@/lib/server/validation';
import type { ComicProject, ContentFormat, ProjectStatus } from '@/lib/types';

export async function GET(request: Request) {
  return withApiHandler(request, { routeId: 'library:list', parseJson: false, rateLimit: 'relaxed' }, async (ctx) => {
    const url = new URL(request.url);
    const queryUserId = url.searchParams.get('userId')?.trim();
    const includePublic = url.searchParams.get('includePublic') === 'true';
    const userId = queryUserId || ctx.userId;

    const projects = await mutateDb((db) => {
      return db.projects
        .filter((project) => project.ownerId === userId || (includePublic && project.isPublic))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });

    return NextResponse.json({ projects });
  });
}

interface CreateProjectBody {
  userId?: string;
  title?: string;
  style?: string;
  stylePreset?: ContentFormat;
  panelTemplate?: string;
  synopsis?: Record<string, unknown>;
  characters?: Array<Record<string, unknown>>;
  coverImage?: string;
  tags?: string[];
  status?: ProjectStatus;
}

export async function POST(request: Request) {
  return withApiHandler<CreateProjectBody>(request, { routeId: 'library:create', rateLimit: 'standard' }, async (ctx) => {
    const title = readString(ctx.body.title, {
      field: 'title',
      min: 2,
      max: 120,
      fallback: 'Untitled Project',
      required: false,
    });

    const style = readString(ctx.body.style, {
      field: 'style',
      required: false,
      fallback: 'shonen',
      max: 100,
    });

    const stylePreset = readEnum(
      ctx.body.stylePreset ?? 'manga',
      ['manga', 'western', 'webtoon'] as const,
      'stylePreset',
      'manga'
    );

    const status = readEnum(
      ctx.body.status ?? 'draft',
      ['draft', 'in_progress', 'published', 'archived'] as const,
      'status',
      'draft'
    );

    const panelTemplate = readString(ctx.body.panelTemplate, {
      field: 'panelTemplate',
      required: false,
      fallback: 'classic-6-grid',
      max: 60,
    });

    const now = nowIso();
    const project: ComicProject = {
      id: createId('project'),
      slug: createSlug(title),
      ownerId: ctx.userId,
      title,
      style,
      stylePreset,
      panelTemplate,
      synopsis: ctx.body.synopsis,
      characters: ctx.body.characters,
      chapters: [],
      coverImage: typeof ctx.body.coverImage === 'string' ? ctx.body.coverImage : undefined,
      status,
      tags: readStringArray(ctx.body.tags, 'tags', 10),
      shareSlug: undefined,
      isPublic: false,
      likes: 0,
      views: 0,
      createdAt: now,
      updatedAt: now,
    };

    await mutateDb((db) => {
      db.projects.push(project);
    });

    return NextResponse.json({ project }, { status: 201 });
  });
}
