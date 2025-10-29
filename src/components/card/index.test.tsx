import { fireEvent, render, screen } from "@testing-library/react";
import { DollarSign, Zap } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { BasicCard, FeatureCard, ProductCard, StatCard } from "./index";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      viewDetails: "View Details",
      readMore: "Read More",
    };
    return translations[key] || key;
  },
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

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => (
    // biome-ignore lint/performance/noImgElement: This is a mock for testing purposes
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("BasicCard", () => {
  it("should render with title and description", () => {
    render(<BasicCard title="Test Title" description="Test Description" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("should render with children", () => {
    render(
      <BasicCard title="Test">
        <p>Card content</p>
      </BasicCard>,
    );

    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("should render with image", () => {
    render(<BasicCard title="Test" image="/test.jpg" imageAlt="Test image" />);

    const image = screen.getByAltText("Test image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/test.jpg");
  });

  it("should render with footer", () => {
    render(
      <BasicCard title="Test" footer={<button type="button">Action</button>} />,
    );

    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <BasicCard title="Test" className="custom-class" />,
    );

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});

describe("FeatureCard", () => {
  it("should render with icon, title and description", () => {
    render(
      <FeatureCard
        icon={<Zap className="icon" />}
        title="Feature Title"
        description="Feature Description"
      />,
    );

    expect(screen.getByText("Feature Title")).toBeInTheDocument();
    expect(screen.getByText("Feature Description")).toBeInTheDocument();
  });

  it("should render as link when href is provided", () => {
    const { container } = render(
      <FeatureCard title="Feature" href="/features/1" />,
    );

    const link = container.querySelector('a[href="/features/1"]');
    expect(link).toBeInTheDocument();
  });

  it("should not render as link when href is not provided", () => {
    const { container } = render(<FeatureCard title="Feature" />);

    const link = container.querySelector("a");
    expect(link).not.toBeInTheDocument();
  });

  it("should render children", () => {
    render(
      <FeatureCard title="Feature">
        <p>Feature content</p>
      </FeatureCard>,
    );

    expect(screen.getByText("Feature content")).toBeInTheDocument();
  });
});

describe("StatCard", () => {
  it("should render title and value", () => {
    render(<StatCard title="Total Revenue" value="$45,231" />);

    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("$45,231")).toBeInTheDocument();
  });

  it("should render with icon", () => {
    const { container } = render(
      <StatCard
        title="Revenue"
        value="$1000"
        icon={<DollarSign className="stat-icon" />}
      />,
    );

    expect(container.querySelector(".stat-icon")).toBeInTheDocument();
  });

  it("should show positive change with green color", () => {
    render(<StatCard title="Revenue" value="$1000" change={15} />);

    const changeText = screen.getByText("+15%");
    expect(changeText).toHaveClass("text-green-500");
  });

  it("should show negative change with red color", () => {
    render(<StatCard title="Revenue" value="$1000" change={-10} />);

    const changeText = screen.getByText("-10%");
    expect(changeText).toHaveClass("text-red-500");
  });

  it("should render change label", () => {
    render(
      <StatCard
        title="Revenue"
        value="$1000"
        change={15}
        changeLabel="from last month"
      />,
    );

    expect(screen.getByText("from last month")).toBeInTheDocument();
  });

  it("should not render change when not provided", () => {
    const { container } = render(<StatCard title="Revenue" value="$1000" />);

    expect(container.querySelector(".text-green-500")).not.toBeInTheDocument();
    expect(container.querySelector(".text-red-500")).not.toBeInTheDocument();
  });
});

describe("ProductCard", () => {
  it("should render title, description and price", () => {
    render(
      <ProductCard
        title="Product Name"
        description="Product Description"
        price={99.99}
      />,
    );

    expect(screen.getByText("Product Name")).toBeInTheDocument();
    expect(screen.getByText("Product Description")).toBeInTheDocument();
    expect(screen.getByText("$99.99")).toBeInTheDocument();
  });

  it("should render with image and badge", () => {
    render(
      <ProductCard
        title="Product"
        image="/product.jpg"
        imageAlt="Product image"
        badge="New"
      />,
    );

    const image = screen.getByAltText("Product image");
    expect(image).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should render action button with custom label", () => {
    const onAction = vi.fn();
    render(
      <ProductCard title="Product" onAction={onAction} actionLabel="Buy Now" />,
    );

    const button = screen.getByRole("button", { name: "Buy Now" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("should render action button with default label", () => {
    render(<ProductCard title="Product" onAction={() => {}} />);

    expect(screen.getByText("View Details")).toBeInTheDocument();
  });

  it("should render children", () => {
    render(
      <ProductCard title="Product">
        <p>Product details</p>
      </ProductCard>,
    );

    expect(screen.getByText("Product details")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ProductCard title="Product" className="custom-product" />,
    );

    expect(container.querySelector(".custom-product")).toBeInTheDocument();
  });
});
