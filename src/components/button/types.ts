import type { VariantProps } from "class-variance-authority";
import type React from "react";
import type { buttonVariants } from "@/components/shadcn/ui/button";

type ButtonBaseProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export interface LoadingButtonProps extends ButtonBaseProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export interface IconButtonProps extends ButtonBaseProps {
  icon: React.ReactNode;
  label: string;
  showLabel?: boolean;
}
