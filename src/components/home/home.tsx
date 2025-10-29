"use client";

import {
  Activity,
  CreditCard,
  Database,
  FolderOpen,
  Lock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FeatureCard } from "@/components/card";
import { Button } from "@/components/shadcn/ui/button";

/**
 * Home Page Component
 * Landing page with hero section, features, and CTA
 */
export function HomePage() {
  const t = useTranslations("home");

  const features = [
    {
      icon: <Lock className="h-10 w-10" />,
      title: t("features.authentication.title"),
      description: t("features.authentication.description"),
    },
    {
      icon: <CreditCard className="h-10 w-10" />,
      title: t("features.payments.title"),
      description: t("features.payments.description"),
    },
    {
      icon: <Database className="h-10 w-10" />,
      title: t("features.database.title"),
      description: t("features.database.description"),
    },
    {
      icon: <FolderOpen className="h-10 w-10" />,
      title: t("features.storage.title"),
      description: t("features.storage.description"),
    },
    {
      icon: <Mail className="h-10 w-10" />,
      title: t("features.email.title"),
      description: t("features.email.description"),
    },
    {
      icon: <Activity className="h-10 w-10" />,
      title: t("features.monitoring.title"),
      description: t("features.monitoring.description"),
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container flex min-h-[600px] flex-col items-center justify-center py-20 text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {t("hero.title")}
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {t("hero.subtitle")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">{t("hero.cta.primary")}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/docs">{t("hero.cta.secondary")}</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("features.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              {t("cta.subtitle")}
            </p>
            <Button size="lg" asChild>
              <Link href="/register">{t("cta.button")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
