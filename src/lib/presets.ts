import type { ContentFormat } from '@/lib/types';

export interface StylePreset {
  id: ContentFormat;
  name: string;
  description: string;
  defaultStyle: string;
  readingDirection: 'rtl' | 'ltr' | 'vertical';
  recommendedPanelsPerPage: number;
  defaultPagesPerChapter: number;
  accent: string;
}

export interface PanelTemplate {
  id: string;
  name: string;
  description: string;
  panelCount: number;
  bestFor: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'manga',
    name: 'Manga Storytelling',
    description: 'Right-to-left pacing, expressive screentones, dynamic action framing.',
    defaultStyle: 'shonen',
    readingDirection: 'rtl',
    recommendedPanelsPerPage: 6,
    defaultPagesPerChapter: 20,
    accent: '#0EA5E9',
  },
  {
    id: 'western',
    name: 'Western Comic',
    description: 'Color-first composition, bold speech bubbles, left-to-right pacing.',
    defaultStyle: 'american_superhero',
    readingDirection: 'ltr',
    recommendedPanelsPerPage: 5,
    defaultPagesPerChapter: 22,
    accent: '#EC4899',
  },
  {
    id: 'webtoon',
    name: 'Webtoon Vertical',
    description: 'Mobile-first vertical scroll with dramatic spacing and reveal beats.',
    defaultStyle: 'webtoon',
    readingDirection: 'vertical',
    recommendedPanelsPerPage: 2,
    defaultPagesPerChapter: 60,
    accent: '#06B6D4',
  },
];

export const PANEL_LAYOUT_TEMPLATES: PanelTemplate[] = [
  {
    id: 'classic-6-grid',
    name: 'Classic 6-Panel Grid',
    description: 'Balanced page rhythm with clean storytelling and stable pacing.',
    panelCount: 6,
    bestFor: 'Dialogue + action balance',
  },
  {
    id: 'cinematic-5',
    name: 'Cinematic 5-Panel',
    description: 'Larger panels for emotional beats and dramatic reveals.',
    panelCount: 5,
    bestFor: 'Character moments',
  },
  {
    id: 'action-splash-4',
    name: 'Action + Splash',
    description: 'Mix of small setup panels and one large impact panel.',
    panelCount: 4,
    bestFor: 'Fight scenes & cliffhangers',
  },
  {
    id: 'webtoon-vertical',
    name: 'Vertical Scroll Sequence',
    description: 'Tall panel stack optimized for mobile swiping.',
    panelCount: 2,
    bestFor: 'Webtoon pacing',
  },
];

export function getStylePresetById(id: string | null | undefined): StylePreset {
  return STYLE_PRESETS.find((preset) => preset.id === id) ?? STYLE_PRESETS[0];
}

export function getPanelTemplateById(id: string | null | undefined): PanelTemplate {
  return PANEL_LAYOUT_TEMPLATES.find((template) => template.id === id) ?? PANEL_LAYOUT_TEMPLATES[0];
}
