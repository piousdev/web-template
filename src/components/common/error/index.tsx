"use client";

import {
  AlertCircle,
  FileQuestion,
  Lock,
  ServerCrash,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/shadcn/ui/alert";
import { Button } from "@/components/shadcn/ui/button";
import type { ErrorDisplayProps, ErrorType } from "./types";

const errorIcons: Record<
  ErrorType,
  React.ComponentType<{ className?: string }>
> = {
  "404": FileQuestion,
  "500": ServerCrash,
  "403": ShieldAlert,
  "401": Lock,
  maintenance: Wrench,
  general: AlertCircle,
};

export function ErrorDisplay({
  type = "general",
  title,
  description,
  showRetry = true,
  showHome = true,
  showBack = false,
  onRetry,
  className = "",
}: ErrorDisplayProps) {
  const t = useTranslations("error");
  const router = useRouter();

  const Icon = errorIcons[type];

  const errorTitle =
    title || (type !== "general" ? t(`${type}.title`) : t("title"));
  const errorDescription =
    description ||
    (type !== "general" ? t(`${type}.description`) : t("description"));

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.refresh();
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push("/");
  };

  return (
    <div
      className={`flex min-h-[400px] w-full flex-col items-center justify-center px-4 py-12 ${className}`}
    >
      <Alert className="max-w-2xl border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
        <Icon className="h-6 w-6" />
        <AlertTitle className="mb-2 text-2xl font-bold">
          {errorTitle}
        </AlertTitle>
        <AlertDescription className="text-base text-muted-foreground">
          {errorDescription}
        </AlertDescription>
      </Alert>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {showRetry && (
          <Button onClick={handleRetry} variant="default">
            {t("button.retry")}
          </Button>
        )}
        {showBack && (
          <Button onClick={handleBack} variant="outline">
            {t("button.back")}
          </Button>
        )}
        {showHome && (
          <Button onClick={handleHome} variant="outline">
            {t("button.home")}
          </Button>
        )}
      </div>
    </div>
  );
}
