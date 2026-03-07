import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/server/api';
import { readEnum, readString } from '@/lib/server/validation';

const CREDIT_PACKS = {
  spark: {
    credits: 50,
    bonus: 0,
    price: 499,
    name: 'Spark Pack',
    description: '50 credits for quick experiments',
  },
  flame: {
    credits: 120,
    bonus: 15,
    price: 999,
    name: 'Flame Pack',
    description: '120 + 15 bonus credits',
  },
  blaze: {
    credits: 300,
    bonus: 50,
    price: 2499,
    name: 'Blaze Pack',
    description: '300 + 50 bonus credits (best value)',
  },
  inferno: {
    credits: 700,
    bonus: 130,
    price: 4999,
    name: 'Inferno Pack',
    description: '700 + 130 bonus credits',
  },
  supernova: {
    credits: 1600,
    bonus: 320,
    price: 9999,
    name: 'Supernova Pack',
    description: '1600 + 320 bonus credits for teams',
  },
} as const;

const SUBSCRIPTIONS = {
  starter: {
    price: 999,
    name: 'Starter Plan',
    credits: 250,
    dailyLimit: 250,
    interval: 'month' as const,
  },
  pro: {
    price: 2499,
    name: 'Pro Plan',
    credits: 1000,
    dailyLimit: 1000,
    interval: 'month' as const,
  },
  unlimited: {
    price: 4999,
    name: 'Unlimited Plan',
    credits: 999999,
    dailyLimit: 999999,
    interval: 'month' as const,
  },
} as const;

interface CheckoutBody {
  type?: 'credits' | 'subscription';
  packId?: string;
  userId?: string;
}

export async function POST(request: Request) {
  return withApiHandler<CheckoutBody>(request, { routeId: 'stripe:checkout', rateLimit: 'strict' }, async (ctx) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(key, {
      apiVersion: '2025-02-24.acacia' as import('stripe').Stripe.LatestApiVersion,
    });

    const checkoutType = readEnum(
      ctx.body.type,
      ['credits', 'subscription'] as const,
      'type',
      'credits'
    );

    const packId = readString(ctx.body.packId, {
      field: 'packId',
      min: 2,
      max: 40,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (checkoutType === 'credits') {
      const pack = CREDIT_PACKS[packId as keyof typeof CREDIT_PACKS];
      if (!pack) {
        return NextResponse.json({ error: 'Invalid credit pack' }, { status: 400 });
      }

      const totalCredits = pack.credits + pack.bonus;

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${pack.name} — ${totalCredits} Credits`,
                description: pack.description,
              },
              unit_amount: pack.price,
            },
            quantity: 1,
          },
        ],
        metadata: {
          source: 'inkforge',
          type: 'credit_pack',
          packId,
          credits: String(pack.credits),
          bonus: String(pack.bonus),
          totalCredits: String(totalCredits),
          userId: ctx.userId,
        },
        success_url: `${baseUrl}/settings?credits=purchased&pack=${packId}`,
        cancel_url: `${baseUrl}/settings?credits=cancelled`,
      });

      return NextResponse.json({ url: session.url });
    }

    const plan = SUBSCRIPTIONS[packId as keyof typeof SUBSCRIPTIONS];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: plan.price,
            recurring: { interval: plan.interval },
            product_data: {
              name: plan.name,
              description: `${plan.credits} monthly credits • Daily cap: ${plan.dailyLimit}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        source: 'inkforge',
        type: 'subscription',
        planId: packId,
        monthlyCredits: String(plan.credits),
        dailyLimit: String(plan.dailyLimit),
        userId: ctx.userId,
      },
      success_url: `${baseUrl}/settings?sub=active&plan=${packId}`,
      cancel_url: `${baseUrl}/settings?sub=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  });
}
