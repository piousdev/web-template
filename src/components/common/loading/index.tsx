"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { generateUniqueIds } from "@/lib/utils/helpers";
import type { LoadingProps, LoadingSize, SkeletonProps } from "./types";

const sizeClasses: Record<LoadingSize, string> = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

/**
 * Spinner Loading Component
 */
function SpinnerLoading({
  size = "md",
  className = "",
}: Omit<LoadingProps, "variant">) {
  return (
    <Loader2
      className={`animate-spin text-primary ${sizeClasses[size]} ${className}`}
    />
  );
}

/**
 * Dots Loading Component
 */
function DotsLoading({
  size = "md",
  className = "",
}: Omit<LoadingProps, "variant">) {
  const dotSize =
    size === "sm" ? "h-2 w-2" : size === "lg" ? "h-4 w-4" : "h-3 w-3";

  return (
    <div className={`flex space-x-2 ${className}`}>
      <div
        className={`${dotSize} animate-bounce rounded-full bg-primary [animation-delay:-0.3s]`}
      />
      <div
        className={`${dotSize} animate-bounce rounded-full bg-primary [animation-delay:-0.15s]`}
      />
      <div className={`${dotSize} animate-bounce rounded-full bg-primary`} />
    </div>
  );
}

/**
 * Pulse Loading Component
 */
function PulseLoading({
  size = "md",
  className = "",
}: Omit<LoadingProps, "variant">) {
  return (
    <div
      className={`animate-pulse rounded-full bg-primary ${sizeClasses[size]} ${className}`}
    />
  );
}

/**
 * Main Loading Component
 */
export function Loading({
  size = "md",
  variant = "spinner",
  text,
  fullScreen = false,
  className = "",
}: LoadingProps) {
  const t = useTranslations("loading");

  const loadingText = text || t("default");

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return <DotsLoading size={size} />;
      case "pulse":
        return <PulseLoading size={size} />;
      default:
        return <SpinnerLoading size={size} />;
    }
  };

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      {renderLoader()}
      {text && <p className="text-sm text-muted-foreground">{loadingText}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Skeleton Loading Component
 */
export function Skeleton({
  width,
  height,
  className = "",
  variant = "rectangular",
}: SkeletonProps) {
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div
      className={`animate-pulse bg-muted ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

/**
 * Card Skeleton for loading cards
 */
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-3 rounded-lg border p-6 ${className}`}>
      <Skeleton width="60%" height={24} variant="text" />
      <Skeleton width="100%" height={16} variant="text" />
      <Skeleton width="80%" height={16} variant="text" />
      <div className="pt-4">
        <Skeleton width={100} height={36} variant="rectangular" />
      </div>
    </div>
  );
}

/**
 * Table Skeleton for loading tables
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className = "",
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  // Generate unique IDs for rows and columns
  const rowIds = generateUniqueIds(rows, "table-row");
  const columnIds = generateUniqueIds(columns, "table-col");

  return (
    <div className={`space-y-3 ${className}`}>
      {rowIds.map((rowId) => (
        <div key={rowId} className="flex gap-4">
          {columnIds.map((colId) => (
            <Skeleton
              key={colId}
              width={`${100 / columns}%`}
              height={40}
              variant="rectangular"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
