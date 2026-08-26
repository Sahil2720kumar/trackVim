import { withSupabase } from "npm:@supabase/server@^1";

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

if (!RAZORPAY_WEBHOOK_SECRET) {
  throw new Error("Razorpay webhook secret is not configured.");
}

async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(body),
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return expectedSignature === signature;
}

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
      });
    }

    /*
     * IMPORTANT:
     *
     * Read the raw body first.
     * Do NOT call req.json() before signature verification.
     */
    const body = await req.text();

    const signature = req.headers.get("X-Razorpay-Signature");

    if (!signature) {
      return new Response("Missing Razorpay signature", {
        status: 400,
      });
    }

    /*
     * 1. Verify Razorpay webhook signature
     */
    const validSignature = await verifyWebhookSignature(
      body,
      signature,
      RAZORPAY_WEBHOOK_SECRET,
    );

    if (!validSignature) {
      console.error("Invalid Razorpay webhook signature");

      return new Response("Invalid signature", {
        status: 400,
      });
    }

    /*
     * 2. Parse webhook only AFTER signature verification
     */
    let event: any;

    try {
      event = JSON.parse(body);
    } catch (error) {
      console.error("Invalid Razorpay webhook JSON:", error);

      return new Response("Invalid webhook payload", {
        status: 400,
      });
    }

    console.log("Received Razorpay webhook:", event.event);

    /*
     * 3. Handle payment events
     */
    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload?.payment?.entity;

        if (!payment) {
          console.error("payment.captured webhook has no payment entity");

          return new Response("Invalid payment payload", {
            status: 400,
          });
        }

        const razorpayPaymentId = payment.id;
        const razorpayOrderId = payment.order_id;
        const amount = payment.amount;

        if (!razorpayPaymentId || !razorpayOrderId) {
          console.error("payment.captured missing payment/order id");

          return new Response("Invalid payment payload", {
            status: 400,
          });
        }

        /*
         * The RPC performs the actual database update.
         *
         * It should:
         *
         * subscription_payments:
         *   Pending → Captured
         *
         * gym_subscriptions:
         *   Pending/Overdue → Paid
         *
         * gyms:
         *   Pending/Suspended → Active
         */
        const { error } = await ctx.supabaseAdmin.rpc(
          "record_subscription_payment_captured",
          {
            p_gateway_order_id: razorpayOrderId,
            p_gateway_payment_id: razorpayPaymentId,
            p_amount: amount,
          },
        );

        if (error) {
          console.error("Failed to record captured payment:", error);

          return new Response("Failed to process captured payment", {
            status: 500,
          });
        }

        break;
      }

      case "payment.failed": {
        const payment = event.payload?.payment?.entity;

        if (!payment) {
          return new Response("Invalid payment payload", {
            status: 400,
          });
        }

        console.log("Razorpay payment failed:", payment.id, payment.order_id);

        break;
      }

      /*
       * payment.authorized is intentionally not treated as Paid.
       *
       * Authorized ≠ captured.
       */
      case "payment.authorized": {
        console.log("Payment authorized:", event.payload?.payment?.entity?.id);

        break;
      }

      default: {
        /*
         * Other Razorpay events are ignored.
         *
         * This is normal because Razorpay can send many webhook
         * event types.
         */
        console.log("Unhandled Razorpay webhook event:", event.event);

        break;
      }
    }

    /*
     * Razorpay needs a successful response.
     */
    return new Response("ok", {
      status: 200,
    });
  }),
};
