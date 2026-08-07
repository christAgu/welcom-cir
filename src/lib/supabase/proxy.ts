import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  hasSupabaseAuthCookie,
  isAuthFormPath,
  isPublicPath,
} from "@/lib/auth/public-routes";
import type { Database } from "@/lib/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function applyCookies(
  target: NextResponse,
  source: NextResponse,
) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value);
  });
}

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/auth/signout") {
    return NextResponse.next({ request });
  }

  if (isAuthFormPath(pathname)) {
    return NextResponse.next({ request });
  }

  if (isPublicPath(pathname) && !hasSupabaseAuthCookie(request)) {
    return NextResponse.next({ request });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user && !userError);

  if (hasSupabaseAuthCookie(request) && !isAuthenticated) {
    await supabase.auth.signOut({ scope: "global" });

    if (
      pathname === "/login" &&
      request.nextUrl.searchParams.get("logout") === "1"
    ) {
      return supabaseResponse;
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("logout", "1");

    const response = NextResponse.redirect(loginUrl);
    applyCookies(response, supabaseResponse);
    return response;
  }

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    isPublicPath(pathname) &&
    isAuthenticated &&
    request.nextUrl.searchParams.get("logout") !== "1"
  ) {
    if (pathname === "/login") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return supabaseResponse;
}
