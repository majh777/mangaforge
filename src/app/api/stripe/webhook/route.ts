import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!key || !webhookSecret) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' as import('stripe').Stripe.LatestApiVersion });

    const body = await request.text();
    const sig = request.headers.get('stripe-signature') || '';

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = (session as unknown as Record<string, unknown>).metadata as Record<string, string> | undefined;
        if (metadata?.type === 'credit_pack') {
          console.log(`💰 Credits purchased: ${metadata.credits} for user ${metadata.userId}`);
        }
        if (metadata?.type === 'subscription') {
          console.log(`🔥 Subscription activated: ${metadata.planId} for user ${metadata.userId}`);
        }
        break;
      }
      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        console.log(`⚠️ Event: ${event.type}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
