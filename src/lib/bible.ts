// Story Bible — shared state that accumulates through the creation flow.

import { getSessionJSON, setSessionJSON } from '@/lib/storage';

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
    stylePreset?: string;
    panelTemplate?: string;
  };
  synopsis?: Record<string, unknown>;
  hiddenArc?: string;
  chapterBreakdown?: Array<{ number: number; title: string; summary: string; hookType: string }>;
  characters?: Array<Record<string, unknown>>;
  chapters: ChapterSummary[];
}

export function loadBible(): StoryBible | null {
  return getSessionJSON<StoryBible>('bible');
}

export function saveBible(bible: StoryBible): void {
  setSessionJSON('bible', bible);
}

export function updateBible(patch: Partial<StoryBible>): StoryBible {
  const existing = loadBible();
  const updated: StoryBible = {
    prompt: '',
    config: {
      style: '',
      pagesPerChapter: 20,
      panelsPerPage: 6,
      contentRating: 'PG-13',
      artDetail: 'High',
      colorMode: 'Auto',
      stylePreset: 'manga',
      panelTemplate: 'classic-6-grid',
    },
    chapters: [],
    ...existing,
    ...patch,
  };
  saveBible(updated);
  return updated;
}

export function addChapterToBible(chapter: ChapterSummary): StoryBible {
  const bible = loadBible();
  if (!bible) throw new Error('No story bible found');

  const chapters = bible.chapters.filter((entry) => entry.chapterNumber !== chapter.chapterNumber);
  chapters.push(chapter);
  chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

  return updateBible({ chapters });
}
