// Story Bible — shared state that accumulates through the creation flow.
// Stored in sessionStorage under 'mangaforge_bible'.

const BIBLE_KEY = 'mangaforge_bible';

export interface ChapterSummary {
  chapterNumber: number;
  title: string;
  summary: string;
  characterStatusUpdates?: Array<{ name: string; status: string }>;
}

export interface StoryBible {
  prompt: string;
  config: {
    style: string;
    pagesPerChapter: number;
    panelsPerPage: number;
    contentRating: string;
    artDetail: string;
    colorMode: string;
  };
  synopsis?: Record<string, unknown>;
  hiddenArc?: string;
  chapterBreakdown?: Array<{ number: number; title: string; summary: string; hookType: string }>;
  characters?: unknown[];
  chapters: ChapterSummary[];
}

export function loadBible(): StoryBible | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(BIBLE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoryBible;
  } catch {
    return null;
  }
}

export function saveBible(bible: StoryBible): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(BIBLE_KEY, JSON.stringify(bible));
}

export function updateBible(patch: Partial<StoryBible>): StoryBible {
  const existing = loadBible();
  const updated: StoryBible = {
    prompt: '',
    config: { style: '', pagesPerChapter: 20, panelsPerPage: 6, contentRating: 'PG-13', artDetail: 'High', colorMode: 'Auto' },
    chapters: [],
    ...existing,
    ...patch,
  };
  saveBible(updated);
  return updated;
}

export function addChapterToBible(chapter: ChapterSummary): StoryBible {
  const bible = loadBible();
  if (!bible) throw new Error('No bible found');
  const chapters = bible.chapters.filter(c => c.chapterNumber !== chapter.chapterNumber);
  chapters.push(chapter);
  chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
  return updateBible({ chapters });
}
