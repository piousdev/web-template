export type ErrorType =
  | "404"
  | "500"
  | "403"
  | "401"
  | "maintenance"
  | "general";

export interface ErrorDisplayProps {
  type?: ErrorType;
  title?: string;
  description?: string;
  showRetry?: boolean;
  showHome?: boolean;
  showBack?: boolean;
  onRetry?: () => void;
  className?: string;
}
