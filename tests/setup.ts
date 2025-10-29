import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with React Testing Library matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock environment variables for tests
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Map()),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Global test utilities
export const testUtils = {
  /**
   * Wait for a specific amount of time
   */
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Create a mock file for upload testing
   */
  createMockFile: (
    name: string,
    size: number,
    type: string,
  ): File => {
    const blob = new Blob(['a'.repeat(size)], { type });
    return new File([blob], name, { type });
  },

  /**
   * Create mock form data
   */
  createMockFormData: (data: Record<string, string | File>): FormData => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  },

  /**
   * Mock successful fetch response
   */
  mockFetchSuccess: <T>(data: T, status = 200) => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data),
      headers: new Headers(),
    } as Response);
  },

  /**
   * Mock failed fetch response
   */
  mockFetchError: (message: string, status = 500) => {
    return Promise.resolve({
      ok: false,
      status,
      json: async () => ({ error: message }),
      text: async () => message,
      headers: new Headers(),
    } as Response);
  },

  /**
   * Mock localStorage
   */
  mockLocalStorage: () => {
    const store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((index: number) => Object.keys(store)[index] || null),
    };
  },

  /**
   * Mock sessionStorage
   */
  mockSessionStorage: () => testUtils.mockLocalStorage(),

  /**
   * Create mock user object
   */
  createMockUser: (overrides?: Partial<{
    id: string;
    email: string;
    name: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>) => ({
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    emailVerified: false,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  }),

  /**
   * Create mock session object
   */
  createMockSession: (overrides?: Partial<{
    id: string;
    userId: string;
    expiresAt: Date;
  }>) => ({
    id: 'session-1',
    userId: 'user-1',
    expiresAt: new Date('2025-12-31'),
    ...overrides,
  }),

  /**
   * Create mock auth result
   */
  createMockAuthResult: (success = true, overrides?: Partial<{
    session: any;
    user: any;
    error?: string;
  }>) => ({
    success,
    session: success ? testUtils.createMockSession() : null,
    user: success ? testUtils.createMockUser() : null,
    error: success ? undefined : 'Authentication failed',
    ...overrides,
  }),

  /**
   * Create mock action result
   */
  createMockActionResult: <T>(success = true, data?: T, error?: string) => ({
    success,
    data: success ? data : undefined,
    error: success ? undefined : (error || 'Action failed'),
  }),
};

// Make test utils available globally
(global as any).testUtils = testUtils;

// Suppress console errors in tests (optional - comment out if you want to see them)
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
