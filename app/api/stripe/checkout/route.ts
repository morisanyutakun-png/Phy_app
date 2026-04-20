import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Stripeが未設定です。管理者に連絡してください。" },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  let customerId = user.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID_PRO!,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    success_url: `${base}/dashboard?billing=success`,
    cancel_url: `${base}/pricing?billing=cancel`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: session.url });
}
