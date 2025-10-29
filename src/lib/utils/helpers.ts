/**
 * Utility Helper Functions
 * Common helper functions used throughout the application
 */

let idCounter = 0;

/**
 * Generate a unique ID for React keys
 * Combines timestamp, counter, and random value for uniqueness
 *
 * @param prefix - Optional prefix for the ID
 * @returns A unique string ID
 *
 * @example
 * const id = generateUniqueId('item'); // 'item-1234567890-0-abc123'
 */
export function generateUniqueId(prefix = "id"): string {
  const timestamp = Date.now();
  const counter = idCounter++;
  const random = Math.random().toString(36).substring(2, 9);

  return `${prefix}-${timestamp}-${counter}-${random}`;
}

/**
 * Generate an array of unique IDs
 * Useful for mapping over arrays where you need unique keys
 *
 * @param count - Number of IDs to generate
 * @param prefix - Optional prefix for the IDs
 * @returns Array of unique string IDs
 *
 * @example
 * const ids = generateUniqueIds(5, 'row'); // ['row-...', 'row-...', ...]
 */
export function generateUniqueIds(count: number, prefix = "id"): string[] {
  return Array.from({ length: count }, () => generateUniqueId(prefix));
}

/**
 * Debounce a function call
 * Delays execution until after wait milliseconds have elapsed since the last call
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function call
 * Ensures function is called at most once per specified time period
 *
 * @param func - The function to throttle
 * @param limit - The number of milliseconds to wait before allowing another call
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Sleep for a specified duration
 * Returns a promise that resolves after the specified milliseconds
 *
 * @param ms - Number of milliseconds to sleep
 * @returns Promise that resolves after the delay
 *
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format bytes to human readable string
 *
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Capitalize first letter of a string
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate string to specified length
 *
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated string
 */
export function truncate(str: string, length: number, suffix = "..."): string {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 *
 * @param value - Value to check
 * @returns True if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}
