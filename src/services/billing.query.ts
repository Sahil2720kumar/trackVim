import { Database } from "@/db/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function getGymInvoices(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { data, error } = await supabase
    .from("gym_subscriptions")
    .select(
      `
      id,
      gym_id,
      plan_id,
      billing_period_start,
      billing_period_end,
      active_member_count,
      price_per_member,
      total_amount,
      invoice_date,
      due_date,
      is_prorated,
      proration_days,
      proration_total_days,
      status,
      created_at,
      updated_at,
      subscription_plans (
        id,
        name,
        billing_model
      )
    `,
    )
    .eq("gym_id", gymId)
    .order("billing_period_start", { ascending: false });

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  return {
    success: true as const,
    data: data ?? [],
  };
}

export type GymInvoicesResult = Extract<
  Awaited<ReturnType<typeof getGymInvoices>>,
  { success: true }
>["data"];

export async function getGymInvoice(
  supabase: TypedSupabaseClient,
  gymId: string,
  invoiceId: string,
) {
  const { data, error } = await supabase
    .from("gym_subscriptions")
    .select(
      `
      id,
      gym_id,
      plan_id,
      billing_period_start,
      billing_period_end,
      active_member_count,
      price_per_member,
      total_amount,
      invoice_date,
      due_date,
      is_prorated,
      proration_days,
      proration_total_days,
      status,
      created_at,
      updated_at,
      subscription_plans (
        id,
        name,
        billing_model,
        max_members,
        price_per_member,
        flat_price,
        features
      )
    `,
    )
    .eq("id", invoiceId)
    .eq("gym_id", gymId)
    .maybeSingle();

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  if (!data) {
    return {
      success: false as const,
      error: "Invoice not found.",
    };
  }

  return {
    success: true as const,
    data,
  };
}

export type GymInvoiceResult = Extract<
  Awaited<ReturnType<typeof getGymInvoice>>,
  { success: true }
>["data"];

export async function getSubscriptionPayments(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { data, error } = await supabase
    .from("subscription_payments")
    .select(
      `
      id,
      gym_subscription_id,
      amount,
      payment_method,
      gateway_provider,
      gateway_payment_id,
      gateway_order_id,
      status,
      paid_at,
      created_at,
      gym_subscriptions!inner (
        gym_id,
        billing_period_start,
        billing_period_end
      )
    `,
    )
    .eq("gym_subscriptions.gym_id", gymId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  return {
    success: true as const,
    data: data ?? [],
  };
}

export type SubscriptionPaymentsResult = Extract<
  Awaited<ReturnType<typeof getSubscriptionPayments>>,
  { success: true }
>["data"];

export async function getSubscriptionPlans(supabase: TypedSupabaseClient) {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select(
      `
      id,
      name,
      billing_model,
      max_members,
      price_per_member,
      flat_price,
      features,
      is_active
      `,
    )
    .eq("is_active", true)
    .order("flat_price", { ascending: true });

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  return {
    success: true as const,
    data: data ?? [],
  };
}

export type SubscriptionPlansResult = Extract<
  Awaited<ReturnType<typeof getSubscriptionPlans>>,
  { success: true }
>["data"];

export async function getActiveMemberCount(
  supabase: TypedSupabaseClient,
  gymId: string,
) {
  const { count, error } = await supabase
    .from("gym_memberships")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("gym_id", gymId)
    .eq("status", "Active");

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  return {
    success: true as const,
    data: count ?? 0,
  };
}

export type ActiveMemberCountResult = Extract<
  Awaited<ReturnType<typeof getActiveMemberCount>>,
  { success: true }
>["data"];

export async function getBillingOverview(supabase: TypedSupabaseClient) {
  const { data, error } = await supabase.rpc("get_gym_billing_overview");

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  return {
    success: true as const,
    data,
  };
}

export type BillingOverviewResult = Extract<
  Awaited<ReturnType<typeof getBillingOverview>>,
  { success: true }
>["data"];

// Billing Overview
//        │
//        └── get_gym_billing_overview()
//               ├── gym
//               │    ├── status
//               │    ├── billing_status
//               │    └── billing_start_date
//               │
//               ├── plan
//               │
//               ├── active_member_count
//               │
//               ├── current_invoice
//               │
//               └── last_invoice

// Invoice History
//        │
//        └── getGymInvoices()

// Invoice Details
//        │
//        └── getGymInvoice()

// Payment History
//        │
//        └── getSubscriptionPayments()

// Change Plan
//        │
//        └── getSubscriptionPlans()
