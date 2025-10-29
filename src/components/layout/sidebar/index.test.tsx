import { fireEvent, render, screen } from "@testing-library/react";
import { LayoutDashboard, Settings } from "lucide-react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./index";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      navigation: "Navigation",
      "menu.dashboard": "Dashboard",
      "menu.analytics": "Analytics",
      "menu.projects": "Projects",
      "menu.tasks": "Tasks",
      "menu.team": "Team",
      "menu.settings": "Settings",
      "menu.help": "Help & Support",
      "toggle.expand": "Expand sidebar",
      "toggle.collapse": "Collapse sidebar",
      "footer.version": "Version",
    };
    return translations[key] || key;
  },
}));

// Mock next/navigation
const mockPathname = "/dashboard";
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

// Mock lib/utils
vi.mock("@/lib/utils", () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(" "),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render sidebar with navigation title", () => {
      render(<Sidebar />);

      expect(screen.getByText("Navigation")).toBeInTheDocument();
    });

    it("should render default menu items", () => {
      render(<Sidebar />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Analytics")).toBeInTheDocument();
      expect(screen.getByText("Projects")).toBeInTheDocument();
      expect(screen.getByText("Tasks")).toBeInTheDocument();
      expect(screen.getByText("Team")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Help & Support")).toBeInTheDocument();
    });

    it("should render custom menu items", () => {
      const customItems = [
        {
          label: "Custom Item 1",
          href: "/custom1",
          icon: LayoutDashboard,
        },
        {
          label: "Custom Item 2",
          href: "/custom2",
          icon: Settings,
        },
      ];

      render(<Sidebar items={customItems} />);

      expect(screen.getByText("Custom Item 1")).toBeInTheDocument();
      expect(screen.getByText("Custom Item 2")).toBeInTheDocument();
      expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
    });
  });

  describe("Badges", () => {
    it("should render badges on items", () => {
      render(<Sidebar />);

      // Projects has badge "12"
      expect(screen.getByText("12")).toBeInTheDocument();
      // Tasks has badge 5
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("should show footer when showFooter is true", () => {
      render(<Sidebar showFooter={true} />);

      expect(screen.getByText("Version 1.0.0")).toBeInTheDocument();
    });

    it("should hide footer when showFooter is false", () => {
      render(<Sidebar showFooter={false} />);

      expect(screen.queryByText("Version 1.0.0")).not.toBeInTheDocument();
    });
  });

  describe("Collapse/Expand", () => {
    it("should render collapse toggle button", () => {
      render(<Sidebar />);

      const toggleButton = screen.getByLabelText("Collapse sidebar");
      expect(toggleButton).toBeInTheDocument();
    });

    it("should toggle internal collapsed state when button clicked", () => {
      render(<Sidebar />);

      const toggleButton = screen.getByLabelText("Collapse sidebar");

      // Initially not collapsed
      expect(screen.getByText("Navigation")).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(toggleButton);

      // Navigation title should be hidden when collapsed
      expect(screen.queryByText("Navigation")).not.toBeInTheDocument();
    });

    it("should call onCollapse callback when provided", () => {
      const onCollapse = vi.fn();
      render(<Sidebar onCollapse={onCollapse} />);

      const toggleButton = screen.getByLabelText("Collapse sidebar");
      fireEvent.click(toggleButton);

      expect(onCollapse).toHaveBeenCalledWith(true);
    });

    it("should use controlled collapsed prop", () => {
      const { rerender } = render(<Sidebar collapsed={false} />);

      expect(screen.getByText("Navigation")).toBeInTheDocument();

      rerender(<Sidebar collapsed={true} />);

      expect(screen.queryByText("Navigation")).not.toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("should have correct href attributes", () => {
      const { container } = render(<Sidebar />);

      const dashboardLink = container.querySelector('a[href="/dashboard"]');
      const analyticsLink = container.querySelector(
        'a[href="/dashboard/analytics"]',
      );

      expect(dashboardLink).toBeInTheDocument();
      expect(analyticsLink).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(<Sidebar className="custom-sidebar" />);

      expect(container.firstChild).toHaveClass("custom-sidebar");
    });
  });

  describe("Active State", () => {
    it("should highlight active menu item based on pathname", () => {
      const { container } = render(<Sidebar />);

      // Mock pathname is '/dashboard'
      const dashboardLink = container.querySelector('a[href="/dashboard"]');

      expect(dashboardLink).toHaveClass("bg-accent");
    });
  });
});
