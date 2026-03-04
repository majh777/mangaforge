import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { prompt, style, pages, panels } = await request.json();

    const systemInstruction = `You are MangaForge's narrative AI engine. You create compelling manga/comic synopses with deep narrative structures. You always respond in valid JSON.`;

    const userPrompt = `Create a detailed manga synopsis for the following concept:

CONCEPT: ${prompt}
STYLE: ${style}
PAGES PER CHAPTER: ${pages || 20}
PANELS PER PAGE: ${panels || 6}

Generate a JSON response with this exact structure:
{
  "title": "The manga title",
  "logline": "A compelling one-sentence pitch",
  "genre": "Primary genre",
  "themes": ["theme1", "theme2", "theme3"],
  "setting": "Detailed world/setting description",
  "synopsis": "A 3-5 paragraph detailed synopsis covering the main plot arc",
  "chapterBreakdown": [
    { "number": 1, "title": "Chapter title", "summary": "Brief chapter summary", "hookType": "Cliffhanger|Revelation|Question|etc" }
  ],
  "estimatedChapters": 12,
  "toneKeywords": ["dark", "epic", "emotional"],
  "hiddenArc": "A secret overarching narrative that unfolds across the entire series, invisible to the reader but guiding every chapter's development"
}

Make the synopsis compelling, with genuine narrative depth. The hidden arc should be a masterful long-game that makes re-reading revelatory. Include at least 8 chapter breakdowns.`;

    const result = await generateText(userPrompt, systemInstruction);

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: 'Untitled', synopsis: result, logline: prompt };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Synopsis generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate synopsis' },
      { status: 500 }
    );
  }
}
