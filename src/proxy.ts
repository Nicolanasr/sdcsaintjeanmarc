import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const locales = ["en", "ar"];
const defaultLocale = "en";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-goal-rush-fundraising-portal"
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the pathname is missing a supported locale
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

  // 2. Auth Cookie check
  const token = request.cookies.get("token")?.value;
  let userPayload: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userPayload = payload;
    } catch (err) {
      // Invalid/expired token
    }
  }

  // 3. Route Protection Logic
  const dashboardMatch = pathname.match(/^\/(en|ar)\/scout-world-cup\/dashboard(\/.*)?$/);

  if (dashboardMatch) {
    const locale = dashboardMatch[1];
    const subpath = dashboardMatch[2] || "";

    // If not authenticated, redirect to login
    if (!userPayload) {
      const response = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      // Delete cookie if it was invalid
      response.cookies.delete("token");
      return response;
    }

    // Role-based authorization
    if (subpath.startsWith("/admin")) {
      if (userPayload.role !== "admin") {
        // Redirect non-admins to rovers terminal
        return NextResponse.redirect(
          new URL(`/${locale}/rovers/terminal`, request.url)
        );
      }
    }
  }

  // Allow login page access checks: if user is logged in, don't allow access to login page
  const loginMatch = pathname.match(/^\/(en|ar)\/login$/);
  if (loginMatch && userPayload) {
    const locale = loginMatch[1];
    return NextResponse.redirect(
      new URL(`/${locale}/rovers/terminal`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  // Run proxy on all paths except static files, next internals, and static images
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|logo.png|.*\\..*).*)",
  ],
};
