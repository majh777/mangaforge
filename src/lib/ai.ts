// AI model configuration and generation helpers for InkForge.

interface GenerateImageBatchOptions {
  concurrency?: number;
  retries?: number;
}

interface GenerateImageOptions {
  referenceImages?: string[];
}

declare global {
  // eslint-disable-next-line no-var
  var __inkforgeImageCache: Map<string, { image: string; timestamp: number }> | undefined;
}

const IMAGE_CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const imageCache = global.__inkforgeImageCache ?? new Map<string, { image: string; timestamp: number }>();
if (!global.__inkforgeImageCache) {
  global.__inkforgeImageCache = imageCache;
}

export const AI_CONFIG = {
  textModel: 'gemini-2.5-pro',
  textEndpoint:
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',

  imageModel: 'gemini-2.0-flash-exp-image-generation',
  imageEndpoint:
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent',

  fallbackTextModel: 'gemini-2.5-flash',
  fallbackEndpoint:
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
};

export function getApiKey(): string {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
}

function assertApiKey(): string {
  const key = getApiKey();
  if (!key) {
    throw new Error('Missing GOOGLE_API_KEY / GEMINI_API_KEY');
  }
  return key;
}

function buildContents(prompt: string, systemInstruction?: string) {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  if (systemInstruction) {
    contents.push({ role: 'user', parts: [{ text: systemInstruction }] });
    contents.push({
      role: 'model',
      parts: [{ text: 'Understood. I will follow these instructions.' }],
    });
  }

  contents.push({ role: 'user', parts: [{ text: prompt }] });
  return contents;
}

export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const key = assertApiKey();
  const contents = buildContents(prompt, systemInstruction);

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(`${AI_CONFIG.textEndpoint}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // Fallback to cheaper, faster model.
  const fallbackResponse = await fetch(`${AI_CONFIG.fallbackEndpoint}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!fallbackResponse.ok) {
    throw new Error(`Text generation failed (${response.status} / ${fallbackResponse.status})`);
  }

  const fallbackData = await fallbackResponse.json();
  return fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function imageCacheKey(prompt: string): string {
  return prompt.trim().replace(/\s+/g, ' ').toLowerCase();
}

function getCachedImage(prompt: string): string | null {
  const key = imageCacheKey(prompt);
  const entry = imageCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > IMAGE_CACHE_TTL_MS) {
    imageCache.delete(key);
    return null;
  }

  return entry.image;
}

function setCachedImage(prompt: string, image: string): void {
  const key = imageCacheKey(prompt);
  imageCache.set(key, { image, timestamp: Date.now() });
}

function extractImageFromGeminiResponse(data: Record<string, unknown>): string {
  const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
  const firstCandidate = candidates?.[0];
  const content = firstCandidate?.content as Record<string, unknown> | undefined;
  const parts = content?.parts as Array<Record<string, unknown>> | undefined;

  if (!parts) {
    throw new Error('No parts in image generation response');
  }

  for (const part of parts) {
    const inlineData = part.inlineData as Record<string, unknown> | undefined;
    const mimeType = inlineData?.mimeType;
    const rawImage = inlineData?.data;

    if (typeof mimeType === 'string' && mimeType.startsWith('image/') && typeof rawImage === 'string') {
      return `data:${mimeType};base64,${rawImage}`;
    }
  }

  throw new Error('No image found in generation response');
}

interface GenerateImageOptions {
  referenceImages?: string[];
}

function dataUrlToInlinePart(dataUrl: string): { inlineData: { mimeType: string; data: string } } | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  return {
    inlineData: {
      mimeType: match[1],
      data: match[2],
    },
  };
}

export async function generateImage(prompt: string, options: GenerateImageOptions = {}): Promise<string> {
  const referenceImages = (options.referenceImages || []).filter(Boolean);

  // Only use cache for prompt-only generations.
  if (referenceImages.length === 0) {
    const cached = getCachedImage(prompt);
    if (cached) return cached;
  }

  const key = assertApiKey();
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];

  for (const ref of referenceImages.slice(0, 4)) {
    const inlinePart = dataUrlToInlinePart(ref);
    if (inlinePart) parts.push(inlinePart);
  }

  const response = await fetch(`${AI_CONFIG.imageEndpoint}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        temperature: 0.9,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Image generation failed: ${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const image = extractImageFromGeminiResponse(data);

  if (referenceImages.length === 0) {
    setCachedImage(prompt, image);
  }

  return image;
}

export async function generateImageWithRetry(
  prompt: string,
  retries = 2,
  options: GenerateImageOptions = {}
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await generateImage(prompt, options);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Image generation failed');
}

export async function generateImageBatch(
  prompts: string[],
  options: GenerateImageBatchOptions = {}
): Promise<Array<{ prompt: string; imageUrl: string | null; error?: string }>> {
  const concurrency = Math.max(1, options.concurrency ?? 3);
  const retries = Math.max(0, options.retries ?? 1);

  const results: Array<{ prompt: string; imageUrl: string | null; error?: string }> =
    Array.from({ length: prompts.length }, (_, index) => ({
      prompt: prompts[index],
      imageUrl: null,
    }));

  let cursor = 0;

  async function worker() {
    while (cursor < prompts.length) {
      const index = cursor;
      cursor += 1;

      const prompt = prompts[index];
      try {
        const imageUrl = await generateImageWithRetry(prompt, retries);
        results[index] = { prompt, imageUrl };
      } catch (error) {
        results[index] = {
          prompt,
          imageUrl: null,
          error: error instanceof Error ? error.message : 'Unknown image generation error',
        };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, prompts.length) }, () => worker()));
  return results;
}

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

export function calculateChapterCost(pageCount: number, basePages = 24): number {
  if (pageCount <= basePages) return CREDIT_COSTS.chapter;
  return CREDIT_COSTS.chapter + Math.ceil((pageCount - basePages) * 0.25);
}
