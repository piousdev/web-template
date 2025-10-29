import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorDisplay } from "./index";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Something went wrong",
      description: "An unexpected error occurred. Please try again.",
      "404.title": "Page Not Found",
      "404.description":
        "The page you're looking for doesn't exist or has been moved.",
      "500.title": "Server Error",
      "500.description":
        "We're experiencing technical difficulties. Please try again later.",
      "403.title": "Access Denied",
      "403.description": "You don't have permission to access this resource.",
      "401.title": "Unauthorized",
      "401.description": "Please sign in to access this page.",
      "maintenance.title": "Under Maintenance",
      "maintenance.description":
        "We're currently performing scheduled maintenance. We'll be back shortly.",
      "button.retry": "Try Again",
      "button.home": "Go Home",
      "button.back": "Go Back",
    };
    return translations[key] || key;
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    refresh: mockRefresh,
  }),
}));

describe("ErrorDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("General Error", () => {
    it("should render general error with default messages", () => {
      render(<ErrorDisplay />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(
        screen.getByText("An unexpected error occurred. Please try again."),
      ).toBeInTheDocument();
    });

    it("should show retry and home buttons by default", () => {
      render(<ErrorDisplay />);

      expect(screen.getByText("Try Again")).toBeInTheDocument();
      expect(screen.getByText("Go Home")).toBeInTheDocument();
    });

    it("should call router.refresh on retry", () => {
      render(<ErrorDisplay />);

      const retryButton = screen.getByText("Try Again");
      fireEvent.click(retryButton);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it("should call custom onRetry if provided", () => {
      const onRetry = vi.fn();
      render(<ErrorDisplay onRetry={onRetry} />);

      const retryButton = screen.getByText("Try Again");
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("should navigate to home on home button click", () => {
      render(<ErrorDisplay />);

      const homeButton = screen.getByText("Go Home");
      fireEvent.click(homeButton);

      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  describe("404 Error", () => {
    it("should render 404 error messages", () => {
      render(<ErrorDisplay type="404" />);

      expect(screen.getByText("Page Not Found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "The page you're looking for doesn't exist or has been moved.",
        ),
      ).toBeInTheDocument();
    });

    it("should use custom title and description", () => {
      render(
        <ErrorDisplay
          type="404"
          title="Custom 404 Title"
          description="Custom 404 Description"
        />,
      );

      expect(screen.getByText("Custom 404 Title")).toBeInTheDocument();
      expect(screen.getByText("Custom 404 Description")).toBeInTheDocument();
    });
  });

  describe("500 Error", () => {
    it("should render 500 error messages", () => {
      render(<ErrorDisplay type="500" />);

      expect(screen.getByText("Server Error")).toBeInTheDocument();
      expect(
        screen.getByText(
          "We're experiencing technical difficulties. Please try again later.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("403 Error", () => {
    it("should render 403 error messages", () => {
      render(<ErrorDisplay type="403" />);

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(
        screen.getByText("You don't have permission to access this resource."),
      ).toBeInTheDocument();
    });
  });

  describe("401 Error", () => {
    it("should render 401 error messages", () => {
      render(<ErrorDisplay type="401" />);

      expect(screen.getByText("Unauthorized")).toBeInTheDocument();
      expect(
        screen.getByText("Please sign in to access this page."),
      ).toBeInTheDocument();
    });
  });

  describe("Maintenance Error", () => {
    it("should render maintenance error messages", () => {
      render(<ErrorDisplay type="maintenance" />);

      expect(screen.getByText("Under Maintenance")).toBeInTheDocument();
      expect(
        screen.getByText(
          "We're currently performing scheduled maintenance. We'll be back shortly.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Button Visibility", () => {
    it("should hide retry button when showRetry is false", () => {
      render(<ErrorDisplay showRetry={false} />);

      expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
      expect(screen.getByText("Go Home")).toBeInTheDocument();
    });

    it("should hide home button when showHome is false", () => {
      render(<ErrorDisplay showHome={false} />);

      expect(screen.getByText("Try Again")).toBeInTheDocument();
      expect(screen.queryByText("Go Home")).not.toBeInTheDocument();
    });

    it("should show back button when showBack is true", () => {
      render(<ErrorDisplay showBack={true} />);

      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });

    it("should call router.back on back button click", () => {
      render(<ErrorDisplay showBack={true} />);

      const backButton = screen.getByText("Go Back");
      fireEvent.click(backButton);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(<ErrorDisplay className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
