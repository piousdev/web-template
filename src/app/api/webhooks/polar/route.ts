import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Polar Webhook Handler
 *
 * Handles webhook events from Polar for payment processing
 *
 * Supported events:
 * - checkout.created
 * - checkout.updated
 * - order.created
 * - subscription.created
 * - subscription.updated
 * - subscription.canceled
 *
 * Setup:
 * 1. Set POLAR_WEBHOOK_SECRET in your environment
 * 2. Configure webhook URL in Polar dashboard: https://your-domain.com/api/webhooks/polar
 * 3. Select which events to receive
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const headersList = await headers();
    const signature = headersList.get("webhook-signature");

    if (!signature) {
      console.error("[Polar Webhook] Missing webhook signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Get raw body
    const rawBody = await request.text();
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "[Polar Webhook] Missing POLAR_WEBHOOK_SECRET environment variable",
      );
      Sentry.captureMessage("Missing POLAR_WEBHOOK_SECRET", "error");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    // Verify webhook signature and parse event
    // Let TypeScript infer the event type from validateEvent's return type
    let event: ReturnType<typeof validateEvent>;
    try {
      // Convert headers to plain object
      const headersObj: Record<string, string> = {};
      headersList.forEach((value, key) => {
        headersObj[key] = value;
      });

      event = validateEvent(rawBody, headersObj, webhookSecret);
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        console.error("[Polar Webhook] Invalid signature:", error);
        Sentry.captureException(error, {
          contexts: {
            webhook: {
              hasSecret: !!webhookSecret,
            },
          },
        });
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 403 },
        );
      }
      throw error;
    }

    // Handle different event types
    const eventType = event.type;
    console.log(`[Polar Webhook] Received event: ${eventType}`);

    switch (eventType) {
      case "checkout.created":
        await handleCheckoutCreated(event.data);
        break;

      case "checkout.updated":
        await handleCheckoutUpdated(event.data);
        break;

      case "order.created":
        await handleOrderCreated(event.data);
        break;

      case "subscription.created":
        await handleSubscriptionCreated(event.data);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdated(event.data);
        break;

      case "subscription.canceled":
        await handleSubscriptionCanceled(event.data);
        break;

      default:
        console.log(`[Polar Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Polar Webhook] Error processing webhook:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

/**
 * Handle checkout.created event
 */
async function handleCheckoutCreated(
  data: Extract<
    ReturnType<typeof validateEvent>,
    { type: "checkout.created" }
  >["data"],
) {
  console.log("[Polar Webhook] Checkout created:", data.id);
  // TODO: Implement checkout created logic
  // - Store checkout in database
  // - Send notification to user
}

/**
 * Handle checkout.updated event
 */
async function handleCheckoutUpdated(
  data: Extract<
    ReturnType<typeof validateEvent>,
    { type: "checkout.updated" }
  >["data"],
) {
  console.log(
    "[Polar Webhook] Checkout updated:",
    data.id,
    "Status:",
    data.status,
  );
  // TODO: Implement checkout updated logic
  // - Update checkout status in database
  // - Handle successful payment (status === 'succeeded')
  // - Handle failed payment (status === 'failed')

  if (data.status === "succeeded") {
    console.log("[Polar Webhook] Payment succeeded for checkout:", data.id);
    // Grant access to product/service
    // Send confirmation email
  } else if (data.status === "failed") {
    console.log("[Polar Webhook] Payment failed for checkout:", data.id);
    // Send failure notification
  }
}

/**
 * Handle order.created event
 */
async function handleOrderCreated(
  data: Extract<
    ReturnType<typeof validateEvent>,
    { type: "order.created" }
  >["data"],
) {
  console.log("[Polar Webhook] Order created:", data.id);
  // TODO: Implement order created logic
  // - Store order in database
  // - Send order confirmation email
  // - Update user's purchase history
}

/**
 * Handle subscription.created event
 */
async function handleSubscriptionCreated(
  data: Extract<
    ReturnType<typeof validateEvent>,
    { type: "subscription.created" }
  >["data"],
) {
  console.log("[Polar Webhook] Subscription created:", data.id);
  // TODO: Implement subscription created logic
  // - Store subscription in database
  // - Grant subscription access to user
  // - Send welcome email
}

/**
 * Handle subscription.updated event
 */
async function handleSubscriptionUpdated(
  data: Extract<
    ReturnType<typeof validateEvent>,
    { type: "subscription.updated" }
  >["data"],
) {
  console.log(
    "[Polar Webhook] Subscription updated:",
    data.id,
    "Status:",
    data.status,
  );
  // TODO: Implement subscription updated logic
  // - Update subscription status in database
  // - Handle status changes (active, paused, etc.)
}

/**
 * Handle subscription.canceled event
 */
async function handleSubscriptionCanceled(
  data: Extract<
    ReturnType<typeof validateEvent>,
    { type: "subscription.canceled" }
  >["data"],
) {
  console.log("[Polar Webhook] Subscription canceled:", data.id);
  // TODO: Implement subscription canceled logic
  // - Update subscription status in database
  // - Revoke subscription access
  // - Send cancellation confirmation email
}
