import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/server/api';
import { DAILY_CREDIT_LIMIT, getUsage } from '@/lib/server/usage';

export async function GET(request: Request) {
  return withApiHandler(request, { routeId: 'usage:get', parseJson: false, rateLimit: 'relaxed' }, async (ctx) => {
    const usage = await getUsage(ctx.userId);
    const dailyLimit = DAILY_CREDIT_LIMIT[ctx.userTier];
    const remaining = Number.isFinite(dailyLimit)
      ? Math.max(dailyLimit - usage.creditsUsed, 0)
      : null;

    return NextResponse.json({
      usage,
      tier: ctx.userTier,
      dailyLimit,
      remaining,
    });
  });
}
