import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/server/api';
import { ApiError } from '@/lib/server/errors';

export async function POST(request: Request) {
  return withApiHandler(request, { routeId: 'stripe:webhook', parseJson: false, rateLimit: 'strict' }, async () => {
    const key = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!key || !webhookSecret) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(key, {
      apiVersion: '2025-02-24.acacia' as import('stripe').Stripe.LatestApiVersion,
    });

    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    let event: import('stripe').Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
      throw new ApiError(400, 'INVALID_SIGNATURE', 'Invalid Stripe webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = (session as unknown as { metadata?: Record<string, string> }).metadata;
        if (metadata?.type === 'credit_pack') {
          console.log(
            `[InkForge Stripe] credits purchased user=${metadata.userId} total=${metadata.totalCredits}`
          );
        }

        if (metadata?.type === 'subscription') {
          console.log(
            `[InkForge Stripe] subscription activated user=${metadata.userId} plan=${metadata.planId}`
          );
        }
        break;
      }

      case 'invoice.payment_failed':
      case 'customer.subscription.deleted': {
        console.log(`[InkForge Stripe] lifecycle event=${event.type}`);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  });
}
