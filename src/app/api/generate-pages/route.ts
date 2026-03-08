import { NextResponse } from 'next/server';
import { calculateChapterCost, generateImageWithRetry } from '@/lib/ai';
import { withApiHandler } from '@/lib/server/api';
import { readNumber, readString } from '@/lib/server/validation';
import { ApiError } from '@/lib/server/errors';
import { assertWithinDailyLimit, recordUsage } from '@/lib/server/usage';

interface CharacterInput {
  name?: string;
  role?: string;
  physicalDescription?: string;
  visualPrompt?: string;
  portraitUrl?: string;
}

interface GeneratePagesBody {
  prompts?: string[];
  chapterNumber?: number;
  concurrency?: number;
  characters?: CharacterInput[];
}

function buildCharacterContinuityBlock(characters: CharacterInput[]): string {
  if (!characters.length) return '';

  const lines = characters.slice(0, 8).map((char, index) => {
    const name = readString(char.name, { field: `characters[${index}].name`, required: false, fallback: 'Unnamed' });
    const role = readString(char.role, { field: `characters[${index}].role`, required: false, fallback: 'supporting' });
    const physicalDescription = readString(char.physicalDescription, {
      field: `characters[${index}].physicalDescription`,
      required: false,
      fallback: '',
      max: 800,
    });
    const visualPrompt = readString(char.visualPrompt, {
      field: `characters[${index}].visualPrompt`,
      required: false,
      fallback: '',
      max: 1200,
    });

    return `- ${name} (${role})\n  Physical: ${physicalDescription || 'N/A'}\n  Visual anchor: ${visualPrompt || 'N/A'}`;
  });

  return `\n\nCHARACTER CONTINUITY BIBLE (MUST STAY CONSISTENT):\n${lines.join('\n')}
\nCRITICAL: Keep these character designs consistent with no drift in facial structure, hair shape, outfits, body proportions, and silhouette.`;
}

function collectCharacterReferenceImages(characters: CharacterInput[]): string[] {
  return characters
    .map((char) => (typeof char.portraitUrl === 'string' ? char.portraitUrl : ''))
    .filter((url) => url.startsWith('data:image/'))
    .slice(0, 4);
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

    const characters = Array.isArray(ctx.body.characters) ? ctx.body.characters : [];

    const chapterNumber = readNumber(ctx.body.chapterNumber ?? 1, {
      field: 'chapterNumber',
      min: 1,
      max: 999,
      required: false,
      fallback: 1,
    });

    const creditCost = calculateChapterCost(prompts.length);
    const limit = await assertWithinDailyLimit(ctx.userId, ctx.userTier, creditCost);

    const characterContinuity = buildCharacterContinuityBlock(characters);
    const firstPageReferences = collectCharacterReferenceImages(characters);

    const pages: Array<{
      pageNumber: number;
      imageUrl: string | null;
      status: 'complete' | 'error';
      error?: string;
      prompt?: string;
    }> = [];

    let previousPageImage: string | null = null;

    for (let index = 0; index < prompts.length; index += 1) {
      const basePrompt = prompts[index];
      const isFirstPage = index === 0;

      const continuityInstructions = isFirstPage
        ? `${characterContinuity}\n\nThis is page 1. Lock in these character designs for the chapter.`
        : '\n\nCONTINUITY RULE: This page must match the immediately previous page in character appearance, costume details, line style, and scene continuity.';

      const prompt = `${basePrompt}${continuityInstructions}`;

      const referenceImages = isFirstPage
        ? firstPageReferences
        : previousPageImage
          ? [previousPageImage]
          : [];

      try {
        const imageUrl = await generateImageWithRetry(prompt, 2, { referenceImages });
        previousPageImage = imageUrl;

        pages.push({
          pageNumber: index + 1,
          imageUrl,
          status: 'complete',
          prompt,
        });
      } catch (error) {
        pages.push({
          pageNumber: index + 1,
          imageUrl: null,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown image generation error',
          prompt,
        });
      }
    }

    await recordUsage(ctx.userId, 'generate_pages', creditCost);

    return NextResponse.json({
      chapterNumber,
      creditCost,
      remainingDailyCredits: limit.remaining,
      pages,
    });
  });
}
