import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "./index";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "nav.home": "Home",
      "nav.dashboard": "Dashboard",
      "nav.features": "Features",
      "nav.pricing": "Pricing",
      "user.signIn": "Sign In",
      "user.signUp": "Sign Up",
      "user.profile": "Profile",
      "user.settings": "Settings",
      "user.signOut": "Sign Out",
      "theme.light": "Light Mode",
      "theme.dark": "Dark Mode",
      "theme.system": "System",
      "menu.open": "Open menu",
      "search.placeholder": "Search...",
    };
    return translations[key] || key;
  },
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

// Mock next/navigation
const mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render header with logo", () => {
      render(<Header />);

      expect(screen.getByText("Logo")).toBeInTheDocument();
    });

    it("should render default navigation items", () => {
      render(<Header />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Features")).toBeInTheDocument();
      expect(screen.getByText("Pricing")).toBeInTheDocument();
    });

    it("should render custom navigation items", () => {
      const customNavItems = [
        { label: "Custom 1", href: "/custom1" },
        { label: "Custom 2", href: "/custom2" },
      ];

      render(<Header navItems={customNavItems} />);

      expect(screen.getByText("Custom 1")).toBeInTheDocument();
      expect(screen.getByText("Custom 2")).toBeInTheDocument();
      expect(screen.queryByText("Features")).not.toBeInTheDocument();
    });
  });

  describe("Authentication Section", () => {
    it("should show auth buttons when showAuth is true", () => {
      render(<Header showAuth={true} />);

      // In mobile view, auth buttons are in the sheet
      // In desktop view, they're in the UserMenu
      const signInButtons = screen.getAllByText("Sign In");
      expect(signInButtons.length).toBeGreaterThan(0);
    });

    it("should hide auth section when showAuth is false", () => {
      render(<Header showAuth={false} />);

      const signInButtons = screen.queryAllByText("Sign In");
      expect(signInButtons.length).toBe(0);
    });
  });

  describe("Theme Toggle", () => {
    it("should show theme toggle when showThemeToggle is true", () => {
      const { container } = render(<Header showThemeToggle={true} />);

      const themeButton = container.querySelector('[class*="sr-only"]');
      expect(themeButton?.textContent).toBe("Toggle theme");
    });

    it("should hide theme toggle when showThemeToggle is false", () => {
      const { container } = render(<Header showThemeToggle={false} />);

      const themeButton = container.querySelector('[class*="sr-only"]');
      expect(themeButton).not.toBeInTheDocument();
    });
  });

  describe("Search", () => {
    it("should show search when showSearch is true", () => {
      render(<Header showSearch={true} />);

      const searchInput = screen.getByPlaceholderText("Search...");
      expect(searchInput).toBeInTheDocument();
    });

    it("should hide search when showSearch is false", () => {
      render(<Header showSearch={false} />);

      const searchInput = screen.queryByPlaceholderText("Search...");
      expect(searchInput).not.toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(<Header className="custom-header" />);

      expect(container.firstChild?.firstChild).toHaveClass("custom-header");
    });
  });

  describe("Mobile Menu", () => {
    it("should have mobile menu button", () => {
      render(<Header />);

      const menuButton = screen.getByText("Open menu");
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("should have correct href attributes", () => {
      const { container } = render(<Header />);

      const homeLink = container.querySelector('a[href="/"]');
      const dashboardLink = container.querySelector('a[href="/dashboard"]');

      expect(homeLink).toBeInTheDocument();
      expect(dashboardLink).toBeInTheDocument();
    });
  });
});
