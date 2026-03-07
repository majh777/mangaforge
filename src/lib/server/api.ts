import { NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/server/rate-limit';
import { errorResponse, ApiError } from '@/lib/server/errors';
import { safeJson } from '@/lib/server/validation';
import { resolveTier } from '@/lib/server/usage';
import type { UserTier } from '@/lib/types';

type RateLimitTier = keyof typeof RATE_LIMITS;

export interface ApiContext<TBody = Record<string, unknown>> {
  request: Request;
  body: TBody;
  userId: string;
  userTier: UserTier;
  ip: string;
}

interface ApiHandlerOptions {
  parseJson?: boolean;
  rateLimit?: RateLimitTier;
  routeId: string;
}

function getIpAddress(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return '0.0.0.0';
}

function fallbackUserId(ip: string): string {
  const compact = ip.replace(/[^a-zA-Z0-9]/g, '') || 'anon';
  return `anon_${compact}`;
}

export async function withApiHandler<TBody = Record<string, unknown>>(
  request: Request,
  options: ApiHandlerOptions,
  handler: (ctx: ApiContext<TBody>) => Promise<NextResponse>
): Promise<NextResponse> {
  const {
    parseJson = true,
    rateLimit = 'standard',
    routeId,
  } = options;

  try {
    const body = parseJson ? await safeJson<TBody>(request) : ({} as TBody);
    const ip = getIpAddress(request);

    const inputRecord = body as Record<string, unknown>;
    const userIdHeader = request.headers.get('x-user-id');
    const bodyUserId = typeof inputRecord.userId === 'string' ? inputRecord.userId : undefined;
    const userId = (bodyUserId || userIdHeader || fallbackUserId(ip)).trim();

    const userTierHeader = request.headers.get('x-user-tier');
    const bodyTier = inputRecord.userTier;
    const userTier = resolveTier(bodyTier ?? userTierHeader ?? 'free');

    const limiterKey = `${routeId}:${userId}`;
    const limit = checkRateLimit(limiterKey, RATE_LIMITS[rateLimit]);

    if (!limit.ok) {
      throw new ApiError(429, 'RATE_LIMITED', 'Too many requests', {
        retryAfterMs: limit.retryAfterMs,
      });
    }

    const response = await handler({
      request,
      body,
      userId,
      userTier,
      ip,
    });

    response.headers.set('x-ratelimit-remaining', String(limit.remaining));
    response.headers.set('x-ratelimit-reset', String(limit.resetAt));

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
