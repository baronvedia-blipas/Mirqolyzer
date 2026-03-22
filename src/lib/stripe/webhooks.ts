import type Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getPlanByPriceId } from "./plans";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  const plan = session.metadata?.plan;
  if (!userId || !plan) return;

  const supabase = getAdminClient();
  await supabase
    .from("profiles")
    .update({ plan, stripe_customer_id: session.customer as string })
    .eq("id", userId);
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getAdminClient();
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) return;

  const plan = getPlanByPriceId(priceId);
  if (!plan) return;

  await supabase
    .from("profiles")
    .update({ plan })
    .eq("stripe_customer_id", customerId);
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getAdminClient();
  const customerId = subscription.customer as string;
  await supabase
    .from("profiles")
    .update({ plan: "free" })
    .eq("stripe_customer_id", customerId);
}
