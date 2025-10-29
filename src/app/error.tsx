"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { ErrorDisplay } from "@/components/common/error";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <ErrorDisplay
        type="500"
        onRetry={reset}
        showRetry={true}
        showHome={true}
        showBack={false}
      />
    </div>
  );
}
