import type { Visitor } from "@/lib/database.types";
import { formatDateFr, formatDateTimeFr } from "@/lib/visitors/format-field-value";
import { cn } from "@/lib/utils";

type FollowUpVisitor = Pick<Visitor, "visited_at" | "called_at" | "returned_at">;

const FOLLOW_UP_ITEMS = [
  { key: "visited_at", label: "Visite programmée", compactLabel: "Visite" },
  { key: "called_at", label: "Appel programmé", compactLabel: "Appel" },
  { key: "returned_at", label: "Revenue", compactLabel: "Revenue" },
] as const;

function StatusPill({
  done,
  label,
  compact,
}: {
  done: boolean;
  label: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        done
          ? "bg-[#DCFCE7] text-green-700 ring-1 ring-green-200/70"
          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200/80",
      )}
    >
      {compact ? label : `${label} · ${done ? "Oui" : "Non"}`}
    </span>
  );
}

export function FollowUpBadges({
  visitor,
  compact = false,
}: {
  visitor: FollowUpVisitor;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", compact && "gap-1")}>
      {FOLLOW_UP_ITEMS.map((item) => (
        <StatusPill
          key={item.key}
          label={compact ? item.compactLabel : item.label}
          done={visitor[item.key] !== null}
          compact={compact}
        />
      ))}
    </div>
  );
}

export function FollowUpDetail({
  visitor,
}: {
  visitor: FollowUpVisitor;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {FOLLOW_UP_ITEMS.map((item) => {
        const date = visitor[item.key];

        return (
          <div
            key={item.key}
            className="rounded-2xl border border-slate-100/80 bg-gradient-to-br from-slate-50/90 to-white p-4"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {item.label}
            </p>
            {date ? (
              <>
                <p className="mt-2 inline-flex rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-bold text-green-700">
                  Oui
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {item.key === "visited_at" || item.key === "called_at"
                    ? formatDateTimeFr(date)
                    : formatDateFr(date)}
                </p>
              </>
            ) : (
              <p className="mt-2 inline-flex rounded-full bg-[#FEE2E2] px-2.5 py-1 text-xs font-bold text-red-600">
                Non
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
