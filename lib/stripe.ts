import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!cached) {
    cached = new Stripe(key, { apiVersion: "2024-10-28.acacia" });
  }
  return cached;
}

export function stripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID_PRO
  );
}
