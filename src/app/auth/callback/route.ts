import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeRedirectPath } from "@/lib/auth/redirect";
import type { Database } from "@/lib/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = safeRedirectPath(requestUrl.searchParams.get("next"));
  const origin = requestUrl.origin;

  const redirectTo = `${origin}${next}`;
  let response = NextResponse.redirect(redirectTo);
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.redirect(redirectTo);
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([headerKey, value]) => {
          response.headers.set(headerKey, value);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (!error) return response;
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "auth_callback");
  const details =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");
  if (details) loginUrl.searchParams.set("details", details);

  return NextResponse.redirect(loginUrl);
}
