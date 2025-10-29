/**
 * Custom Hooks
 *
 * Central export for all custom React hooks used throughout the application.
 */

export type { SignInCredentials, SignUpCredentials } from "./use-auth";
export { useAuth } from "./use-auth";

export {
  formatCurrency,
  formatDate,
  formatNumber,
  getBrowserLocale,
  useLocale,
} from "./use-locale";
// Re-export existing hooks
export { useIsMobile } from "./use-mobile";
export type { UseSocketOptions } from "./use-socket";
export { useSocket } from "./use-socket";
