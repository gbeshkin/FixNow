import Stripe from "stripe";

export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia"
  });
}

export function paymentPlaceholder() {
  return {
    enabled: Boolean(process.env.STRIPE_SECRET_KEY),
    mode: "future_checkout_session"
  };
}
