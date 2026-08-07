"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  canNavigateDashboardMonth,
  shiftDashboardMonth,
} from "@/lib/dashboard-month";
import { cn } from "@/lib/utils";

type DashboardMonthPickerProps = {
  monthKey: string;
  monthLabel: string;
  className?: string;
  /** "dashboard" (default) or "stats" drill-down */
  variant?: "dashboard" | "stats";
};

function monthHref(monthKey: string, variant: "dashboard" | "stats") {
  return variant === "stats"
    ? `/dashboard/stats/${monthKey}`
    : `/dashboard?month=${monthKey}`;
}

export function DashboardMonthPicker({
  monthKey,
  monthLabel,
  className,
  variant = "dashboard",
}: DashboardMonthPickerProps) {
  const prevMonth = shiftDashboardMonth(monthKey, -1);
  const nextMonth = shiftDashboardMonth(monthKey, 1);
  const canGoPrev = canNavigateDashboardMonth(monthKey, "prev");
  const canGoNext = canNavigateDashboardMonth(monthKey, "next");

  const navClass = cn(
    buttonVariants({ variant: "ghost", size: "icon-sm" }),
    "livento-btn-ghost rounded-full",
  );

  return (
    <div
      className={cn(
        "livento-period-picker rounded-full border border-white/80 bg-white/90 px-1 shadow-sm",
        className,
      )}
    >
      {canGoPrev ? (
        <Link href={monthHref(prevMonth, variant)} className={navClass} prefetch>
          <ChevronLeft />
          <span className="sr-only">Mois précédent</span>
        </Link>
      ) : (
        <span className={cn(navClass, "pointer-events-none opacity-40")}>
          <ChevronLeft />
        </span>
      )}

      <span className="px-2 text-xs font-medium text-muted-foreground">
        {monthLabel}
      </span>

      {canGoNext ? (
        <Link href={monthHref(nextMonth, variant)} className={navClass} prefetch>
          <ChevronRight />
          <span className="sr-only">Mois suivant</span>
        </Link>
      ) : (
        <span className={cn(navClass, "pointer-events-none opacity-40")}>
          <ChevronRight />
        </span>
      )}
    </div>
  );
}
