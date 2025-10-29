"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { ErrorDisplay } from "@/components/common/error";
import { routing } from "@/i18n/routing";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // Global error renders outside normal app context, use default locale
  const locale = routing.defaultLocale;

  return (
    <html lang={locale}>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <ErrorDisplay
            type="500"
            showRetry={true}
            showHome={true}
            showBack={false}
          />
        </div>
      </body>
    </html>
  );
}
