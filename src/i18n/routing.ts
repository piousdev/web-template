import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "es", "fr", "de", "nl", "pt"],

  // Used when no locale matches
  defaultLocale: "en",

  // The prefix for the default locale when using the 'as-needed' strategy
  localePrefix: "as-needed",
});
