import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { synopsis, style, contentRating, artDetail, colorMode } = await request.json();

    const systemInstruction = `You are MangaForge's character creation engine. You design psychologically complex characters using a 10-model personality framework. Always respond in valid JSON.`;

    const userPrompt = `Based on this manga synopsis, create a cast of characters:

SYNOPSIS: ${JSON.stringify(synopsis)}
ART STYLE: ${style}
CONTENT RATING: ${contentRating || 'PG-13'}
ART DETAIL LEVEL: ${artDetail || 'High'}
COLOR MODE: ${colorMode || 'Auto'}

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
        "bigFive": { "openness": 75, "conscientiousness": 45, "extraversion": 80, "agreeableness": 60, "neuroticism": 35 },
        "mbti": "ENFP",
        "enneagram": "7w8",
        "attachmentStyle": "secure",
        "maslowLevel": "esteem",
        "moralFoundations": { "care": 8, "fairness": 7, "loyalty": 9, "authority": 3, "sanctity": 4, "liberty": 9 },
        "jungianArchetype": { "primary": "The Hero", "secondary": "The Rebel" },
        "eq": { "selfAwareness": 6, "selfRegulation": 4, "motivation": 9, "empathy": 7, "socialSkills": 8 },
        "defenseMechanisms": { "primary": "humor", "secondary": "sublimation" },
        "loveLanguages": ["quality_time", "words_of_affirmation", "acts_of_service", "physical_touch", "receiving_gifts"]
      }
    }
  ]
}

Create 3-5 characters minimum. Include at least one protagonist, one antagonist, and one supporting character. Make each character psychologically rich and distinct. The personality matrix must be internally consistent — a character's MBTI, Big Five, Enneagram, and defense mechanisms should all tell the same story.`;

    const result = await generateText(userPrompt, systemInstruction);

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { characters: [] };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Character generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate characters' },
      { status: 500 }
    );
  }
}
