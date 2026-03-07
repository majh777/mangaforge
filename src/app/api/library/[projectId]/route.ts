import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/server/api';
import { mutateDb, nowIso } from '@/lib/server/db';
import { ApiError } from '@/lib/server/errors';
import { readString, readEnum, readStringArray } from '@/lib/server/validation';
import type { ProjectStatus } from '@/lib/types';

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

function patchProject(
  project: Record<string, unknown>,
  body: Record<string, unknown>
): void {
  if (body.title !== undefined) {
    project.title = readString(body.title, { field: 'title', min: 2, max: 120 });
  }

  if (body.style !== undefined) {
    project.style = readString(body.style, {
      field: 'style',
      min: 2,
      max: 100,
    });
  }

  if (body.status !== undefined) {
    project.status = readEnum(
      body.status,
      ['draft', 'in_progress', 'published', 'archived'] as const,
      'status'
    ) as ProjectStatus;
  }

  if (body.isPublic !== undefined) {
    if (typeof body.isPublic !== 'boolean') {
      throw new ApiError(400, 'VALIDATION_ERROR', 'isPublic must be a boolean');
    }
    project.isPublic = body.isPublic;
  }

  if (body.tags !== undefined) {
    project.tags = readStringArray(body.tags, 'tags', 10);
  }

  if (body.coverImage !== undefined) {
    project.coverImage = readString(body.coverImage, {
      field: 'coverImage',
      max: 20000,
      required: false,
      fallback: '',
    });
  }

  project.updatedAt = nowIso();
}

export async function GET(request: Request, { params }: RouteParams) {
  const { projectId } = await params;

  return withApiHandler(request, { routeId: 'library:get', parseJson: false, rateLimit: 'relaxed' }, async (ctx) => {
    const project = await mutateDb((db) => {
      return db.projects.find((entry) => entry.id === projectId || entry.slug === projectId);
    });

    if (!project) {
      throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.ownerId !== ctx.userId && !project.isPublic) {
      throw new ApiError(403, 'FORBIDDEN', 'Project is private');
    }

    return NextResponse.json({ project });
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { projectId } = await params;

  return withApiHandler<Record<string, unknown>>(request, { routeId: 'library:update' }, async (ctx) => {
    const project = await mutateDb((db) => {
      const target = db.projects.find((entry) => entry.id === projectId || entry.slug === projectId);
      if (!target) return null;
      if (target.ownerId !== ctx.userId) {
        throw new ApiError(403, 'FORBIDDEN', 'Cannot update a project you do not own');
      }

      patchProject(target as unknown as Record<string, unknown>, ctx.body);
      return target;
    });

    if (!project) {
      throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    }

    return NextResponse.json({ project });
  });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { projectId } = await params;

  return withApiHandler(request, { routeId: 'library:delete', parseJson: false, rateLimit: 'standard' }, async (ctx) => {
    const deleted = await mutateDb((db) => {
      const index = db.projects.findIndex((entry) => entry.id === projectId || entry.slug === projectId);
      if (index === -1) return null;

      const target = db.projects[index];
      if (target.ownerId !== ctx.userId) {
        throw new ApiError(403, 'FORBIDDEN', 'Cannot delete a project you do not own');
      }

      db.projects.splice(index, 1);
      if (target.shareSlug) {
        delete db.shareIndex[target.shareSlug];
      }

      db.showcase = db.showcase.filter((entry) => entry.projectId !== target.id);
      return target.id;
    });

    if (!deleted) {
      throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    }

    return NextResponse.json({ success: true, projectId: deleted });
  });
}
