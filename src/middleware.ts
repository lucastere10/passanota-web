import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_ROUTES_PREFIX,
  APP_ROUTES_PREFIXES,
  AUTH_ONLY_ROUTES,
  MOBILE_ROUTES_PREFIX,
  PUBLIC_ROUTES,
} from "@/lib/auth/constants";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAuthOnlyRoute(pathname: string): boolean {
  return AUTH_ONLY_ROUTES.some((route) => pathname === route);
}

function isAppRoute(pathname: string): boolean {
  return APP_ROUTES_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAdminRoute(pathname: string): boolean {
  return pathname === ADMIN_ROUTES_PREFIX || pathname.startsWith(`${ADMIN_ROUTES_PREFIX}/`);
}

function isMobileRoute(pathname: string): boolean {
  return pathname === MOBILE_ROUTES_PREFIX || pathname.startsWith(`${MOBILE_ROUTES_PREFIX}/`);
}

function isProtectedRoute(pathname: string): boolean {
  return (
    (isAppRoute(pathname) || isAdminRoute(pathname) || pathname === "/auth/complete-profile") &&
    !isMobileRoute(pathname)
  );
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname === "/" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isAuthOnlyRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!user && isProtectedRoute(pathname) && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
