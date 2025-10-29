"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/shadcn/ui/button";
import type { IconButtonProps, LoadingButtonProps } from "./types";

/**
 * Loading Button Component
 * Button with loading state and optional icon
 */
export function LoadingButton({
  loading = false,
  loadingText,
  icon,
  iconPosition = "left",
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  const _t = useTranslations("button");

  const isDisabled = disabled || loading;
  const displayText = loading && loadingText ? loadingText : children;

  return (
    <Button disabled={isDisabled} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && icon && iconPosition === "left" && (
        <span className="mr-2">{icon}</span>
      )}
      {displayText}
      {!loading && icon && iconPosition === "right" && (
        <span className="ml-2">{icon}</span>
      )}
    </Button>
  );
}

/**
 * Icon Button Component
 * Button with icon and optional label
 */
export function IconButton({
  icon,
  label,
  showLabel = false,
  ...props
}: IconButtonProps) {
  return (
    <Button {...props}>
      <span className={showLabel ? "mr-2" : ""}>{icon}</span>
      {showLabel && <span>{label}</span>}
      {!showLabel && <span className="sr-only">{label}</span>}
    </Button>
  );
}
