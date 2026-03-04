// AI Model Configuration
// Using Gemini 3.1 Pro for all generation (best quality)

export const AI_CONFIG = {
  // Text generation (synopsis, characters, dialogue, hooks)
  textModel: 'gemini-3.1-pro',
  textEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro:generateContent',

  // Image generation (manga pages, portraits, covers)
  imageModel: 'gemini-3.1-flash-image-preview', // NanoBanana 2
  imageEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent',

  // Fallback text model
  fallbackTextModel: 'gemini-2.5-flash',
  fallbackEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
};

export function getApiKey(): string {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
}

export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const key = getApiKey();
  const contents = [];

  if (systemInstruction) {
    contents.push({ role: 'user', parts: [{ text: systemInstruction }] });
    contents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
  }
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  const res = await fetch(`${AI_CONFIG.textEndpoint}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    // Fallback to 2.5 Flash
    const fallbackRes = await fetch(`${AI_CONFIG.fallbackEndpoint}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    });
    if (!fallbackRes.ok) throw new Error('Both models failed');
    const data = await fallbackRes.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function generateImage(prompt: string): Promise<string> {
  const key = getApiKey();

  const res = await fetch(`${AI_CONFIG.imageEndpoint}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        temperature: 1.0,
      },
    }),
  });

  if (!res.ok) throw new Error(`Image generation failed: ${res.status}`);
  const data = await res.json();

  // Extract base64 image from response
  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('No image in response');
}

// Credit cost calculations
export const CREDIT_COSTS = {
  synopsis: 1,
  characters: 3,
  characterRegen: 1,
  characterPortrait: 2,
  chapter: 8,
  chapterArtOnly: 5,
  pageRegen: 2,
  remix: 6,
  translate: 1,
  chatSFW: 0.1,
  chatNSFW: 0.15,
  chatMulti: 0.3,
  export: 0,
  publish: 0,
};

export function calculateChapterCost(pageCount: number, basePages: number = 24): number {
  if (pageCount <= basePages) return CREDIT_COSTS.chapter;
  return CREDIT_COSTS.chapter + Math.ceil((pageCount - basePages) * 0.25);
}
