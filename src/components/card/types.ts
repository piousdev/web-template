import type { ReactNode } from "react";

export interface BaseCardProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export interface FeatureCardProps extends BaseCardProps {
  icon?: ReactNode;
  href?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export interface ProductCardProps extends BaseCardProps {
  price?: string | number;
  badge?: string;
  onAction?: () => void;
  actionLabel?: string;
}
