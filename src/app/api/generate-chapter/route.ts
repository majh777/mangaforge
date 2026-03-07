import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { synopsis, characters, chapterNumber, style, pageCount, panelsPerPage, hiddenArc, contentRating, artDetail, colorMode, previousChapters } = await request.json();

    // Step 1: Generate the chapter script
    const scriptPrompt = `You are a master manga scriptwriter. Create a detailed page-by-page script for Chapter ${chapterNumber}.

SYNOPSIS: ${JSON.stringify(synopsis)}
CHARACTERS: ${JSON.stringify(characters?.map((c: Record<string, unknown>) => ({ name: c.name, role: c.role, bioShort: c.bioShort })))}
HIDDEN ARC PLAN: ${hiddenArc || 'Not provided'}
CHAPTER NUMBER: ${chapterNumber}
PAGES: ${pageCount || 20}
PANELS PER PAGE: ${panelsPerPage || 6}
STYLE: ${style}
CONTENT RATING: ${contentRating || 'PG-13'}
ART DETAIL LEVEL: ${artDetail || 'High'}
COLOR MODE: ${colorMode || 'Auto'}
${previousChapters?.length ? `PREVIOUS CHAPTER SUMMARIES:\n${previousChapters.map((ch: { chapterNumber: number; title: string; summary: string }) => `Chapter ${ch.chapterNumber} "${ch.title}": ${ch.summary}`).join('\n')}` : ''}

Generate a JSON response:
{
  "chapterTitle": "Chapter title",
  "pages": [
    {
      "pageNumber": 1,
      "type": "title|establishing|action|dialogue|splash|cliffhanger",
      "panels": [
        {
          "panelNumber": 1,
          "shotType": "wide|medium|close-up|extreme-close-up|bird-eye|worm-eye",
          "description": "Detailed visual description of what happens in this panel",
          "dialogue": [{ "character": "Name", "text": "Dialogue text in English" }],
          "sfx": ["WHOOSH", "CRACK"],
          "emotion": "tense|calm|excited|sad|angry|mysterious"
        }
      ],
      "imagePrompt": "A complete image generation prompt for this full manga page including all panels, in ${style} style"
    }
  ],
  "hookType": "Cliffhanger|Revelation|Question|Emotional|Escalation",
  "hookTeaseLine": "A compelling tease for the next chapter",
  "characterStatusUpdates": [
    { "name": "Character name", "status": "Brief emotional/narrative status update" }
  ]
}

CRITICAL RULES:
1. The last page MUST end on a powerful hook. Make the reader unable to stop.
2. All dialogue must be in English.
3. Vary panel layouts — don't repeat the same grid. Use splashes, irregular panels, bleeds.
4. Include speed lines, screentones, and manga SFX descriptions.
5. The chapter must advance the hidden arc subtly.`;

    const scriptResult = await generateText(scriptPrompt, 'You are a master manga scriptwriter. Always respond in valid JSON.');

    let script;
    try {
      script = JSON.parse(scriptResult);
    } catch {
      const jsonMatch = scriptResult.match(/\{[\s\S]*\}/);
      script = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!script) {
      return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
    }

    return NextResponse.json({
      script,
      message: 'Script generated. Use /api/generate-portrait for individual pages.',
    });
  } catch (error) {
    console.error('Chapter generation error:', error);
    return NextResponse.json({ error: 'Failed to generate chapter' }, { status: 500 });
  }
}
