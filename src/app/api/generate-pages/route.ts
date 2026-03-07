import { NextResponse } from 'next/server';
import { calculateChapterCost, generateImageBatch } from '@/lib/ai';
import { withApiHandler } from '@/lib/server/api';
import { readNumber } from '@/lib/server/validation';
import { ApiError } from '@/lib/server/errors';
import { assertWithinDailyLimit, recordUsage } from '@/lib/server/usage';

interface GeneratePagesBody {
  prompts?: string[];
  chapterNumber?: number;
  concurrency?: number;
}

export async function POST(request: Request) {
  return withApiHandler<GeneratePagesBody>(request, { routeId: 'generate:pages', rateLimit: 'strict' }, async (ctx) => {
    if (!Array.isArray(ctx.body.prompts) || ctx.body.prompts.length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'prompts must be a non-empty array');
    }

    if (ctx.body.prompts.length > 120) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'prompts cannot exceed 120 pages');
    }

    const prompts = ctx.body.prompts
      .map((prompt) => (typeof prompt === 'string' ? prompt.trim() : ''))
      .filter(Boolean);

    if (prompts.length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'At least one valid prompt is required');
    }

    const chapterNumber = readNumber(ctx.body.chapterNumber ?? 1, {
      field: 'chapterNumber',
      min: 1,
      max: 999,
      required: false,
      fallback: 1,
    });

    const concurrency = readNumber(ctx.body.concurrency ?? 3, {
      field: 'concurrency',
      min: 1,
      max: 6,
      required: false,
      fallback: 3,
    });

    const creditCost = calculateChapterCost(prompts.length);
    const limit = await assertWithinDailyLimit(ctx.userId, ctx.userTier, creditCost);

    const results = await generateImageBatch(prompts, {
      concurrency,
      retries: 2,
    });

    await recordUsage(ctx.userId, 'generate_pages', creditCost);

    const pages = results.map((result, index) => ({
      pageNumber: index + 1,
      imageUrl: result.imageUrl,
      status: result.imageUrl ? 'complete' : 'error',
      error: result.error,
      prompt: result.prompt,
    }));

    return NextResponse.json({
      chapterNumber,
      creditCost,
      remainingDailyCredits: limit.remaining,
      pages,
    });
  });
}
