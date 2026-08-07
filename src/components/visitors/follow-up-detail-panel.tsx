"use client";

import type { ReactNode } from "react";
import type { Visitor } from "@/lib/database.types";
import { MarkReturnedDialog } from "@/components/visitors/mark-returned-dialog";
import { ScheduleCallDialog } from "@/components/visitors/schedule-call-dialog";
import { ScheduleVisitDialog } from "@/components/visitors/schedule-visit-dialog";
import { formatDateFr, formatDateTimeFr } from "@/lib/visitors/format-field-value";
import { cn } from "@/lib/utils";

type FollowUpDetailPanelProps = {
  visitor: Pick<Visitor, "id" | "visited_at" | "called_at" | "returned_at">;
  visitorName: string;
};

type FollowUpCellProps = {
  label: string;
  date: string | null;
  withTime?: boolean;
  action: ReactNode;
};

function FollowUpCell({ label, date, withTime, action }: FollowUpCellProps) {
  const formattedDate =
    date && (withTime ? formatDateTimeFr(date) : formatDateFr(date));

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300/80 hover:shadow-md",
        date && "border-emerald-200/70 bg-emerald-50/25",
      )}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
            date
              ? "bg-[#DCFCE7] text-green-700 ring-1 ring-green-200/70"
              : "bg-[#FEE2E2] text-red-600 ring-1 ring-red-200/60",
          )}
        >
          {date ? "Oui" : "Non"}
        </span>

        {action}

        {formattedDate && (
          <span className="text-sm font-semibold leading-snug text-slate-800">
            {formattedDate}
          </span>
        )}
      </div>
    </div>
  );
}

export function FollowUpDetailPanel({
  visitor,
  visitorName,
}: FollowUpDetailPanelProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <FollowUpCell
        label="Visite programmée"
        date={visitor.visited_at}
        withTime
        action={
          <ScheduleVisitDialog
            variant="inline"
            visitorId={visitor.id}
            visitorName={visitorName}
            scheduledAt={visitor.visited_at}
          />
        }
      />
      <FollowUpCell
        label="Appel programmé"
        date={visitor.called_at}
        withTime
        action={
          <ScheduleCallDialog
            variant="inline"
            visitorId={visitor.id}
            visitorName={visitorName}
            scheduledAt={visitor.called_at}
          />
        }
      />
      <FollowUpCell
        label="Revenue"
        date={visitor.returned_at}
        action={
          <MarkReturnedDialog
            variant="inline"
            visitorId={visitor.id}
            visitorName={visitorName}
            returnedAt={visitor.returned_at}
          />
        }
      />
    </div>
  );
}
