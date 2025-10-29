export type LoadingSize = "sm" | "md" | "lg";
export type LoadingVariant = "spinner" | "dots" | "pulse" | "skeleton";

export interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}
