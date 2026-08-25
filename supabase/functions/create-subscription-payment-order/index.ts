const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay credentials are not configured.");
}

type CreateOrderInput = {
  gymSubscriptionId: string;
};

export default {
  fetch: async (req: Request) => {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const authorization = req.headers.get("Authorization");

      if (!authorization) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = (await req.json()) as CreateOrderInput;

      if (!body.gymSubscriptionId) {
        return new Response("gymSubscriptionId is required", {
          status: 400,
        });
      }

      const { createClient } = await import("npm:@supabase/supabase-js@2");

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const publishableKeys = JSON.parse(
        Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")!,
      );

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        publishableKeys.default,
        {
          global: {
            headers: {
              Authorization: authorization,
            },
          },
        },
      );

      const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from("gym_subscriptions")
        .select(
          `
            id,
            gym_id,
            total_amount,
            status
          `,
        )
        .eq("id", body.gymSubscriptionId)
        .maybeSingle();

      if (invoiceError) {
        console.error("Failed to fetch invoice:", invoiceError);

        return new Response(
          JSON.stringify({
            success: false,
            step: "invoice",
            error: invoiceError.message,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      if (!invoice) {
        return new Response("Invoice not found", {
          status: 404,
        });
      }

      if (!["Pending", "Overdue"].includes(invoice.status)) {
        return new Response(
          `Invoice is not payable. Current status: ${invoice.status}`,
          {
            status: 400,
          },
        );
      }

      const amountInRupees = Number(invoice.total_amount);

      if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
        return new Response("Invalid invoice amount", {
          status: 400,
        });
      }

      const amountInPaise = Math.round(amountInRupees * 100);

      const razorpayCredentials = btoa(
        `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`,
      );

      const razorpayResponse = await fetch(
        "https://api.razorpay.com/v1/orders",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${razorpayCredentials}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: "INR",
            receipt: invoice.id,
            notes: {
              gym_id: invoice.gym_id,
              gym_subscription_id: invoice.id,
            },
          }),
        },
      );

      if (!razorpayResponse.ok) {
        const razorpayError = await razorpayResponse.text();

        console.error(
          "Razorpay order creation failed:",
          razorpayResponse.status,
          razorpayError,
        );

        return new Response(
          JSON.stringify({
            success: false,
            step: "razorpay",
            error: "Unable to create Razorpay order",
          }),
          {
            status: 502,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      const razorpayOrder = await razorpayResponse.json();

      if (!razorpayOrder?.id) {
        console.error(
          "Razorpay response did not contain an order ID:",
          razorpayOrder,
        );

        return new Response(
          JSON.stringify({
            success: false,
            step: "razorpay",
            error: "Invalid Razorpay order response",
          }),
          {
            status: 502,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      const { data: paymentId, error: paymentError } = await supabase.rpc(
        "create_subscription_payment_order",
        {
          p_gym_subscription_id: invoice.id,
          p_gateway_order_id: razorpayOrder.id,
        },
      );

      if (paymentError) {
        console.error("Failed to create subscription payment:", paymentError);

        return new Response(
          JSON.stringify({
            success: false,
            step: "create_subscription_payment_order",
            error: paymentError.message,
            code: paymentError.code,
            details: paymentError.details,
            hint: paymentError.hint,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      if (!paymentId) {
        console.error(
          "create_subscription_payment_order returned no payment ID",
        );

        return new Response(
          JSON.stringify({
            success: false,
            step: "create_subscription_payment_order",
            error: "Payment record was not created",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          paymentId,
          order: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            status: razorpayOrder.status,
            receipt: razorpayOrder.receipt,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      console.error("create-subscription-payment-order failed:", error);

      return new Response(
        JSON.stringify({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  },
};
