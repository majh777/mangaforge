import { NextResponse } from 'next/server';
import { CREDIT_COSTS, generateImageWithRetry } from '@/lib/ai';
import { withApiHandler } from '@/lib/server/api';
import { readString } from '@/lib/server/validation';
import { assertWithinDailyLimit, recordUsage } from '@/lib/server/usage';

interface GeneratePortraitBody {
  visualPrompt?: string;
  style?: string;
}

export async function POST(request: Request) {
  return withApiHandler<GeneratePortraitBody>(request, { routeId: 'generate:portrait', rateLimit: 'strict' }, async (ctx) => {
    const visualPrompt = readString(ctx.body.visualPrompt, {
      field: 'visualPrompt',
      min: 8,
      max: 4000,
    });

    const style = readString(ctx.body.style, {
      field: 'style',
      required: false,
      fallback: 'shonen manga',
      max: 120,
    });

    await assertWithinDailyLimit(ctx.userId, ctx.userTier, CREDIT_COSTS.characterPortrait);

    const fullPrompt = `Generate a high-quality comic character portrait in ${style} style.

Requirements:
- Professional linework and cinematic composition
- Strong readability and contrast
- Bust / upper-body framing suitable for profile cards
- Polished detailing and expressive character design
- Keep visual style consistent for repeated generations

Character brief: ${visualPrompt}`;

    const imageData = await generateImageWithRetry(fullPrompt, 2);
    await recordUsage(ctx.userId, 'generate_portrait', CREDIT_COSTS.characterPortrait);

    return NextResponse.json({ image: imageData });
  });
}
