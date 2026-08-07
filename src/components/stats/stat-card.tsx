import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const iconTones = {
  amber: "bg-amber-50 text-amber-600 ring-1 ring-amber-100/80",
  indigo: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100/80",
  blue: "bg-blue-50 text-[#0057d8] ring-1 ring-blue-100/80",
  emerald: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100/80",
  violet: "bg-violet-50 text-violet-600 ring-1 ring-violet-100/80",
  rose: "bg-rose-50 text-rose-600 ring-1 ring-rose-100/80",
} as const;

const accentClass = {
  amber: "stat-accent-amber",
  indigo: "stat-accent-indigo",
  blue: "stat-accent-blue",
  emerald: "stat-accent-emerald",
  violet: "stat-accent-violet",
  rose: "stat-accent-rose",
} as const;

type IconTone = keyof typeof iconTones;

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  selected?: boolean;
  icon?: LucideIcon;
  iconTone?: IconTone;
  trendPercent?: number;
  trendLabel?: string;
  trendBadge?: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  selected,
  icon: Icon,
  iconTone = "blue",
  trendPercent,
  trendLabel,
  trendBadge,
  className,
}: StatCardProps) {
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  const showSideBadge = !(numericValue === 0);
  const isPositive = trendPercent !== undefined && trendPercent >= 0;
  const isNegative = trendPercent !== undefined && trendPercent < 0;

  return (
    <div
      className={cn(
        "stat-box stat-box-hover h-full min-w-0",
        accentClass[iconTone],
        selected && "border-blue-200 ring-2 ring-blue-500/15",
        className,
      )}
    >
      <div className="stat-box-header">
        <p className="min-w-0 flex-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        {Icon && (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              iconTones[iconTone],
            )}
          >
            <Icon className="size-[17px]" strokeWidth={2.1} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-2.5">
        <p className="text-[1.75rem] font-extrabold tabular-nums tracking-tight text-slate-950">
          {value}
        </p>
        {showSideBadge &&
          (trendBadge ? (
            <span className="trend-pill trend-pill-up">{trendBadge}</span>
          ) : (
            trendPercent !== undefined && (
              <span
                className={cn(
                  "trend-pill",
                  isPositive && "trend-pill-up",
                  isNegative && "trend-pill-down",
                )}
              >
                {isPositive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {isPositive ? "+" : ""}
                {trendPercent}%
                {trendLabel && (
                  <span className="ml-0.5 font-normal opacity-80">
                    {trendLabel}
                  </span>
                )}
              </span>
            )
          ))}
      </div>

      {hint && (
        <p className="mt-auto line-clamp-2 text-xs leading-relaxed text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}
