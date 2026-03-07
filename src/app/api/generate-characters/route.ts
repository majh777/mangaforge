import { NextResponse } from 'next/server';
import { CREDIT_COSTS, generateText } from '@/lib/ai';
import { withApiHandler } from '@/lib/server/api';
import { readString } from '@/lib/server/validation';
import { assertWithinDailyLimit, recordUsage } from '@/lib/server/usage';
import { ApiError } from '@/lib/server/errors';

interface GenerateCharactersBody {
  synopsis?: Record<string, unknown>;
  style?: string;
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
    return { characters: [] };
  }
}

export async function POST(request: Request) {
  return withApiHandler<GenerateCharactersBody>(request, { routeId: 'generate:characters', rateLimit: 'strict' }, async (ctx) => {
    if (!ctx.body.synopsis || typeof ctx.body.synopsis !== 'object') {
      throw new ApiError(400, 'VALIDATION_ERROR', 'synopsis is required');
    }

    const style = readString(ctx.body.style, {
      field: 'style',
      required: false,
      fallback: 'shonen',
      max: 120,
    });

    await assertWithinDailyLimit(ctx.userId, ctx.userTier, CREDIT_COSTS.characters);

    const systemInstruction =
      "You are InkForge's character creation engine. You design psychologically complex characters using a 10-model personality framework. Always respond in valid JSON.";

    const userPrompt = `Based on this comic synopsis, create a cast of characters:

SYNOPSIS: ${JSON.stringify(ctx.body.synopsis)}
ART STYLE: ${style}
CONTENT RATING: ${ctx.body.contentRating || 'PG-13'}
ART DETAIL LEVEL: ${ctx.body.artDetail || 'High'}
COLOR MODE: ${ctx.body.colorMode || 'Auto'}

Generate a JSON response with this exact structure:
{
  "characters": [
    {
      "name": "Character Name",
      "role": "protagonist|antagonist|supporting|minor",
      "age": 17,
      "bioShort": "One-sentence character summary",
      "bioFull": "2-3 paragraph detailed biography with backstory, motivations, and secrets",
      "physicalDescription": "Detailed physical appearance for consistent art generation",
      "visualPrompt": "A detailed image generation prompt for this character's portrait in ${style} art style",
      "speechPattern": "How this character talks — cadence, vocabulary, quirks",
      "personalityTraits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
      "relationships": ["relationship description with other characters"],
      "personalityMatrix": {
        "mbti": "ENFP",
        "enneagram": "7w8",
        "bigFive": {
          "openness": 75,
          "conscientiousness": 45,
          "extraversion": 80,
          "agreeableness": 60,
          "neuroticism": 35
        }
      }
    }
  ]
}

Create 3-5 characters minimum. Include at least one protagonist, one antagonist, and one supporting character.`;

    const result = await generateText(userPrompt, systemInstruction);
    const parsed = parseJsonSafe(result);

    await recordUsage(ctx.userId, 'generate_characters', CREDIT_COSTS.characters);

    return NextResponse.json(parsed);
  });
}
