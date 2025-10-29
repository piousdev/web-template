"use client";

import { Activity, DollarSign, ShoppingCart, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { BasicCard, StatCard } from "@/components/card";
import { Button } from "@/components/shadcn/ui/button";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  // Mock data - will be replaced with real data
  const stats = [
    {
      title: t("stats.users.title"),
      value: "2,543",
      change: 12.5,
      changeLabel: t("stats.users.change"),
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: t("stats.revenue.title"),
      value: "$45,231",
      change: 8.2,
      changeLabel: t("stats.revenue.change"),
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: t("stats.sales.title"),
      value: "+573",
      change: 4.3,
      changeLabel: t("stats.sales.change"),
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      title: t("stats.active.title"),
      value: "189",
      change: -2.1,
      changeLabel: t("stats.active.change"),
      icon: <Activity className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("welcome")}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-8">
        <div className="container">
          {/* Overview Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {t("overview.title")}
            </h2>
            <p className="text-muted-foreground">{t("overview.description")}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                changeLabel={stat.changeLabel}
                icon={stat.icon}
              />
            ))}
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Recent Activity */}
            <BasicCard
              title={t("recentActivity.title")}
              description={t("recentActivity.description")}
            >
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("recentActivity.empty")}
                </p>
              </div>
            </BasicCard>

            {/* Quick Actions */}
            <BasicCard
              title={t("quickActions.title")}
              description="Common actions and shortcuts"
            >
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                >
                  <span className="font-semibold">
                    {t("quickActions.newProject")}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                >
                  <span className="font-semibold">
                    {t("quickActions.invite")}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                >
                  <span className="font-semibold">
                    {t("quickActions.settings")}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                >
                  <span className="font-semibold">
                    {t("quickActions.support")}
                  </span>
                </Button>
              </div>
            </BasicCard>
          </div>
        </div>
      </div>
    </div>
  );
}
