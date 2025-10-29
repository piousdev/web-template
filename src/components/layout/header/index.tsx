"use client";

import { Menu, Monitor, Moon, Search, Sun, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/ui/avatar";
import { Button } from "@/components/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import { Input } from "@/components/shadcn/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/shadcn/ui/sheet";
import type { HeaderProps, UserMenuProps } from "./types";

/**
 * Theme Toggle Component
 */
function ThemeToggle() {
  const { setTheme } = useTheme();
  const t = useTranslations("header.theme");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * User Menu Component
 */
function UserMenu({ user, onSignOut }: UserMenuProps) {
  const t = useTranslations("header.user");

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">{t("signIn")}</Link>
        </Button>
        <Button asChild>
          <Link href="/register">{t("signUp")}</Link>
        </Button>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <User className="mr-2 h-4 w-4" />
            {t("profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">{t("settings")}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>{t("signOut")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Main Header Component
 */
export function Header({
  showAuth = true,
  showThemeToggle = true,
  showSearch = false,
  navItems = [],
  className = "",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("header");
  const pathname = usePathname();

  // Default nav items if none provided
  const defaultNavItems = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.dashboard"), href: "/dashboard" },
    { label: t("nav.features"), href: "/features" },
    { label: t("nav.pricing"), href: "/pricing" },
  ];

  const items = navItems.length > 0 ? navItems : defaultNavItems;

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}
    >
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">Logo</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Search */}
          {showSearch && (
            <div className="hidden w-full max-w-sm items-center md:flex">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("search.placeholder")}
                  className="pl-8"
                />
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          {showThemeToggle && <ThemeToggle />}

          {/* Auth Section */}
          {showAuth && (
            <div className="hidden md:block">
              <UserMenu user={undefined} />
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("menu.open")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {showAuth && (
                  <>
                    <div className="my-2 border-t" />
                    <Button variant="outline" asChild>
                      <Link href="/login">{t("user.signIn")}</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">{t("user.signUp")}</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
