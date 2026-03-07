import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/server/api';
import { mutateDb } from '@/lib/server/db';
import { ApiError } from '@/lib/server/errors';
import { readEnum, readString } from '@/lib/server/validation';

interface ExportBody {
  projectId?: string;
  format?: 'pdf' | 'cbz' | 'image-pack';
}

function toBase64(input: string): string {
  return Buffer.from(input, 'utf-8').toString('base64');
}

function buildSimplePdf(title: string, bodyLines: string[]): string {
  const safeText = [title, ...bodyLines]
    .map((line) => line.replace(/[()\\]/g, '\\$&'))
    .join('\\n');

  const stream = `BT\n/F1 12 Tf\n50 780 Td\n(${safeText}) Tj\nET`;
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += object;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

export async function POST(request: Request) {
  return withApiHandler<ExportBody>(request, { routeId: 'export:create', rateLimit: 'strict' }, async (ctx) => {
    const projectId = readString(ctx.body.projectId, { field: 'projectId', min: 3, max: 100 });
    const format = readEnum(
      ctx.body.format,
      ['pdf', 'cbz', 'image-pack'] as const,
      'format',
      'pdf'
    );

    const project = await mutateDb((db) => {
      return db.projects.find((entry) => entry.id === projectId || entry.slug === projectId) || null;
    });

    if (!project) {
      throw new ApiError(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.ownerId !== ctx.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Cannot export project you do not own');
    }

    const chapterCount = project.chapters.length;
    const pageCount = project.chapters.reduce((acc, chapter) => acc + chapter.pages.length, 0);

    const imageUrls = project.chapters.flatMap((chapter) => chapter.pages.map((page) => page.imageUrl));

    if (format === 'image-pack') {
      const payload = {
        project: project.title,
        exportedAt: new Date().toISOString(),
        chapterCount,
        pageCount,
        images: imageUrls,
      };

      return NextResponse.json({
        filename: `${project.slug}-image-pack.json`,
        mimeType: 'application/json',
        base64: toBase64(JSON.stringify(payload, null, 2)),
      });
    }

    if (format === 'cbz') {
      const manifest = {
        format: 'cbz-manifest',
        note: 'Use this manifest to generate a CBZ package in your local tooling.',
        title: project.title,
        chapters: project.chapters.map((chapter) => ({
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
          pages: chapter.pages.map((page) => ({
            pageNumber: page.pageNumber,
            imageUrl: page.imageUrl,
          })),
        })),
      };

      return NextResponse.json({
        filename: `${project.slug}.cbz.manifest.json`,
        mimeType: 'application/json',
        base64: toBase64(JSON.stringify(manifest, null, 2)),
      });
    }

    const pdf = buildSimplePdf(project.title, [
      `Style: ${project.style}`,
      `Chapters: ${chapterCount}`,
      `Pages: ${pageCount}`,
      `Exported by InkForge on ${new Date().toUTCString()}`,
    ]);

    return NextResponse.json({
      filename: `${project.slug}.pdf`,
      mimeType: 'application/pdf',
      base64: Buffer.from(pdf, 'binary').toString('base64'),
    });
  });
}
