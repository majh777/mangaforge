import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion });
}

const CREDIT_PACKS = {
  spark: { credits: 40, price: 499, name: 'Spark Pack — 40 Credits' },
  flame: { credits: 100, price: 999, name: 'Flame Pack — 100 Credits (+10 bonus)' },
  blaze: { credits: 275, price: 2499, name: 'Blaze Pack — 275 Credits (+25 bonus)' },
  inferno: { credits: 625, price: 4999, name: 'Inferno Pack — 625 Credits (+75 bonus)' },
  supernova: { credits: 1400, price: 9999, name: 'Supernova Pack — 1400 Credits (+200 bonus)' },
};

const SUBSCRIPTIONS = {
  starter: { price: 999, name: 'Starter Plan', credits: 100, interval: 'month' as const },
  pro: { price: 2499, name: 'Pro Plan', credits: 300, interval: 'month' as const },
  unlimited: { price: 4999, name: 'Unlimited Plan', credits: 800, interval: 'month' as const },
};

export async function POST(request: Request) {
  try {
    const { type, packId, userId } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (type === 'credits') {
      const pack = CREDIT_PACKS[packId as keyof typeof CREDIT_PACKS];
      if (!pack) return NextResponse.json({ error: 'Invalid pack' }, { status: 400 });

      const session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: pack.name,
              description: `${pack.credits} credits for MangaForge`,
              images: ['https://mangaforge.ai/og-image.png'],
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        }],
        metadata: {
          type: 'credit_pack',
          packId,
          credits: pack.credits.toString(),
          userId: userId || '',
        },
        success_url: `${baseUrl}/settings?credits=purchased&pack=${packId}`,
        cancel_url: `${baseUrl}/settings?credits=cancelled`,
      });

      return NextResponse.json({ url: session.url });
    }

    if (type === 'subscription') {
      const plan = SUBSCRIPTIONS[packId as keyof typeof SUBSCRIPTIONS];
      if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

      const product = await getStripe().products.create({
        name: plan.name,
        description: `${plan.credits} credits/month + premium features`,
      });

      const price = await getStripe().prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'usd',
        recurring: { interval: plan.interval },
      });

      const session = await getStripe().checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: price.id, quantity: 1 }],
        metadata: {
          type: 'subscription',
          planId: packId,
          credits: plan.credits.toString(),
          userId: userId || '',
        },
        success_url: `${baseUrl}/settings?sub=active&plan=${packId}`,
        cancel_url: `${baseUrl}/settings?sub=cancelled`,
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Stripe checkout failed' }, { status: 500 });
  }
}
