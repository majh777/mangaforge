import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { withApiHandler } from '@/lib/server/api';
import { mutateDb, nowIso } from '@/lib/server/db';
import { ApiError } from '@/lib/server/errors';

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

interface ShareBody {
  makePublic?: boolean;
}

function createShareSlug(): string {
  return `share_${crypto.randomBytes(5).toString('hex')}`;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { projectId } = await params;

  return withApiHandler<ShareBody>(request, { routeId: 'library:share', rateLimit: 'strict' }, async (ctx) => {
    const shared = await mutateDb((db) => {
      const project = db.projects.find((entry) => entry.id === projectId || entry.slug === projectId);
      if (!project) return null;

      if (project.ownerId !== ctx.userId) {
        throw new ApiError(403, 'FORBIDDEN', 'Cannot share a project you do not own');
      }

      if (!project.shareSlug) {
        let slug = createShareSlug();
        while (db.shareIndex[slug]) {
          slug = createShareSlug();
        }
        project.shareSlug = slug;
        db.shareIndex[slug] = project.id;
      }

      if (ctx.body.makePublic !== undefined) {
        project.isPublic = Boolean(ctx.body.makePublic);
      } else {
        project.isPublic = true;
      }

      project.updatedAt = nowIso();

      return {
        projectId: project.id,
        slug: project.shareSlug,
        isPublic: project.isPublic,
      };
    });

    if (!shared) {
      throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    }

    return NextResponse.json({
      share: shared,
      publicUrl: `/share/${shared.slug}`,
      apiUrl: `/api/share/${shared.slug}`,
    });
  });
}
