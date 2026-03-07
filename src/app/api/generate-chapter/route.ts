import { NextResponse } from 'next/server';
import { calculateChapterCost, generateText } from '@/lib/ai';
import { withApiHandler } from '@/lib/server/api';
import { ApiError } from '@/lib/server/errors';
import { readNumber, readString } from '@/lib/server/validation';
import { assertWithinDailyLimit, recordUsage } from '@/lib/server/usage';

interface GenerateChapterBody {
  synopsis?: Record<string, unknown>;
  characters?: Array<Record<string, unknown>>;
  chapterNumber?: number;
  style?: string;
  stylePreset?: string;
  panelTemplate?: string;
  pageCount?: number;
  panelsPerPage?: number;
  hiddenArc?: string;
  contentRating?: string;
  artDetail?: string;
  colorMode?: string;
  previousChapters?: Array<{ chapterNumber: number; title: string; summary: string }>;
}

function parseJsonSafe(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    }
    return null;
  }
}

export async function POST(request: Request) {
  return withApiHandler<GenerateChapterBody>(request, { routeId: 'generate:chapter', rateLimit: 'strict' }, async (ctx) => {
    if (!ctx.body.synopsis || typeof ctx.body.synopsis !== 'object') {
      throw new ApiError(400, 'VALIDATION_ERROR', 'synopsis is required');
    }

    const chapterNumber = readNumber(ctx.body.chapterNumber ?? 1, {
      field: 'chapterNumber',
      required: false,
      fallback: 1,
      min: 1,
      max: 999,
    });

    const style = readString(ctx.body.style, {
      field: 'style',
      required: false,
      fallback: 'shonen',
      max: 120,
    });

    const stylePreset = readString(ctx.body.stylePreset, {
      field: 'stylePreset',
      required: false,
      fallback: 'manga',
      max: 50,
    });

    const panelTemplate = readString(ctx.body.panelTemplate, {
      field: 'panelTemplate',
      required: false,
      fallback: 'classic-6-grid',
      max: 60,
    });

    const pageCount = readNumber(ctx.body.pageCount ?? 20, {
      field: 'pageCount',
      required: false,
      fallback: 20,
      min: 4,
      max: 120,
    });

    const panelsPerPage = readNumber(ctx.body.panelsPerPage ?? 6, {
      field: 'panelsPerPage',
      required: false,
      fallback: 6,
      min: 1,
      max: 12,
    });

    const chapterCost = calculateChapterCost(pageCount);
    await assertWithinDailyLimit(ctx.userId, ctx.userTier, chapterCost);

    const characterOutline = Array.isArray(ctx.body.characters)
      ? ctx.body.characters.map((character) => ({
          name: character.name,
          role: character.role,
          bioShort: character.bioShort,
        }))
      : [];

    const previousChapters = Array.isArray(ctx.body.previousChapters)
      ? ctx.body.previousChapters
      : [];

    const scriptPrompt = `You are a master comic scriptwriter. Create a detailed page-by-page script for Chapter ${chapterNumber}.

SYNOPSIS: ${JSON.stringify(ctx.body.synopsis)}
CHARACTERS: ${JSON.stringify(characterOutline)}
HIDDEN ARC PLAN: ${ctx.body.hiddenArc || 'Not provided'}
CHAPTER NUMBER: ${chapterNumber}
PAGES: ${pageCount}
PANELS PER PAGE: ${panelsPerPage}
STYLE: ${style}
STYLE PRESET: ${stylePreset}
PANEL TEMPLATE: ${panelTemplate}
CONTENT RATING: ${ctx.body.contentRating || 'PG-13'}
ART DETAIL LEVEL: ${ctx.body.artDetail || 'High'}
COLOR MODE: ${ctx.body.colorMode || 'Auto'}
${
  previousChapters.length
    ? `PREVIOUS CHAPTER SUMMARIES:\n${previousChapters
        .map((ch) => `Chapter ${ch.chapterNumber} \"${ch.title}\": ${ch.summary}`)
        .join('\n')}`
    : ''
}

Generate a JSON response:
{
  "chapterTitle": "Chapter title",
  "chapterSummary": "2-3 sentence summary",
  "pages": [
    {
      "pageNumber": 1,
      "type": "title|establishing|action|dialogue|splash|cliffhanger",
      "panels": [
        {
          "panelNumber": 1,
          "shotType": "wide|medium|close-up|extreme-close-up|bird-eye|worm-eye",
          "description": "Detailed visual description",
          "dialogue": [{ "character": "Name", "text": "Dialogue in English" }],
          "sfx": ["WHOOSH", "CRACK"],
          "emotion": "tense|calm|excited|sad|angry|mysterious"
        }
      ],
      "imagePrompt": "A complete image generation prompt for this full comic page"
    }
  ],
  "hookType": "Cliffhanger|Revelation|Question|Emotional|Escalation",
  "hookTeaseLine": "A compelling tease for the next chapter",
  "characterStatusUpdates": [
    { "name": "Character name", "status": "Narrative status update" }
  ]
}

CRITICAL RULES:
1. The final page MUST end on a powerful hook.
2. Keep visual continuity with prior chapters.
3. Vary panel layouts and pacing.
4. Use concise, actionable image prompts for generation.
5. Advance the hidden arc subtly.`;

    const scriptResult = await generateText(
      scriptPrompt,
      'You are an elite comic scriptwriter. Always respond with valid JSON only.'
    );

    const script = parseJsonSafe(scriptResult);
    if (!script) {
      throw new ApiError(500, 'GENERATION_FAILED', 'Failed to generate chapter script');
    }

    await recordUsage(ctx.userId, 'generate_chapter_script', chapterCost);

    return NextResponse.json({
      script,
      creditCost: chapterCost,
      message: 'Script generated. Use /api/generate-pages for batched image generation.',
    });
  });
}
