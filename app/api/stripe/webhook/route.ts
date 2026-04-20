import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not set" },
      { status: 500 }
    );
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 });

  const raw = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "bad signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata?.userId ?? "") as string;
        const subscriptionId = session.subscription as string | null;
        if (userId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await applySubscription(userId, sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (user) {
          await applySubscription(user.id, sub);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err);
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function applySubscription(userId: string, sub: Stripe.Subscription) {
  const active = ["active", "trialing"].includes(sub.status);
  const plan = active ? "PRO" : "FREE";
  const endSec =
    (sub as Stripe.Subscription & { current_period_end?: number })
      .current_period_end ?? Math.floor(Date.now() / 1000);
  const currentPeriodEnd = new Date(endSec * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      stripeSubscriptionId: sub.id,
    },
  });

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeSubscriptionId: sub.id,
      status: sub.status,
      currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    create: {
      userId,
      stripeSubscriptionId: sub.id,
      status: sub.status,
      currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}
