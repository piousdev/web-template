import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client for serverless environments
export const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
});

// Cache helpers with TTL support
export const cache = {
  /**
   * Set a value in cache with optional TTL (in seconds)
   * @param key Cache key
   * @param value Value to cache (will be JSON stringified)
   * @param ttl Time to live in seconds (default: 1 hour)
   */
  set: async <T>(key: string, value: T, ttl: number = 3600): Promise<void> => {
    await redis.setex(key, ttl, JSON.stringify(value));
  },

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Parsed value or null if not found
   */
  get: async <T>(key: string): Promise<T | null> => {
    const value = await redis.get<string>(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  },

  /**
   * Delete a key from cache
   * @param key Cache key
   */
  delete: async (key: string): Promise<void> => {
    await redis.del(key);
  },

  /**
   * Delete multiple keys matching a pattern
   * @param pattern Pattern to match (e.g., "user:*")
   */
  deletePattern: async (pattern: string): Promise<void> => {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  /**
   * Check if a key exists
   * @param key Cache key
   */
  exists: async (key: string): Promise<boolean> => {
    const result = await redis.exists(key);
    return result === 1;
  },
};

// Rate limiting helper for API endpoints
export const rateLimit = {
  /**
   * Check if a request should be rate limited
   * @param identifier Unique identifier (e.g., user ID, IP address)
   * @param limit Maximum number of requests
   * @param window Time window in seconds
   * @returns { allowed: boolean, remaining: number, reset: number }
   */
  check: async (
    identifier: string,
    limit: number,
    window: number,
  ): Promise<{ allowed: boolean; remaining: number; reset: number }> => {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - window * 1000;

    // Use sorted set to track requests with timestamps
    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcard(key);

    if (count >= limit) {
      const oldest = await redis.zrange(key, 0, 0, { withScores: true });
      const resetTime =
        oldest[0] && typeof oldest[0] === "object" && "score" in oldest[0]
          ? Number((oldest[0] as { member: string; score: number }).score) +
            window * 1000
          : now + window * 1000;
      return {
        allowed: false,
        remaining: 0,
        reset: Math.ceil((resetTime - now) / 1000),
      };
    }

    // Add current request
    await redis.zadd(key, { score: now, member: `${now}` });
    await redis.expire(key, window);

    return {
      allowed: true,
      remaining: limit - count - 1,
      reset: window,
    };
  },
};
