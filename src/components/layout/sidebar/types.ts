import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items?: SidebarItem[];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
  showFooter?: boolean;
}

export interface SidebarItemProps {
  item: SidebarItem;
  collapsed?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}
