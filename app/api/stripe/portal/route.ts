import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  if (!stripeConfigured() || !user.stripeCustomerId) {
    return NextResponse.json(
      { error: "まずProにアップグレードしてください" },
      { status: 400 }
    );
  }
  const stripe = getStripe();
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${base}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
