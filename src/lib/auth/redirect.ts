export function safeRedirectPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export function authConfirmUrl(
  siteUrl: string,
  next = "/login/set-password",
) {
  return `${siteUrl}/auth/confirm?next=${encodeURIComponent(next)}`;
}
