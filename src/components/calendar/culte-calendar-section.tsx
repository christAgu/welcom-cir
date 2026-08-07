"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Users } from "lucide-react";
import { ChapelDay } from "@/components/icons/chapel-day";
import { ChapelNight } from "@/components/icons/chapel-night";
import { Button } from "@/components/ui/button";
import {
  type CulteDayReport,
  type CulteType,
} from "@/lib/culte-data";
import {
  addMonths,
  formatCulteDayLabel,
  formatMonthYear,
  getCalendarDays,
  getCulteType,
  toDateKey,
  WEEKDAYS_FR,
} from "@/lib/culte-utils";
import { cn } from "@/lib/utils";

type CulteCalendarSectionProps = {
  culteReportsByDate: Record<string, CulteDayReport>;
  initialViewMonth?: Date;
  monthKey?: string;
};

function getInitialSelectedKey(
  culteReportsByDate: Record<string, CulteDayReport>,
  viewMonth: Date,
): string | null {
  const prefix = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthKeys = Object.keys(culteReportsByDate)
    .filter((key) => key.startsWith(prefix))
    .sort((a, b) => b.localeCompare(a));

  if (monthKeys[0]) return monthKeys[0];

  const today = toDateKey(new Date());
  if (culteReportsByDate[today]) return today;

  const sortedKeys = Object.keys(culteReportsByDate).sort((a, b) =>
    b.localeCompare(a),
  );
  return sortedKeys[0] ?? null;
}

export function CulteCalendarSection({
  culteReportsByDate,
  initialViewMonth,
  monthKey,
}: CulteCalendarSectionProps) {
  const [viewMonth, setViewMonth] = useState(
    () => initialViewMonth ?? new Date(),
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(() =>
    getInitialSelectedKey(culteReportsByDate, initialViewMonth ?? new Date()),
  );

  const calendarDays = useMemo(
    () => getCalendarDays(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth],
  );

  const selectedReport = selectedKey
    ? culteReportsByDate[selectedKey] ?? null
    : null;

  return (
    <section className="bento-card culte-calendar-card">
      <div className="culte-calendar-card-header">
        <div>
          <h2 className="livento-section-title">Calendrier des cultes</h2>
          <p className="livento-section-desc">
            Dimanches et mercredis — sélectionnez une date
          </p>
        </div>
        <div className="culte-calendar-legend-inline">
          <span className="culte-legend-pill culte-legend-pill-dim">
            <ChapelDay className="size-3.5" />
            Dimanche
          </span>
          <span className="culte-legend-pill culte-legend-pill-mer">
            <ChapelNight className="size-3.5" />
            Mercredi
          </span>
        </div>
      </div>

      <div className="culte-calendar-layout">
        <div className="livento-calendar">
          <div className="livento-calendar-toolbar">
            <span className="livento-calendar-month">
              {formatMonthYear(viewMonth)}
            </span>
            <div className="livento-calendar-nav">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="livento-calendar-nav-btn"
                onClick={() => setViewMonth((m) => addMonths(m, -1))}
                aria-label="Mois précédent"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="livento-calendar-nav-btn"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                aria-label="Mois suivant"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="livento-calendar-weekdays">
            {WEEKDAYS_FR.map((day) => (
              <span key={day} className="livento-calendar-weekday">
                {day}
              </span>
            ))}
          </div>

          <div className="livento-calendar-grid">
            {calendarDays.map((date, i) => {
              if (!date) {
                return (
                  <div key={`empty-${i}`} className="livento-calendar-cell" />
                );
              }

              const dateKey = toDateKey(date);
              const culteType = getCulteType(date);
              const isCulte = culteType !== null;
              const isSelected = selectedKey === dateKey;
              const hasData = Boolean(culteReportsByDate[dateKey]);

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={!isCulte}
                  onClick={() => isCulte && setSelectedKey(dateKey)}
                  className={cn(
                    "livento-calendar-day",
                    isCulte && culteType === "dim" && "livento-calendar-day-dim",
                    isCulte && culteType === "mer" && "livento-calendar-day-mer",
                    isSelected && "livento-calendar-day-selected",
                    !isCulte && "livento-calendar-day-muted",
                  )}
                  aria-pressed={isSelected}
                >
                  {isCulte && culteType === "dim" && (
                    <ChapelDay className="livento-calendar-culte-icon" />
                  )}
                  {isCulte && culteType === "mer" && (
                    <ChapelNight className="livento-calendar-culte-icon" />
                  )}
                  <span className="livento-calendar-day-num">{date.getDate()}</span>
                  {isCulte && hasData && (
                    <span className="livento-calendar-dot" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <CulteDayReportPanel
          report={selectedReport}
          selectedKey={selectedKey}
          monthKey={monthKey}
        />
        <CulteMonthSummary
          viewMonth={viewMonth}
          culteReportsByDate={culteReportsByDate}
          monthKey={monthKey}
        />
      </div>
    </section>
  );
}

function CulteDayReportPanel({
  report,
  selectedKey,
  monthKey,
}: {
  report: CulteDayReport | null;
  selectedKey: string | null;
  monthKey?: string;
}) {
  if (!selectedKey) {
    return (
      <div className="livento-culte-report livento-culte-report-empty">
        <div className="culte-report-empty-icon">
          <ChapelDay className="size-5 text-amber-500/60" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Aucune date sélectionnée
        </p>
        <p className="livento-section-desc text-xs">
          Choisissez un dimanche ou un mercredi
        </p>
      </div>
    );
  }

  const type = report?.type ?? getCulteTypeFromKey(selectedKey);
  if (!type) return null;

  const title = formatCulteDayLabel(selectedKey, type);
  const count = report?.visitors.length ?? 0;

  return (
    <div
      className={cn(
        "livento-culte-report",
        type === "dim" ? "livento-culte-report-dim" : "livento-culte-report-mer",
      )}
    >
      <div className="livento-culte-report-header">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "culte-report-icon-wrap",
              type === "dim" ? "culte-report-icon-wrap-dim" : "culte-report-icon-wrap-mer",
            )}
          >
            {type === "dim" ? (
              <ChapelDay className="size-[18px]" />
            ) : (
              <ChapelNight className="size-[18px]" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="culte-count-badge">
                <Users className="size-3" />
                {count}
              </span>
              <span className="text-xs text-muted-foreground">
                personne{count > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        {count > 0 && monthKey && selectedKey && (
          <div className="flex shrink-0 gap-1.5">
            <Link
              href={`/dashboard/stats/${monthKey}/${selectedKey}`}
              className="livento-btn-outline inline-flex h-8 items-center gap-1.5 px-3 text-xs font-semibold"
            >
              Détail
            </Link>
            <Link
              href={`/dashboard/stats/${monthKey}/${selectedKey}/print`}
              target="_blank"
              rel="noopener noreferrer"
              className="livento-btn-outline inline-flex h-8 items-center gap-1.5 px-3 text-xs font-semibold"
            >
              <Download className="size-3.5" />
              PDF
            </Link>
          </div>
        )}
      </div>

      {count > 0 && report ? (
        <ul className="culte-report-list">
          {report.visitors.map((visitor, index) => (
            <li key={`${visitor.name}-${index}`} className="culte-report-row">
              <div className="livento-avatar culte-report-avatar">
                {visitor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {visitor.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {visitor.registeredBy}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="culte-report-no-data">
          Culte prévu — aucune fiche enregistrée.
        </p>
      )}
    </div>
  );
}

function getCulteTypeFromKey(dateKey: string): CulteType | null {
  const [y, m, d] = dateKey.split("-").map(Number);
  return getCulteType(new Date(y, m - 1, d));
}

function CulteMonthSummary({
  viewMonth,
  culteReportsByDate,
  monthKey,
}: {
  viewMonth: Date;
  culteReportsByDate: Record<string, CulteDayReport>;
  monthKey?: string;
}) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  const monthReports = Object.values(culteReportsByDate).filter((report) =>
    report.date.startsWith(prefix),
  );

  const dimReports = monthReports.filter((r) => r.type === "dim");
  const merReports = monthReports.filter((r) => r.type === "mer");
  const totalVisitors = monthReports.reduce(
    (sum, r) => sum + r.visitors.length,
    0,
  );
  const dimTotal = dimReports.reduce((sum, r) => sum + r.visitors.length, 0);
  const merTotal = merReports.reduce((sum, r) => sum + r.visitors.length, 0);

  return (
    <aside className="culte-month-summary" aria-label="Résumé du mois">
      <h3 className="culte-month-summary-title">Résumé du mois</h3>
      <p className="culte-month-summary-total">
        <span className="culte-month-summary-value">{totalVisitors}</span>
        <span className="culte-month-summary-label">accueillies au total</span>
      </p>
      <ul className="culte-month-summary-list">
        <li className="culte-month-summary-item culte-month-summary-item-dim">
          <ChapelDay className="size-4 shrink-0" />
          <div>
            <p className="culte-month-summary-item-label">Dimanches</p>
            <p className="culte-month-summary-item-value">
              {dimTotal} · {dimReports.length} culte{dimReports.length > 1 ? "s" : ""}
            </p>
          </div>
        </li>
        <li className="culte-month-summary-item culte-month-summary-item-mer">
          <ChapelNight className="size-4 shrink-0" />
          <div>
            <p className="culte-month-summary-item-label">Mercredis</p>
            <p className="culte-month-summary-item-value">
              {merTotal} · {merReports.length} culte{merReports.length > 1 ? "s" : ""}
            </p>
          </div>
        </li>
      </ul>
      {monthKey && (
        <Link
          href={`/dashboard/stats/${monthKey}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600"
        >
          Détail du mois
        </Link>
      )}
    </aside>
  );
}
