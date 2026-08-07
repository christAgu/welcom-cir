import type { NextRequest } from "next/server";

export function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"),
  );
}

export function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/")
  );
}

/** Pages auth sans redirection auto vers le dashboard (affichage immédiat). */
export function isAuthFormPath(pathname: string) {
  return (
    pathname === "/login/signup" ||
    pathname === "/login/forgot-password" ||
    pathname === "/login/set-password" ||
    pathname === "/login/reset-password"
  );
}
