import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { synopsis, style } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }

    const systemPrompt = `You are a master character designer for ${style} comics/manga. Based on the synopsis below, generate 4-6 compelling characters.

Return a JSON array of character objects with EXACTLY this structure:
[
  {
    "name": "Character Name",
    "role": "protagonist" | "antagonist" | "supporting" | "minor",
    "age": 25,
    "bioShort": "2-3 sentence summary",
    "bioFull": "3-5 paragraph full backstory with motivations, fears, and secrets",
    "physicalDescription": "Detailed appearance for image generation",
    "visualPrompt": "A detailed prompt optimized for AI image generation: full body portrait of [character], [style]-style art, [specific details about hair, eyes, clothing, accessories, pose, expression]",
    "speechPattern": "How they talk — formal, casual, accent notes, catchphrases",
    "personalityTraits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
    "relationships": []
  }
]

Make characters diverse, compelling, and perfectly suited to ${style} storytelling. Each character should feel like they could carry their own story. Visual prompts should be specific enough for consistent AI image generation.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nSynopsis:\n${JSON.stringify(synopsis)}` }] },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.85,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return NextResponse.json({ error: 'Character generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 });
    }

    const characters = JSON.parse(text);
    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Character generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
