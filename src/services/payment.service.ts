import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env.POLAR_API_KEY || "",
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

export interface CreateCheckoutOptions {
  productPriceId: string;
  successUrl: string;
  customerEmail?: string;
  customerName?: string;
  customerBillingAddress?: {
    country: string;
  };
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  checkoutId?: string;
  error?: string;
}

export interface CheckoutStatus {
  id: string;
  status: "open" | "confirmed" | "succeeded" | "failed" | "expired";
  customerId?: string;
  customerEmail?: string;
  amount?: number;
  currency?: string;
  productPriceId: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  prices: Price[];
}

export interface Price {
  id: string;
  amount: number;
  currency: string;
  recurringInterval?: "month" | "year";
}

// Polar SDK internal types (not exported by SDK)
interface PolarPrice {
  id: string;
  priceAmount: number;
  priceCurrency: string;
  recurringInterval?: "day" | "week" | "month" | "year";
}

interface PolarProduct {
  id: string;
  name: string;
  description?: string;
  prices?: PolarPrice[];
}

/**
 * Create a checkout session for a product
 */
export async function createCheckout(
  options: CreateCheckoutOptions,
): Promise<CheckoutResult> {
  try {
    const checkout = await polar.checkouts.create({
      productPriceId: options.productPriceId,
      successUrl: options.successUrl,
      customerEmail: options.customerEmail,
      customerName: options.customerName,
      customerBillingAddress: options.customerBillingAddress as Parameters<
        typeof polar.checkouts.create
      >[0]["customerBillingAddress"],
      metadata: options.metadata,
    } as unknown as Parameters<typeof polar.checkouts.create>[0]);

    return {
      success: true,
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    };
  } catch (error) {
    console.error("[Payment Service] Error creating checkout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get checkout status by ID
 */
export async function getCheckoutStatus(
  checkoutId: string,
): Promise<CheckoutStatus | null> {
  try {
    const checkout = await polar.checkouts.get({
      id: checkoutId,
    });

    return {
      id: checkout.id,
      status: checkout.status,
      customerId: checkout.customerId || undefined,
      customerEmail: checkout.customerEmail || undefined,
      amount: checkout.amount || undefined,
      currency: checkout.currency || undefined,
      productPriceId: checkout.productPriceId,
    };
  } catch (error) {
    console.error("[Payment Service] Error fetching checkout:", error);
    return null;
  }
}

/**
 * List all products with their prices
 */
export async function listProducts(organizationId: string): Promise<Product[]> {
  try {
    const result = await polar.products.list({
      organizationId,
    });

    const products: Product[] = [];

    // Type assertion for Polar SDK response - the SDK doesn't expose proper types for iteration
    for await (const product of result as unknown as AsyncIterable<PolarProduct>) {
      const prices: Price[] = (product.prices || []).map((price: PolarPrice) => ({
        id: price.id,
        amount: price.priceAmount,
        currency: price.priceCurrency,
        recurringInterval:
          price.recurringInterval === "day" ||
          price.recurringInterval === "week"
            ? undefined
            : price.recurringInterval,
      }));

      products.push({
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        prices,
      });
    }

    return products;
  } catch (error) {
    console.error("[Payment Service] Error listing products:", error);
    return [];
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const product = (await polar.products.get({
      id: productId,
    })) as unknown as PolarProduct;

    const prices: Price[] = (product.prices || []).map((price: PolarPrice) => ({
      id: price.id,
      amount: price.priceAmount,
      currency: price.priceCurrency,
      recurringInterval:
        price.recurringInterval === "day" || price.recurringInterval === "week"
          ? undefined
          : price.recurringInterval,
    }));

    return {
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      prices,
    };
  } catch (error) {
    console.error("[Payment Service] Error fetching product:", error);
    return null;
  }
}

/**
 * Create a subscription checkout
 * Note: Polar handles both one-time and subscription checkouts the same way
 * The product price determines if it's a subscription (has recurringInterval)
 */
export async function createSubscriptionCheckout(
  options: CreateCheckoutOptions,
): Promise<CheckoutResult> {
  return createCheckout(options);
}

/**
 * Get customer subscriptions
 */
export async function getCustomerSubscriptions(
  organizationId: string,
  customerId?: string,
) {
  try {
    const result = await polar.subscriptions.list({
      organizationId,
      ...(customerId && { customerId }),
    });

    const subscriptions = [];

    for await (const subscription of result) {
      subscriptions.push(subscription);
    }

    return subscriptions;
  } catch (error) {
    console.error("[Payment Service] Error fetching subscriptions:", error);
    return [];
  }
}

/**
 * Revoke (cancel) a subscription
 */
export async function revokeSubscription(
  subscriptionId: string,
): Promise<boolean> {
  try {
    await polar.subscriptions.revoke({
      id: subscriptionId,
    });
    return true;
  } catch (error) {
    console.error("[Payment Service] Error revoking subscription:", error);
    return false;
  }
}

/**
 * Get subscription by ID
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await polar.subscriptions.get({
      id: subscriptionId,
    });
    return subscription;
  } catch (error) {
    console.error("[Payment Service] Error fetching subscription:", error);
    return null;
  }
}

export const paymentService = {
  createCheckout,
  getCheckoutStatus,
  listProducts,
  getProduct,
  createSubscriptionCheckout,
  getCustomerSubscriptions,
  revokeSubscription,
  getSubscription,
};
