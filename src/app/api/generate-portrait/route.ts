import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visualPrompt, style } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }

    const imagePrompt = `Generate an image: Character portrait in ${style} art style. ${visualPrompt}. Professional quality, detailed, suitable for a manga/comic character card. Clean background or simple atmospheric background.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: imagePrompt }] }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Image generation error:', err);
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts;

    if (!parts) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    // Find the image part
    for (const part of parts) {
      if (part.inlineData) {
        return NextResponse.json({
          image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
        });
      }
    }

    return NextResponse.json({ error: 'No image in response' }, { status: 500 });
  } catch (error) {
    console.error('Portrait generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
