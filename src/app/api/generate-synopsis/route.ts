import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, style, pagesPerChapter, contentRating } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }

    const systemPrompt = `You are a master storyteller and manga/comics writer. Generate a compelling synopsis for a ${style} comic based on the user's prompt.

Return a JSON object with EXACTLY this structure:
{
  "title": "The main title",
  "alternativeTitles": ["Alt Title 1", "Alt Title 2"],
  "logline": "A single compelling sentence describing the core story",
  "genres": ["Genre1", "Genre2", "Genre3"],
  "synopsis": "3-5 paragraphs of the story synopsis. Use \\n\\n between paragraphs.",
  "themes": ["Theme1", "Theme2", "Theme3"],
  "setting": "A brief description of the world/setting"
}

Content rating: ${contentRating}
Planned pages per chapter: ${pagesPerChapter}
Style: ${style}

Make the synopsis compelling, original, and perfectly suited to the ${style} format. The story should have clear hooks for serialization.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser's story prompt: "${prompt}"` }] },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 });
    }

    const synopsis = JSON.parse(text);
    return NextResponse.json(synopsis);
  } catch (error) {
    console.error('Synopsis generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
