import { NextResponse } from 'next/server';
import { CREDIT_COSTS, generateText } from '@/lib/ai';
import { withApiHandler } from '@/lib/server/api';
import { readNumber, readString } from '@/lib/server/validation';
import { assertWithinDailyLimit, recordUsage } from '@/lib/server/usage';

interface GenerateSynopsisBody {
  prompt?: string;
  style?: string;
  pagesPerChapter?: number;
  panelsPerPage?: number;
  contentRating?: string;
  artDetail?: string;
  colorMode?: string;
}

function parseJsonSafe(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    }
    return { synopsis: raw };
  }
}

export async function POST(request: Request) {
  return withApiHandler<GenerateSynopsisBody>(request, { routeId: 'generate:synopsis', rateLimit: 'strict' }, async (ctx) => {
    const prompt = readString(ctx.body.prompt, {
      field: 'prompt',
      min: 10,
      max: 2000,
    });

    const style = readString(ctx.body.style, {
      field: 'style',
      required: false,
      fallback: 'shonen',
      max: 120,
    });

    const pagesPerChapter = readNumber(ctx.body.pagesPerChapter ?? 20, {
      field: 'pagesPerChapter',
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

    await assertWithinDailyLimit(ctx.userId, ctx.userTier, CREDIT_COSTS.synopsis);

    const systemInstruction =
      "You are InkForge's narrative AI engine. You create compelling manga/comic synopses with deep narrative structures. Always respond in valid JSON.";

    const userPrompt = `Create a detailed comic synopsis for the following concept:

CONCEPT: ${prompt}
STYLE: ${style}
PAGES PER CHAPTER: ${pagesPerChapter}
PANELS PER PAGE: ${panelsPerPage}
CONTENT RATING: ${ctx.body.contentRating || 'PG-13'}
ART DETAIL LEVEL: ${ctx.body.artDetail || 'High'}
COLOR MODE: ${ctx.body.colorMode || 'Auto'}

Generate a JSON response with this exact structure:
{
  "title": "The comic title",
  "alternativeTitles": ["Optional alt title"],
  "logline": "A compelling one-sentence pitch",
  "genres": ["Primary genre", "Secondary genre"],
  "themes": ["theme1", "theme2", "theme3"],
  "setting": "Detailed world/setting description",
  "synopsis": "A 3-5 paragraph detailed synopsis covering the main plot arc",
  "chapterBreakdown": [
    { "number": 1, "title": "Chapter title", "summary": "Brief chapter summary", "hookType": "Cliffhanger|Revelation|Question|etc" }
  ],
  "estimatedChapters": 12,
  "toneKeywords": ["dark", "epic", "emotional"],
  "hiddenArc": "A secret overarching narrative that unfolds across the entire series"
}

Make the synopsis compelling, with genuine narrative depth. Include at least 8 chapter breakdowns.`;

    const result = await generateText(userPrompt, systemInstruction);
    const parsed = parseJsonSafe(result);

    await recordUsage(ctx.userId, 'generate_synopsis', CREDIT_COSTS.synopsis);

    return NextResponse.json(parsed);
  });
}
