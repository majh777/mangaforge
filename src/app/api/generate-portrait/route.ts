import { NextResponse } from 'next/server';
import { generateImage } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { visualPrompt, style } = await request.json();

    const fullPrompt = `Generate a manga character portrait in ${style || 'shōnen manga'} art style. Black and white with screentones. Professional manga quality, detailed ink work, expressive eyes, dynamic pose. Character: ${visualPrompt}. The image should be a bust/upper body portrait suitable for a character card. High contrast, clean linework, authentic manga aesthetics.`;

    const imageData = await generateImage(fullPrompt);

    return NextResponse.json({ image: imageData });
  } catch (error) {
    console.error('Portrait generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate portrait' },
      { status: 500 }
    );
  }
}
