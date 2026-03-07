export type UserTier = 'free' | 'starter' | 'pro' | 'unlimited';

export type ProjectStatus = 'draft' | 'in_progress' | 'published' | 'archived';

export type ContentFormat = 'manga' | 'western' | 'webtoon';

export interface ChapterPage {
  pageNumber: number;
  imageUrl: string;
  prompt?: string;
  status: 'complete' | 'error';
}

export interface ChapterRecord {
  id: string;
  chapterNumber: number;
  title: string;
  summary: string;
  hookTeaseLine?: string;
  pages: ChapterPage[];
  createdAt: string;
}

export interface ComicProject {
  id: string;
  slug: string;
  ownerId: string;
  title: string;
  style: string;
  stylePreset: ContentFormat;
  panelTemplate: string;
  synopsis?: Record<string, unknown>;
  characters?: Array<Record<string, unknown>>;
  chapters: ChapterRecord[];
  coverImage?: string;
  status: ProjectStatus;
  tags: string[];
  shareSlug?: string;
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShowcaseEntry {
  id: string;
  projectId: string;
  title: string;
  creator: string;
  previewImage?: string;
  style: string;
  likes: number;
  views: number;
  tags: string[];
  shareSlug: string;
  featured?: boolean;
  createdAt: string;
}

export interface UsageSnapshot {
  date: string; // YYYY-MM-DD
  requests: number;
  creditsUsed: number;
  byFeature: Record<string, number>;
}

export interface InkForgeDb {
  projects: ComicProject[];
  showcase: ShowcaseEntry[];
  usage: Record<string, UsageSnapshot>; // key: `${userId}:${date}`
  shareIndex: Record<string, string>; // shareSlug -> projectId
}
