import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/server/api';
import { STYLE_PRESETS, PANEL_LAYOUT_TEMPLATES } from '@/lib/presets';

export async function GET(request: Request) {
  return withApiHandler(request, { routeId: 'presets:get', parseJson: false, rateLimit: 'relaxed' }, async () => {
    return NextResponse.json({
      stylePresets: STYLE_PRESETS,
      panelTemplates: PANEL_LAYOUT_TEMPLATES,
    });
  });
}
