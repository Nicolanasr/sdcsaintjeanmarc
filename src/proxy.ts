import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const locales = ["en", "ar"];
const defaultLocale = "en";

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

  // 2. Refresh/Verify Supabase Session
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Route Protection Logic
  // Match path pattern like /[locale]/dashboard/...
  const dashboardMatch = pathname.match(/^\/(en|ar)\/dashboard(\/.*)?$/);

  if (dashboardMatch) {
    const locale = dashboardMatch[1];
    const subpath = dashboardMatch[2] || "";

    // If not authenticated, redirect to login
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    // Role-based authorization
    if (subpath.startsWith("/admin")) {
      // Query profile role from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        // Redirect non-admins to scout dashboard
        return NextResponse.redirect(
          new URL(`/${locale}/dashboard/scout`, request.url)
        );
      }
    }
  }

  // Allow login page access checks: if user is logged in, don't allow access to login page
  const loginMatch = pathname.match(/^\/(en|ar)\/login$/);
  if (loginMatch && user) {
    const locale = loginMatch[1];
    return NextResponse.redirect(
      new URL(`/${locale}/dashboard/scout`, request.url)
    );
  }

  return supabaseResponse;
}

export const config = {
  // Run proxy on all paths except static files, next internals, and static images
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|logo.png|.*\\..*).*)",
  ],
};
