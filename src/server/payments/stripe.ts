import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });
export function idempotencyKey(seed: string){ return `np_${seed}`.slice(0, 64); }
