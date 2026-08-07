import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: string;
  className?: string;
};

export function DashboardHeader({
  title,
  description,
  actions,
  badge,
  className,
}: DashboardHeaderProps) {
  return (
    <header className={cn("dash-hero", className)}>
      <div className="dash-hero-glow" aria-hidden />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-3">
          {badge && (
            <span className="dash-kicker">
              <Sparkles className="size-3.5" />
              {badge}
            </span>
          )}
          <h1 className="dash-hero-title">{title}</h1>
          {description && <p className="dash-hero-desc">{description}</p>}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
        )}
      </div>
    </header>
  );
}
