"use server";

import { createServerClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function changeGymSubscriptionPlanAction(input: {
  gymId: string;
  planId: string;
}) {
  const supabase = await createServerClient();

  const { error } = await supabase.rpc("change_gym_subscription_plan", {
    p_gym_id: input.gymId,
    p_new_plan_id: input.planId,
  });

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  return {
    success: true as const,
  };
}

// export async function createSubscriptionPaymentOrderAction(input: {
//   gymSubscriptionId: string;
// }) {
//   const supabase = await createServerClient();

//   /*
//    * 1. Fetch invoice
//    */
//   const { data: invoice, error: invoiceError } = await supabase
//     .from("gym_subscriptions")
//     .select("id, gym_id, total_amount, status")
//     .eq("id", input.gymSubscriptionId)
//     .maybeSingle();

//   if (invoiceError) {
//     return {
//       success: false as const,
//       error: invoiceError.message,
//     };
//   }

//   if (!invoice) {
//     return {
//       success: false as const,
//       error: "Invoice not found.",
//     };
//   }

//   if (!["Pending", "Overdue"].includes(invoice.status)) {
//     return {
//       success: false as const,
//       error: "Invoice is not payable.",
//     };
//   }

//   /*
//    * 2. Create Razorpay order here.
//    *
//    * IMPORTANT:
//    * Razorpay secret key must only exist on the server.
//    */

//   const razorpayOrderId = await createRazorpayOrder({
//     amount: Number(invoice.total_amount),
//     currency: "INR",
//     receipt: invoice.id,
//   });

//   /*
//    * 3. Record mapping in DB
//    */
//   const { data: paymentId, error } = await supabase.rpc(
//     "create_subscription_payment_order",
//     {
//       p_gym_subscription_id: invoice.id,
//       p_gateway_order_id: razorpayOrderId,
//     },
//   );

//   if (error) {
//     return {
//       success: false as const,
//       error: error.message,
//     };
//   }

//   return {
//     success: true as const,
//     data: {
//       paymentId,
//       razorpayOrderId,
//       amount: invoice.total_amount,
//     },
//   };
// }

export async function createSubscriptionPaymentOrderAction(input: {
  gymSubscriptionId: string;
}) {
  const supabase = await createServerClient();

  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return {
      success: false as const,
      error: "Unauthorized",
    };
  }

  const { data, error } = await supabase.functions.invoke(
    "create-subscription-payment-order",
    {
      body: {
        gymSubscriptionId: input.gymSubscriptionId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error) {
    // Log server-side only, never return raw error details to the client
    console.error("createSubscriptionPaymentOrderAction failed:", error);

    return {
      success: false as const,
      error: "Failed to create payment order. Please try again.",
    };
  }

  return {
    success: true as const,
    data,
  };
}

export async function reactivateGymSubscriptionAction(gymId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("reactivate_gym_subscription", {
    p_gym_id: gymId,
  });

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

export async function cancelGymBillingAction() {
  const supabase = await createServerClient();

  const { error } = await supabase.rpc("cancel_gym_billing");

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  return {
    success: true as const,
  };
}
