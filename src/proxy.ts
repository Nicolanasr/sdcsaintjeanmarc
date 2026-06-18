import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "ar"];
const defaultLocale = "en";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname is missing a supported locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale prefix
  if (pathnameIsMissingLocale) {
    const locale = defaultLocale;

    const redirectUrl = new URL(
      `/${locale}${pathname === "/" ? "" : pathname}${request.nextUrl.search}`,
      request.url
    );

    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  // Run proxy on all paths except static files, next internals, and static images
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|logo.png|.*\\..*).*)",
  ],
};
