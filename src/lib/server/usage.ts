import type { UserTier, UsageSnapshot } from '@/lib/types';
import { mutateDb, readDb } from '@/lib/server/db';
import { ApiError } from '@/lib/server/errors';

export const DAILY_CREDIT_LIMIT: Record<UserTier, number> = {
  free: 500,
  starter: 1000,
  pro: 5000,
  unlimited: Number.POSITIVE_INFINITY,
};

export function resolveTier(input: unknown): UserTier {
  if (input === 'starter' || input === 'pro' || input === 'unlimited') {
    return input;
  }
  return 'free';
}

function usageKey(userId: string, date: string): string {
  return `${userId}:${date}`;
}

function currentDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizeUsage(snapshot?: UsageSnapshot): UsageSnapshot {
  return (
    snapshot ?? {
      date: currentDate(),
      requests: 0,
      creditsUsed: 0,
      byFeature: {},
    }
  );
}

export async function getUsage(userId: string, date = currentDate()): Promise<UsageSnapshot> {
  const db = await readDb();
  return normalizeUsage(db.usage[usageKey(userId, date)]);
}

export async function assertWithinDailyLimit(
  userId: string,
  tier: UserTier,
  creditCost: number
): Promise<{ remaining: number; limit: number }> {
  const usage = await getUsage(userId);
  const limit = DAILY_CREDIT_LIMIT[tier];
  const projected = usage.creditsUsed + Math.max(creditCost, 0);

  if (projected > limit) {
    throw new ApiError(
      429,
      'DAILY_LIMIT_REACHED',
      `Daily credit limit reached for ${tier} tier`,
      {
        limit,
        used: usage.creditsUsed,
        attemptedCost: creditCost,
      }
    );
  }

  return { remaining: Math.max(limit - projected, 0), limit };
}

export async function recordUsage(
  userId: string,
  feature: string,
  creditCost: number
): Promise<UsageSnapshot> {
  return mutateDb((db) => {
    const date = currentDate();
    const key = usageKey(userId, date);
    const snapshot = normalizeUsage(db.usage[key]);

    snapshot.requests += 1;
    snapshot.creditsUsed += Math.max(creditCost, 0);
    snapshot.byFeature[feature] = (snapshot.byFeature[feature] ?? 0) + 1;

    db.usage[key] = snapshot;
    return snapshot;
  });
}
