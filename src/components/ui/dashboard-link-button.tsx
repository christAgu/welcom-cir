import Link from "next/link";
import { cn } from "@/lib/utils";

type DashboardLinkButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function DashboardLinkButton({
  href,
  children,
  variant = "primary",
  className,
}: DashboardLinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        variant === "primary" ? "dash-btn-primary" : "dash-btn-secondary",
        className,
      )}
    >
      {children}
    </Link>
  );
}
