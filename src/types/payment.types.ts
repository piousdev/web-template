/**
 * Payment TypeScript Types (Polar)
 * Types related to payments, subscriptions, and billing with Polar
 *
 * Note: Request types are mutable (user input), response/entity types are readonly (immutable data)
 */

import type { ActionResult, ID, Timestamps } from "./common.types";

/**
 * Currency codes (ISO 4217)
 */
export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY" | "CNY";

/**
 * Money amount with currency (readonly)
 */
export type Money = {
  readonly amount: number;
  readonly currency: Currency;
};

/**
 * Payment status
 */
export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "refunded";

/**
 * Subscription status
 */
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused"
  | "incomplete"
  | "incomplete_expired";

/**
 * Billing interval
 */
export type BillingInterval = "day" | "week" | "month" | "year";

/**
 * Price type
 */
export type PriceType = "one_time" | "recurring";

/**
 * Polar product (readonly - entity data)
 */
export type Product = Readonly<
  {
    id: ID;
    name: string;
    description?: string;
    images?: readonly string[];
    isRecurring: boolean;
    metadata?: Readonly<Record<string, string>>;
  } & Timestamps
>;

/**
 * Polar price (readonly - entity data)
 */
export type Price = Readonly<
  {
    id: ID;
    productId: ID;
    type: PriceType;
    amount: number;
    currency: Currency;
    interval?: BillingInterval;
    intervalCount?: number;
    trialPeriodDays?: number;
    metadata?: Readonly<Record<string, string>>;
  } & Timestamps
>;

/**
 * Product with prices (readonly)
 */
export type ProductWithPrices = Readonly<
  Product & {
    prices: readonly Price[];
  }
>;

/**
 * Polar checkout session (readonly - entity data)
 */
export type CheckoutSession = Readonly<
  {
    id: ID;
    url: string;
    status: "open" | "completed" | "expired";
    customerId?: ID;
    successUrl?: string;
    cancelUrl?: string;
    expiresAt: Date;
    metadata?: Readonly<Record<string, string>>;
  } & Timestamps
>;

/**
 * Create checkout session request (mutable - request data)
 */
export type CreateCheckoutSessionRequest = {
  priceId: ID;
  quantity?: number;
  successUrl: string;
  cancelUrl: string;
  customerId?: ID;
  customerEmail?: string;
  allowPromotionCodes?: boolean;
  metadata?: Record<string, string>;
};

/**
 * Polar customer (readonly - entity data)
 */
export type Customer = Readonly<
  {
    id: ID;
    userId?: ID;
    email: string;
    name?: string;
    phone?: string;
    address?: {
      readonly line1?: string;
      readonly line2?: string;
      readonly city?: string;
      readonly state?: string;
      readonly postalCode?: string;
      readonly country?: string;
    };
    metadata?: Readonly<Record<string, string>>;
  } & Timestamps
>;

/**
 * Polar subscription (readonly - entity data)
 */
export type Subscription = Readonly<
  {
    id: ID;
    customerId: ID;
    productId: ID;
    priceId: ID;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    canceledAt?: Date;
    cancelReason?: string;
    trialStart?: Date;
    trialEnd?: Date;
    metadata?: Readonly<Record<string, string>>;
  } & Timestamps
>;

/**
 * Subscription with details (readonly)
 */
export type SubscriptionWithDetails = Readonly<
  Subscription & {
    product: Product;
    price: Price;
    customer: Customer;
  }
>;

/**
 * Payment method type
 */
export type PaymentMethodType =
  | "card"
  | "bank_account"
  | "paypal"
  | "apple_pay"
  | "google_pay";

/**
 * Payment method (readonly - entity data)
 */
export type PaymentMethod = Readonly<
  {
    id: ID;
    customerId: ID;
    type: PaymentMethodType;
    isDefault: boolean;
    card?: {
      readonly brand: string;
      readonly last4: string;
      readonly expMonth: number;
      readonly expYear: number;
    };
    metadata?: Readonly<Record<string, string>>;
  } & Timestamps
>;

/**
 * Polar payment/order (readonly - entity data)
 */
export type Payment = Readonly<
  {
    id: ID;
    customerId: ID;
    amount: number;
    currency: Currency;
    status: PaymentStatus;
    paymentMethodId?: ID;
    subscriptionId?: ID;
    invoiceId?: ID;
    description?: string;
    receiptUrl?: string;
    metadata?: Readonly<Record<string, string>>;
  } & Timestamps
>;

/**
 * Invoice line item (readonly)
 */
export type InvoiceLineItem = {
  readonly id: ID;
  readonly description: string;
  readonly quantity: number;
  readonly amount: number;
  readonly currency: Currency;
  readonly priceId?: ID;
  readonly metadata?: Readonly<Record<string, string>>;
};

/**
 * Invoice (readonly - entity data)
 */
export type Invoice = Readonly<
  {
    id: ID;
    customerId: ID;
    subscriptionId?: ID;
    number: string;
    status: "draft" | "open" | "paid" | "void" | "uncollectible";
    amountDue: number;
    amountPaid: number;
    currency: Currency;
    dueDate?: Date;
    paidAt?: Date;
    hostedInvoiceUrl?: string;
    invoicePdfUrl?: string;
    lines: readonly InvoiceLineItem[];
    metadata?: Readonly<Record<string, string>>;
  } & Timestamps
>;

/**
 * Refund (readonly - entity data)
 */
export type Refund = Readonly<
  {
    id: ID;
    paymentId: ID;
    amount: number;
    currency: Currency;
    reason?: "duplicate" | "fraudulent" | "requested_by_customer" | "other";
    status: "pending" | "succeeded" | "failed" | "cancelled";
    metadata?: Readonly<Record<string, string>>;
  } & Timestamps
>;

/**
 * Create refund request (mutable - request data)
 */
export type CreateRefundRequest = {
  paymentId: ID;
  amount?: number;
  reason?: Refund["reason"];
  metadata?: Record<string, string>;
};

/**
 * Polar webhook event types
 */
export type PolarWebhookEvent =
  | "checkout.session.completed"
  | "payment.succeeded"
  | "payment.failed"
  | "subscription.created"
  | "subscription.updated"
  | "subscription.deleted"
  | "subscription.trial_will_end"
  | "customer.created"
  | "customer.updated"
  | "customer.deleted"
  | "invoice.paid"
  | "invoice.payment_failed";

/**
 * Polar webhook payload (readonly)
 */
export type PolarWebhookPayload<T = unknown> = {
  readonly id: ID;
  readonly type: PolarWebhookEvent;
  readonly data: T;
  readonly createdAt: Date;
};

/**
 * Subscription change request (mutable - request data)
 */
export type SubscriptionChangeRequest = {
  subscriptionId: ID;
  newPriceId?: ID;
  quantity?: number;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, string>;
};

/**
 * Cancel subscription request (mutable - request data)
 */
export type CancelSubscriptionRequest = {
  subscriptionId: ID;
  cancelAtPeriodEnd?: boolean;
  reason?: string;
};

/**
 * Usage record (readonly - entity data)
 */
export type UsageRecord = Readonly<{
  id: ID;
  subscriptionId: ID;
  quantity: number;
  timestamp: Date;
  action?: string;
  metadata?: Readonly<Record<string, string>>;
}>;

/**
 * Discount/coupon (readonly - entity data)
 */
export type Discount = Readonly<
  {
    id: ID;
    code: string;
    name?: string;
    percentOff?: number;
    amountOff?: number;
    currency?: Currency;
    duration: "once" | "forever" | "repeating";
    durationInMonths?: number;
    maxRedemptions?: number;
    timesRedeemed: number;
    validFrom?: Date;
    validUntil?: Date;
    active: boolean;
    metadata?: Readonly<Record<string, string>>;
  } & Timestamps
>;

/**
 * Apply discount request (mutable - request data)
 */
export type ApplyDiscountRequest = {
  code: string;
  customerId?: ID;
};

/**
 * Payment intent (readonly - entity data)
 */
export type PaymentIntent = Readonly<
  {
    id: ID;
    amount: number;
    currency: Currency;
    status: PaymentStatus;
    customerId?: ID;
    paymentMethodId?: ID;
    clientSecret: string;
    metadata?: Readonly<Record<string, string>>;
  } & Timestamps
>;

/**
 * Billing portal session (readonly - entity data)
 */
export type BillingPortalSession = Readonly<
  {
    id: ID;
    customerId: ID;
    url: string;
    returnUrl?: string;
    expiresAt: Date;
  } & Timestamps
>;

/**
 * Create billing portal session request (mutable - request data)
 */
export type CreateBillingPortalSessionRequest = {
  customerId: ID;
  returnUrl: string;
};

/**
 * Payment action results (readonly - response data)
 */
export type CreateCheckoutSessionResult = ActionResult<CheckoutSession>;
export type CreateSubscriptionResult = ActionResult<Subscription>;
export type CancelSubscriptionResult = ActionResult<Subscription>;
export type CreateRefundResult = ActionResult<Refund>;
export type GetSubscriptionResult = ActionResult<SubscriptionWithDetails>;
export type GetPaymentsResult = ActionResult<readonly Payment[]>;
export type GetInvoicesResult = ActionResult<readonly Invoice[]>;
export type CreateBillingPortalSessionResult =
  ActionResult<BillingPortalSession>;
export type ApplyDiscountResult = ActionResult<{
  readonly success: boolean;
  readonly discount: Discount;
}>;

/**
 * Payment statistics (readonly)
 */
export type PaymentStats = {
  readonly totalRevenue: Money;
  readonly monthlyRevenue: Money;
  readonly activeSubscriptions: number;
  readonly totalCustomers: number;
  readonly churnRate: number;
  readonly averageRevenuePerUser: Money;
};

/**
 * Subscription plan (readonly - application-level entity)
 */
export type SubscriptionPlan = Readonly<
  {
    id: ID;
    name: string;
    description: string;
    priceId: ID;
    features: readonly string[];
    popular?: boolean;
    order?: number;
  } & Timestamps
>;
