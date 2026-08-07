import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardLinkProps = {
  href: string;
  enabled?: boolean;
  children: ReactNode;
  className?: string;
};

export function StatCardLink({
  href,
  enabled = true,
  children,
  className,
}: StatCardLinkProps) {
  if (!enabled) {
    return <div className={cn("h-full", className)}>{children}</div>;
  }

  return (
    <Link
      href={href}
      className={cn(
        "block h-full rounded-[inherit] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
        className,
      )}
      prefetch
    >
      {children}
    </Link>
  );
}
