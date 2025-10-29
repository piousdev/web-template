import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CardSkeleton, Loading, Skeleton, TableSkeleton } from "./index";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      default: "Loading...",
      pleaseWait: "Please wait",
      processing: "Processing...",
    };
    return translations[key] || key;
  },
}));

describe("Loading", () => {
  describe("Spinner Variant", () => {
    it("should render spinner by default", () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector("svg");

      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass("animate-spin");
    });

    it("should render with different sizes", () => {
      const { container: small } = render(<Loading size="sm" />);
      const { container: medium } = render(<Loading size="md" />);
      const { container: large } = render(<Loading size="lg" />);

      expect(small.querySelector("svg")).toHaveClass("h-4", "w-4");
      expect(medium.querySelector("svg")).toHaveClass("h-8", "w-8");
      expect(large.querySelector("svg")).toHaveClass("h-12", "w-12");
    });

    it("should render with custom text", () => {
      render(<Loading text="Please wait" />);

      expect(screen.getByText("Please wait")).toBeInTheDocument();
    });

    it("should render without text when not provided", () => {
      const { container } = render(<Loading />);
      const text = container.querySelector("p");

      expect(text).not.toBeInTheDocument();
    });
  });

  describe("Dots Variant", () => {
    it("should render dots variant", () => {
      const { container } = render(<Loading variant="dots" />);
      const dots = container.querySelectorAll(".animate-bounce");

      expect(dots).toHaveLength(3);
    });

    it("should render dots with different sizes", () => {
      const { container: small } = render(<Loading variant="dots" size="sm" />);
      const { container: large } = render(<Loading variant="dots" size="lg" />);

      const smallDots = small.querySelectorAll(".h-2.w-2");
      const largeDots = large.querySelectorAll(".h-4.w-4");

      expect(smallDots).toHaveLength(3);
      expect(largeDots).toHaveLength(3);
    });
  });

  describe("Pulse Variant", () => {
    it("should render pulse variant", () => {
      const { container } = render(<Loading variant="pulse" />);
      const pulse = container.querySelector(".animate-pulse");

      expect(pulse).toBeInTheDocument();
      expect(pulse).toHaveClass("rounded-full", "bg-primary");
    });
  });

  describe("Full Screen Mode", () => {
    it("should render in fullscreen mode", () => {
      const { container } = render(<Loading fullScreen={true} />);
      const fullScreenDiv = container.querySelector(".fixed.inset-0");

      expect(fullScreenDiv).toBeInTheDocument();
      expect(fullScreenDiv).toHaveClass("backdrop-blur-sm");
    });

    it("should not render in fullscreen by default", () => {
      const { container } = render(<Loading />);
      const fullScreenDiv = container.querySelector(".fixed.inset-0");

      expect(fullScreenDiv).not.toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(<Loading className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});

describe("Skeleton", () => {
  it("should render skeleton with default variant", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild;

    expect(skeleton).toHaveClass("animate-pulse", "bg-muted", "rounded-md");
  });

  it("should render with different variants", () => {
    const { container: text } = render(<Skeleton variant="text" />);
    const { container: circular } = render(<Skeleton variant="circular" />);
    const { container: rectangular } = render(
      <Skeleton variant="rectangular" />,
    );

    expect(text.firstChild).toHaveClass("rounded");
    expect(circular.firstChild).toHaveClass("rounded-full");
    expect(rectangular.firstChild).toHaveClass("rounded-md");
  });

  it("should render with custom width and height", () => {
    const { container } = render(<Skeleton width={200} height={100} />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton.style.width).toBe("200px");
    expect(skeleton.style.height).toBe("100px");
  });

  it("should render with string dimensions", () => {
    const { container } = render(<Skeleton width="50%" height="2rem" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton.style.width).toBe("50%");
    expect(skeleton.style.height).toBe("2rem");
  });

  it("should apply custom className", () => {
    const { container } = render(<Skeleton className="custom-skeleton" />);

    expect(container.firstChild).toHaveClass("custom-skeleton");
  });
});

describe("CardSkeleton", () => {
  it("should render card skeleton structure", () => {
    const { container } = render(<CardSkeleton />);

    expect(container.querySelector(".space-y-3")).toBeInTheDocument();
    expect(container.querySelector(".rounded-lg.border")).toBeInTheDocument();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should apply custom className", () => {
    const { container } = render(<CardSkeleton className="custom-card" />);

    expect(container.firstChild).toHaveClass("custom-card");
  });
});

describe("TableSkeleton", () => {
  it("should render table skeleton with default rows and columns", () => {
    const { container } = render(<TableSkeleton />);
    const rows = container.querySelectorAll(".flex.gap-4");

    expect(rows).toHaveLength(5); // Default 5 rows

    const firstRowColumns = rows[0].querySelectorAll(".animate-pulse");
    expect(firstRowColumns).toHaveLength(4); // Default 4 columns
  });

  it("should render with custom rows and columns", () => {
    const { container } = render(<TableSkeleton rows={3} columns={6} />);
    const rows = container.querySelectorAll(".flex.gap-4");

    expect(rows).toHaveLength(3);

    const firstRowColumns = rows[0].querySelectorAll(".animate-pulse");
    expect(firstRowColumns).toHaveLength(6);
  });

  it("should apply custom className", () => {
    const { container } = render(<TableSkeleton className="custom-table" />);

    expect(container.firstChild).toHaveClass("custom-table");
  });
});
