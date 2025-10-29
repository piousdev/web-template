import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "./lib/auth";

/**
 * Protected routes that require authentication
 */
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

/**
 * Public routes that should redirect to dashboard if authenticated
 */
const publicOnlyRoutes = ["/login", "/register", "/forgot-password"];

/**
 * Check if path matches any of the given route patterns
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Remove locale prefix if present
    const localePattern = new RegExp(`^/(${routing.locales.join("|")})`);
    const pathWithoutLocale = pathname.replace(localePattern, "");

    return pathWithoutLocale.startsWith(route) || pathname.startsWith(route);
  });
}

/**
 * Middleware proxy that handles both authentication and i18n
 */
export async function proxy(request: NextRequest) {
  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthenticated = !!session?.user;
  const pathname = request.nextUrl.pathname;

  // Handle protected routes
  if (matchesRoute(pathname, protectedRoutes) && !isAuthenticated) {
    // Get the locale from the pathname
    const localeMatch = pathname.match(
      new RegExp(`^/(${routing.locales.join("|")})`),
    );
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

    // Redirect to login with return URL
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("returnUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Handle public-only routes (redirect to dashboard if already authenticated)
  if (matchesRoute(pathname, publicOnlyRoutes) && isAuthenticated) {
    // Get the locale from the pathname
    const localeMatch = pathname.match(
      new RegExp(`^/(${routing.locales.join("|")})`),
    );
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

    // Redirect to dashboard
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Handle i18n routing
  const handleI18nRouting = createIntlMiddleware(routing);
  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - _vercel (Vercel internals)
  // - Static files (images, fonts, etc.)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
