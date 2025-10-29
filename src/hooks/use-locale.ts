"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale as useNextIntlLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

interface UseLocaleReturn {
  locale: Locale;
  locales: readonly Locale[];
  defaultLocale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof useTranslations>;
}

/**
 * Custom hook for managing locale and translations
 *
 * Provides current locale, available locales, and a method to change locale.
 * Integrates with next-intl for internationalization.
 *
 * @returns Locale management utilities
 *
 * @example
 * ```tsx
 * function LanguageSwitcher() {
 *   const { locale, locales, setLocale, t } = useLocale();
 *
 *   return (
 *     <div>
 *       <h2>{t('language')}</h2>
 *       <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
 *         {locales.map((loc) => (
 *           <option key={loc} value={loc}>
 *             {loc.toUpperCase()}
 *           </option>
 *         ))}
 *       </select>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLocale(namespace = "common"): UseLocaleReturn {
  const currentLocale = useNextIntlLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations(namespace);

  /**
   * Change the current locale
   * Navigates to the same path with the new locale
   */
  const setLocale = (newLocale: Locale): void => {
    if (!routing.locales.includes(newLocale)) {
      console.error(`[useLocale] Invalid locale: ${newLocale}`);
      return;
    }

    // Store locale preference in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-locale", newLocale);
    }

    // Build new path with locale
    let newPath = pathname;

    // Remove current locale prefix if it exists
    const localePattern = new RegExp(`^/(${routing.locales.join("|")})`);
    newPath = newPath.replace(localePattern, "");

    // Add new locale prefix if it's not the default locale
    // or if localePrefix is set to always show the locale prefix
    const shouldAddPrefix =
      newLocale !== routing.defaultLocale ||
      (routing.localePrefix && String(routing.localePrefix) === "always");

    if (shouldAddPrefix) {
      newPath = `/${newLocale}${newPath}`;
    }

    // Ensure path starts with /
    if (!newPath.startsWith("/")) {
      newPath = `/${newPath}`;
    }

    router.push(newPath);
  };

  return {
    locale: currentLocale,
    locales: routing.locales,
    defaultLocale: routing.defaultLocale,
    setLocale,
    t,
  };
}

/**
 * Get the browser's preferred locale from the available locales
 * @param availableLocales Available locales
 * @param defaultLocale Default fallback locale
 * @returns Preferred locale
 */
export function getBrowserLocale(
  availableLocales: readonly string[],
  defaultLocale: string,
): string {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  // Check localStorage first
  const storedLocale = localStorage.getItem("preferred-locale");
  if (storedLocale && availableLocales.includes(storedLocale)) {
    return storedLocale;
  }

  // Check browser languages
  const browserLanguages = navigator.languages || [navigator.language];

  for (const browserLang of browserLanguages) {
    // Try exact match first
    if (availableLocales.includes(browserLang)) {
      return browserLang;
    }

    // Try language code only (e.g., 'en' from 'en-US')
    const langCode = browserLang.split("-")[0];
    if (availableLocales.includes(langCode)) {
      return langCode;
    }
  }

  return defaultLocale;
}

/**
 * Format a number according to the current locale
 * @param value Number to format
 * @param locale Current locale
 * @param options Intl.NumberFormat options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a date according to the current locale
 * @param date Date to format
 * @param locale Current locale
 * @param options Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | number | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format currency according to the current locale
 * @param value Amount to format
 * @param locale Current locale
 * @param currency Currency code (e.g., 'USD', 'EUR')
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  locale: string,
  currency: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}
