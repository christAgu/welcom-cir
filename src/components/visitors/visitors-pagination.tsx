import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  personnesFilterHref,
  type PersonnesFilter,
} from "@/lib/visitors/personnes-filters";
import { cn } from "@/lib/utils";

type VisitorsPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  filter?: PersonnesFilter;
  query?: string;
  created?: string;
};

export function VisitorsPagination({
  page,
  totalPages,
  total,
  filter = { type: "all" },
  query,
  created,
}: VisitorsPaginationProps) {
  if (totalPages <= 1) return null;

  const navClass = cn(
    buttonVariants({ variant: "ghost", size: "icon-sm" }),
    "livento-btn-ghost rounded-full",
  );

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  const href = (targetPage: number) =>
    query && query.length >= 2
      ? `/dashboard/personnes?${new URLSearchParams({
          q: query,
          ...(targetPage > 1 ? { page: String(targetPage) } : {}),
          ...(created ? { created } : {}),
        }).toString()}`
      : personnesFilterHref(filter, { page: targetPage, created });

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page {page} sur {totalPages} · {total} personne{total > 1 ? "s" : ""}
      </p>

      <div className="livento-period-picker inline-flex w-fit rounded-full border border-white/80 bg-white/90 px-1 shadow-sm">
        {canGoPrev ? (
          <Link href={href(page - 1)} className={navClass} prefetch>
            <ChevronLeft />
            <span className="sr-only">Page précédente</span>
          </Link>
        ) : (
          <span className={cn(navClass, "pointer-events-none opacity-40")}>
            <ChevronLeft />
          </span>
        )}

        <span className="px-2 text-xs font-medium text-muted-foreground">
          {page} / {totalPages}
        </span>

        {canGoNext ? (
          <Link href={href(page + 1)} className={navClass} prefetch>
            <ChevronRight />
            <span className="sr-only">Page suivante</span>
          </Link>
        ) : (
          <span className={cn(navClass, "pointer-events-none opacity-40")}>
            <ChevronRight />
          </span>
        )}
      </div>
    </div>
  );
}
