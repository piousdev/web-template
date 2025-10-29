"use client";

import {
  BarChart3,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import { cn } from "@/lib/utils";
import type { SidebarItem, SidebarItemProps, SidebarProps } from "./types";

/**
 * Single Sidebar Item Component
 */
function SidebarItemComponent({
  item,
  collapsed = false,
  isActive = false,
  onClick,
}: SidebarItemProps) {
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed && item.label) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

/**
 * Main Sidebar Component
 */
export function Sidebar({
  items,
  collapsed: controlledCollapsed,
  onCollapse,
  className = "",
  showFooter = true,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const t = useTranslations("sidebar");
  const pathname = usePathname();

  const collapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    if (onCollapse) {
      onCollapse(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
  };

  // Default sidebar items if none provided
  const defaultItems: SidebarItem[] = [
    {
      label: t("menu.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t("menu.analytics"),
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      label: t("menu.projects"),
      href: "/dashboard/projects",
      icon: FolderKanban,
      badge: "12",
    },
    {
      label: t("menu.tasks"),
      href: "/dashboard/tasks",
      icon: CheckSquare,
      badge: 5,
    },
    {
      label: t("menu.team"),
      href: "/dashboard/team",
      icon: Users,
    },
    {
      label: t("menu.settings"),
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      label: t("menu.help"),
      href: "/dashboard/help",
      icon: HelpCircle,
    },
  ];

  const sidebarItems = items && items.length > 0 ? items : defaultItems;

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <h2 className="text-lg font-semibold">{t("navigation")}</h2>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarItemComponent
                key={item.href}
                item={item}
                collapsed={collapsed}
                isActive={isActive}
              />
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {showFooter && !collapsed && (
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            <p>{t("footer.version")} 1.0.0</p>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleCollapse}
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-background shadow-md"
        aria-label={collapsed ? t("toggle.expand") : t("toggle.collapse")}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </aside>
  );
}
