import { render, screen } from "@testing-library/react";
import { Save, Trash } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { IconButton, LoadingButton } from "./index";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      loading: "Loading...",
      save: "Save",
    };
    return translations[key] || key;
  },
}));

describe("LoadingButton", () => {
  describe("Basic Rendering", () => {
    it("should render button with children", () => {
      render(<LoadingButton>Click Me</LoadingButton>);

      expect(
        screen.getByRole("button", { name: /click me/i }),
      ).toBeInTheDocument();
    });

    it("should render button without loading state", () => {
      const { container } = render(
        <LoadingButton loading={false}>Save</LoadingButton>,
      );

      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should render loading spinner when loading is true", () => {
      const { container } = render(
        <LoadingButton loading={true}>Save</LoadingButton>,
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should be disabled when loading", () => {
      render(<LoadingButton loading={true}>Save</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should show custom loading text when provided", () => {
      render(
        <LoadingButton loading={true} loadingText="Saving...">
          Save
        </LoadingButton>,
      );

      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(screen.queryByText("Save")).not.toBeInTheDocument();
    });

    it("should show original text when not loading", () => {
      render(<LoadingButton loading={false}>Save</LoadingButton>);

      expect(screen.getByText("Save")).toBeInTheDocument();
    });
  });

  describe("Icon", () => {
    it("should render icon on left by default", () => {
      const { container } = render(
        <LoadingButton icon={<Save className="icon" />}>Save</LoadingButton>,
      );

      const icon = container.querySelector(".icon");
      const iconWrapper = icon?.parentElement;

      expect(icon).toBeInTheDocument();
      expect(iconWrapper).toHaveClass("mr-2");
    });

    it("should render icon on right when iconPosition is right", () => {
      const { container } = render(
        <LoadingButton icon={<Save className="icon" />} iconPosition="right">
          Save
        </LoadingButton>,
      );

      const icon = container.querySelector(".icon");
      const iconWrapper = icon?.parentElement;

      expect(icon).toBeInTheDocument();
      expect(iconWrapper).toHaveClass("ml-2");
    });

    it("should not render icon when loading", () => {
      const { container } = render(
        <LoadingButton loading={true} icon={<Save className="custom-icon" />}>
          Save
        </LoadingButton>,
      );

      expect(container.querySelector(".custom-icon")).not.toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<LoadingButton disabled={true}>Save</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should be disabled when both disabled and loading are true", () => {
      render(
        <LoadingButton disabled={true} loading={true}>
          Save
        </LoadingButton>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });
});

describe("IconButton", () => {
  describe("Basic Rendering", () => {
    it("should render button with icon", () => {
      const { container } = render(
        <IconButton icon={<Save className="icon" />} label="Save" />,
      );

      expect(container.querySelector(".icon")).toBeInTheDocument();
    });

    it("should have accessible label", () => {
      render(<IconButton icon={<Save />} label="Save Document" />);

      // Label should be in screen reader only text
      expect(screen.getByText("Save Document")).toHaveClass("sr-only");
    });
  });

  describe("Label Visibility", () => {
    it("should hide label by default", () => {
      render(<IconButton icon={<Save />} label="Save" showLabel={false} />);

      const label = screen.getByText("Save");
      expect(label).toHaveClass("sr-only");
    });

    it("should show label when showLabel is true", () => {
      render(<IconButton icon={<Save />} label="Save" showLabel={true} />);

      const label = screen.getByText("Save");
      expect(label).not.toHaveClass("sr-only");
    });

    it("should add margin to icon when label is shown", () => {
      const { container } = render(
        <IconButton
          icon={<Save className="icon" />}
          label="Save"
          showLabel={true}
        />,
      );

      const icon = container.querySelector(".icon");
      const iconWrapper = icon?.parentElement;

      expect(iconWrapper).toHaveClass("mr-2");
    });

    it("should not add margin to icon when label is hidden", () => {
      const { container } = render(
        <IconButton
          icon={<Save className="icon" />}
          label="Save"
          showLabel={false}
        />,
      );

      const icon = container.querySelector(".icon");
      const iconWrapper = icon?.parentElement;

      expect(iconWrapper).not.toHaveClass("mr-2");
    });
  });

  describe("Button Props", () => {
    it("should forward button props", () => {
      render(
        <IconButton
          icon={<Trash />}
          label="Delete"
          variant="destructive"
          size="sm"
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should handle disabled state", () => {
      render(<IconButton icon={<Save />} label="Save" disabled={true} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });
});
