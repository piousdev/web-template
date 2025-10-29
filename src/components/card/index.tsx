"use client";

import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import type {
  BaseCardProps,
  FeatureCardProps,
  ProductCardProps,
  StatCardProps,
} from "./types";

/**
 * Basic Card Component
 * General purpose card with title, description, and optional footer
 */
export function BasicCard({
  title,
  description,
  image,
  imageAlt,
  footer,
  className = "",
  children,
}: BaseCardProps) {
  return (
    <Card className={className}>
      {image && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            src={image}
            alt={imageAlt || title || "Card image"}
            fill
            className="object-cover"
          />
        </div>
      )}
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      {children && <CardContent>{children}</CardContent>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

/**
 * Feature Card Component
 * Card with icon, title, description, and optional link
 */
export function FeatureCard({
  icon,
  title,
  description,
  href,
  className = "",
  children,
}: FeatureCardProps) {
  const _t = useTranslations("card");

  return href ? (
    <Link href={href} className="group block transition-all hover:shadow-lg">
      <Card className={`h-full transition-colors ${className}`}>
        <CardHeader>
          {icon && <div className="mb-4 text-primary">{icon}</div>}
          {title && (
            <CardTitle className="flex items-center justify-between">
              {title}
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </CardTitle>
          )}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        {children && <CardContent>{children}</CardContent>}
      </Card>
    </Link>
  ) : (
    <Card className={`h-full transition-colors ${className}`}>
      <CardHeader>
        {icon && <div className="mb-4 text-primary">{icon}</div>}
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}

/**
 * Stat Card Component
 * Card for displaying statistics with optional trend indicator
 */
export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  className = "",
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isPositive && <TrendingUp className="h-3 w-3 text-green-500" />}
            {isNegative && <TrendingDown className="h-3 w-3 text-red-500" />}
            <span
              className={
                isPositive ? "text-green-500" : isNegative ? "text-red-500" : ""
              }
            >
              {change > 0 ? "+" : ""}
              {change}%
            </span>
            {changeLabel && <span>{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Product Card Component
 * Card for displaying products with price, badge, and action button
 */
export function ProductCard({
  title,
  description,
  image,
  imageAlt,
  price,
  badge,
  onAction,
  actionLabel,
  className = "",
  children,
}: ProductCardProps) {
  const t = useTranslations("card");

  return (
    <Card className={`flex h-full flex-col ${className}`}>
      {image && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            src={image}
            alt={imageAlt || title || "Product image"}
            fill
            className="object-cover"
          />
          {badge && (
            <div className="absolute right-2 top-2">
              <Badge>{badge}</Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{title}</CardTitle>
          {price && <span className="text-lg font-bold">${price}</span>}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent className="flex-1">{children}</CardContent>}
      {(onAction || actionLabel) && (
        <CardFooter>
          <Button onClick={onAction} className="w-full">
            {actionLabel || t("viewDetails")}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
