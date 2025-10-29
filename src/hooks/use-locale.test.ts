import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { routing } from "@/i18n/routing";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getBrowserLocale,
  useLocale,
} from "./use-locale";

// Mock next-intl
const mockUseLocale = vi.fn();
const mockUseTranslations = vi.fn();
vi.mock("next-intl", () => ({
  useLocale: () => mockUseLocale(),
  useTranslations: (namespace: string) => mockUseTranslations(namespace),
}));

// Mock Next.js router
const mockPush = vi.fn();
const mockPathname = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}));

// Mock routing config
vi.mock("@/i18n/routing", () => ({
  routing: {
    locales: ["en", "es", "fr", "de", "nl", "pt"],
    defaultLocale: "en",
    localePrefix: "as-needed",
  },
}));

describe("useLocale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocale.mockReturnValue("en");
    mockUseTranslations.mockReturnValue((key: string) => key);
    mockPathname.mockReturnValue("/dashboard");
    localStorage.clear();
  });

  describe("Hook Behavior", () => {
    it("should return current locale", () => {
      const { result } = renderHook(() => useLocale());

      expect(result.current.locale).toBe("en");
    });

    it("should return all available locales", () => {
      const { result } = renderHook(() => useLocale());

      expect(result.current.locales).toEqual([
        "en",
        "es",
        "fr",
        "de",
        "nl",
        "pt",
      ]);
    });

    it("should return default locale", () => {
      const { result } = renderHook(() => useLocale());

      expect(result.current.defaultLocale).toBe("en");
    });

    it("should provide translation function", () => {
      const mockT = vi.fn((key) => `translated-${key}`);
      mockUseTranslations.mockReturnValue(mockT);

      const { result } = renderHook(() => useLocale("common"));

      expect(result.current.t).toBe(mockT);
      expect(mockUseTranslations).toHaveBeenCalledWith("common");
    });
  });

  describe("setLocale", () => {
    it("should change locale and navigate to new path", () => {
      mockPathname.mockReturnValue("/dashboard");

      const { result } = renderHook(() => useLocale());

      result.current.setLocale("es");

      expect(localStorage.getItem("preferred-locale")).toBe("es");
      expect(mockPush).toHaveBeenCalledWith("/es/dashboard");
    });

    it("should handle paths with existing locale prefix", () => {
      mockPathname.mockReturnValue("/fr/dashboard");

      const { result } = renderHook(() => useLocale());

      result.current.setLocale("de");

      expect(mockPush).toHaveBeenCalledWith("/de/dashboard");
    });

    it("should remove locale prefix when switching to default locale", () => {
      mockPathname.mockReturnValue("/es/dashboard");

      const { result } = renderHook(() => useLocale());

      result.current.setLocale("en");

      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("should handle root path", () => {
      mockPathname.mockReturnValue("/");

      const { result } = renderHook(() => useLocale());

      result.current.setLocale("fr");

      expect(mockPush).toHaveBeenCalledWith("/fr/");
    });

    it("should not navigate with invalid locale", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useLocale());

      result.current.setLocale("invalid" as (typeof routing.locales)[number]);

      expect(mockPush).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[useLocale] Invalid locale: invalid",
      );
      consoleErrorSpy.mockRestore();
    });
  });
});

describe("getBrowserLocale", () => {
  const availableLocales = ["en", "es", "fr", "de"];
  const defaultLocale = "en";

  beforeEach(() => {
    localStorage.clear();
    // Mock navigator.languages
    Object.defineProperty(window.navigator, "languages", {
      writable: true,
      configurable: true,
      value: ["en-US", "en"],
    });
    Object.defineProperty(window.navigator, "language", {
      writable: true,
      configurable: true,
      value: "en-US",
    });
  });

  it("should return stored locale from localStorage", () => {
    localStorage.setItem("preferred-locale", "fr");

    const locale = getBrowserLocale(availableLocales, defaultLocale);

    expect(locale).toBe("fr");
  });

  it("should return exact match from browser languages", () => {
    Object.defineProperty(window.navigator, "languages", {
      writable: true,
      configurable: true,
      value: ["es", "en"],
    });

    const locale = getBrowserLocale(availableLocales, defaultLocale);

    expect(locale).toBe("es");
  });

  it("should return language code from locale string", () => {
    Object.defineProperty(window.navigator, "languages", {
      writable: true,
      configurable: true,
      value: ["de-DE", "en-US"],
    });

    const locale = getBrowserLocale(availableLocales, defaultLocale);

    expect(locale).toBe("de");
  });

  it("should return default locale when no match found", () => {
    Object.defineProperty(window.navigator, "languages", {
      writable: true,
      configurable: true,
      value: ["ja", "zh"],
    });

    const locale = getBrowserLocale(availableLocales, defaultLocale);

    expect(locale).toBe("en");
  });

  it("should prefer stored locale over browser locale", () => {
    localStorage.setItem("preferred-locale", "fr");
    Object.defineProperty(window.navigator, "languages", {
      writable: true,
      configurable: true,
      value: ["es", "en"],
    });

    const locale = getBrowserLocale(availableLocales, defaultLocale);

    expect(locale).toBe("fr");
  });
});

describe("formatNumber", () => {
  it("should format number with default options", () => {
    const formatted = formatNumber(1234.56, "en");
    expect(formatted).toBe("1,234.56");
  });

  it("should format number with custom options", () => {
    const formatted = formatNumber(1234.56, "en", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    expect(formatted).toBe("1,234.56");
  });

  it("should format number in different locale", () => {
    const formatted = formatNumber(1234.56, "de");
    expect(formatted).toBe("1.234,56");
  });
});

describe("formatDate", () => {
  it("should format date object", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    const formatted = formatDate(date, "en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(formatted).toContain("2024");
    expect(formatted).toContain("January");
  });

  it("should format date string", () => {
    const formatted = formatDate("2024-01-15", "en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(formatted).toContain("2024");
  });

  it("should format date in different locale", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    const formatted = formatDate(date, "es", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(formatted).toContain("2024");
    expect(formatted).toContain("enero");
  });

  it("should format timestamp", () => {
    const timestamp = new Date("2024-01-15").getTime();
    const formatted = formatDate(timestamp, "en", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    expect(formatted).toContain("2024");
  });
});

describe("formatCurrency", () => {
  it("should format USD currency", () => {
    const formatted = formatCurrency(1234.56, "en-US", "USD");
    expect(formatted).toBe("$1,234.56");
  });

  it("should format EUR currency", () => {
    const formatted = formatCurrency(1234.56, "de-DE", "EUR");
    expect(formatted).toBe("1.234,56 €");
  });

  it("should format GBP currency", () => {
    const formatted = formatCurrency(1234.56, "en-GB", "GBP");
    expect(formatted).toBe("£1,234.56");
  });

  it("should handle negative amounts", () => {
    const formatted = formatCurrency(-1234.56, "en-US", "USD");
    expect(formatted).toContain("-");
    expect(formatted).toContain("1,234.56");
  });

  it("should handle zero", () => {
    const formatted = formatCurrency(0, "en-US", "USD");
    expect(formatted).toBe("$0.00");
  });
});
