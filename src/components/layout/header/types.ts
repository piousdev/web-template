export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface HeaderProps {
  showAuth?: boolean;
  showThemeToggle?: boolean;
  showSearch?: boolean;
  navItems?: NavItem[];
  className?: string;
}

export interface UserMenuProps {
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  onSignOut?: () => void;
}
