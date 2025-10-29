import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCheckout,
  getCheckoutStatus,
  getCustomerSubscriptions,
  getProduct,
  getSubscription,
  listProducts,
  revokeSubscription,
} from "./payment.service";

// Mock Polar SDK
vi.mock("@polar-sh/sdk", () => {
  return {
    Polar: vi.fn().mockImplementation(() => ({
      checkouts: {
        create: vi.fn(),
        get: vi.fn(),
      },
      products: {
        list: vi.fn(),
        get: vi.fn(),
      },
      subscriptions: {
        list: vi.fn(),
        get: vi.fn(),
        revoke: vi.fn(),
      },
    })),
  };
});

describe("Payment Service", () => {
  let mockPolar: {
    checkouts: {
      create: ReturnType<typeof vi.fn>;
      get: ReturnType<typeof vi.fn>;
    };
    products: {
      list: ReturnType<typeof vi.fn>;
      get: ReturnType<typeof vi.fn>;
    };
    subscriptions: {
      list: ReturnType<typeof vi.fn>;
      get: ReturnType<typeof vi.fn>;
      revoke: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { Polar } = require("@polar-sh/sdk");
    mockPolar = new Polar();
  });

  describe("createCheckout", () => {
    it("should create checkout successfully", async () => {
      mockPolar.checkouts.create.mockResolvedValue({
        id: "checkout-123",
        url: "https://checkout.polar.sh/checkout-123",
        status: "open",
        productPriceId: "price-123",
      });

      const result = await createCheckout({
        productPriceId: "price-123",
        successUrl: "https://example.com/success",
        customerEmail: "test@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.checkoutUrl).toBe("https://checkout.polar.sh/checkout-123");
      expect(result.checkoutId).toBe("checkout-123");
      expect(mockPolar.checkouts.create).toHaveBeenCalledWith({
        productPriceId: "price-123",
        successUrl: "https://example.com/success",
        customerEmail: "test@example.com",
        customerName: undefined,
        customerBillingAddress: undefined,
        metadata: undefined,
      });
    });

    it("should handle checkout with metadata", async () => {
      mockPolar.checkouts.create.mockResolvedValue({
        id: "checkout-123",
        url: "https://checkout.polar.sh/checkout-123",
        status: "open",
        productPriceId: "price-123",
      });

      const result = await createCheckout({
        productPriceId: "price-123",
        successUrl: "https://example.com/success",
        customerEmail: "test@example.com",
        customerName: "John Doe",
        metadata: { userId: "user-456" },
      });

      expect(result.success).toBe(true);
      expect(mockPolar.checkouts.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customerName: "John Doe",
          metadata: { userId: "user-456" },
        }),
      );
    });

    it("should handle errors during checkout creation", async () => {
      mockPolar.checkouts.create.mockRejectedValue(
        new Error("Invalid product price"),
      );

      const result = await createCheckout({
        productPriceId: "invalid-price",
        successUrl: "https://example.com/success",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid product price");
    });
  });

  describe("getCheckoutStatus", () => {
    it("should get checkout status successfully", async () => {
      mockPolar.checkouts.get.mockResolvedValue({
        id: "checkout-123",
        status: "succeeded",
        customerId: "customer-123",
        customerEmail: "test@example.com",
        amount: 1000,
        currency: "usd",
        productPriceId: "price-123",
      });

      const result = await getCheckoutStatus("checkout-123");

      expect(result).toEqual({
        id: "checkout-123",
        status: "succeeded",
        customerId: "customer-123",
        customerEmail: "test@example.com",
        amount: 1000,
        currency: "usd",
        productPriceId: "price-123",
      });
      expect(mockPolar.checkouts.get).toHaveBeenCalledWith({
        id: "checkout-123",
      });
    });

    it("should handle errors when fetching checkout", async () => {
      mockPolar.checkouts.get.mockRejectedValue(
        new Error("Checkout not found"),
      );

      const result = await getCheckoutStatus("invalid-checkout");

      expect(result).toBeNull();
    });
  });

  describe("listProducts", () => {
    it("should list products successfully", async () => {
      const mockProductIterator = (async function* () {
        yield {
          id: "product-1",
          name: "Product 1",
          description: "Description 1",
          prices: [
            {
              id: "price-1",
              priceAmount: 1000,
              priceCurrency: "usd",
              recurringInterval: "month",
            },
          ],
        };
        yield {
          id: "product-2",
          name: "Product 2",
          prices: [
            {
              id: "price-2",
              priceAmount: 2000,
              priceCurrency: "usd",
            },
          ],
        };
      })();

      mockPolar.products.list.mockResolvedValue(mockProductIterator);

      const result = await listProducts("org-123");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "product-1",
        name: "Product 1",
        description: "Description 1",
        prices: [
          {
            id: "price-1",
            amount: 1000,
            currency: "usd",
            recurringInterval: "month",
          },
        ],
      });
      expect(result[1].description).toBeUndefined();
      expect(mockPolar.products.list).toHaveBeenCalledWith({
        organizationId: "org-123",
      });
    });

    it("should handle errors when listing products", async () => {
      mockPolar.products.list.mockRejectedValue(new Error("API error"));

      const result = await listProducts("org-123");

      expect(result).toEqual([]);
    });
  });

  describe("getProduct", () => {
    it("should get product successfully", async () => {
      mockPolar.products.get.mockResolvedValue({
        id: "product-123",
        name: "Test Product",
        description: "Test Description",
        prices: [
          {
            id: "price-123",
            priceAmount: 1500,
            priceCurrency: "usd",
            recurringInterval: "year",
          },
        ],
      });

      const result = await getProduct("product-123");

      expect(result).toEqual({
        id: "product-123",
        name: "Test Product",
        description: "Test Description",
        prices: [
          {
            id: "price-123",
            amount: 1500,
            currency: "usd",
            recurringInterval: "year",
          },
        ],
      });
      expect(mockPolar.products.get).toHaveBeenCalledWith({
        id: "product-123",
      });
    });

    it("should handle errors when fetching product", async () => {
      mockPolar.products.get.mockRejectedValue(new Error("Product not found"));

      const result = await getProduct("invalid-product");

      expect(result).toBeNull();
    });
  });

  describe("getCustomerSubscriptions", () => {
    it("should list subscriptions successfully", async () => {
      const mockSubscriptionIterator = (async function* () {
        yield {
          id: "sub-1",
          status: "active",
          customerId: "customer-123",
        };
        yield {
          id: "sub-2",
          status: "active",
          customerId: "customer-123",
        };
      })();

      mockPolar.subscriptions.list.mockResolvedValue(mockSubscriptionIterator);

      const result = (await getCustomerSubscriptions(
        "org-123",
        "customer-123",
      )) as unknown as Array<{
        id: string;
        status: string;
        customerId: string;
      }>;

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("sub-1");
      expect(result[1].id).toBe("sub-2");
      expect(mockPolar.subscriptions.list).toHaveBeenCalledWith({
        organizationId: "org-123",
        customerId: "customer-123",
      });
    });

    it("should handle errors when listing subscriptions", async () => {
      mockPolar.subscriptions.list.mockRejectedValue(new Error("API error"));

      const result = await getCustomerSubscriptions("org-123");

      expect(result).toEqual([]);
    });
  });

  describe("getSubscription", () => {
    it("should get subscription successfully", async () => {
      mockPolar.subscriptions.get.mockResolvedValue({
        id: "sub-123",
        status: "active",
        customerId: "customer-123",
      });

      const result = await getSubscription("sub-123");

      expect(result).toEqual({
        id: "sub-123",
        status: "active",
        customerId: "customer-123",
      });
      expect(mockPolar.subscriptions.get).toHaveBeenCalledWith({
        id: "sub-123",
      });
    });

    it("should handle errors when fetching subscription", async () => {
      mockPolar.subscriptions.get.mockRejectedValue(
        new Error("Subscription not found"),
      );

      const result = await getSubscription("invalid-sub");

      expect(result).toBeNull();
    });
  });

  describe("revokeSubscription", () => {
    it("should revoke subscription successfully", async () => {
      mockPolar.subscriptions.revoke.mockResolvedValue({
        id: "sub-123",
        status: "canceled",
      });

      const result = await revokeSubscription("sub-123");

      expect(result).toBe(true);
      expect(mockPolar.subscriptions.revoke).toHaveBeenCalledWith({
        id: "sub-123",
      });
    });

    it("should handle errors when revoking subscription", async () => {
      mockPolar.subscriptions.revoke.mockRejectedValue(
        new Error("Revoke failed"),
      );

      const result = await revokeSubscription("sub-123");

      expect(result).toBe(false);
    });
  });
});
