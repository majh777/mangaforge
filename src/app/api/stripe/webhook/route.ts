import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion });
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { type, credits, userId, planId } = session.metadata || {};

      if (type === 'credit_pack' && credits && userId) {
        // TODO: Add credits to user account in database
        console.log(`💰 Credits purchased: ${credits} credits for user ${userId}`);
      }

      if (type === 'subscription' && planId && userId) {
        // TODO: Activate subscription and add monthly credits
        console.log(`🔥 Subscription activated: ${planId} for user ${userId}`);
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`📋 Subscription ${event.type}: ${sub.id}`);
      // TODO: Update user subscription status in database
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`⚠️ Payment failed: ${invoice.id}`);
      // TODO: Notify user, downgrade if needed
      break;
    }
  }

  return NextResponse.json({ received: true });
}
