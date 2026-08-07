import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CalendarRange,
  Home,
  Phone,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { ChapelDay } from "@/components/icons/chapel-day";
import { ChapelNight } from "@/components/icons/chapel-night";
import { CulteCalendarSection } from "@/components/calendar/culte-calendar-section";
import { DashboardMonthPicker } from "@/components/dashboard/dashboard-month-picker";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { StatCard } from "@/components/stats/stat-card";
import { StatCardLink } from "@/components/stats/stat-card-link";
import { getCurrentAdmin } from "@/lib/auth/session";
import { resolveDashboardReferenceDate } from "@/lib/dashboard-month";
import { personnesFilterHref } from "@/lib/visitors/personnes-filters";
import {
  followUpRate,
  getDashboardStats,
} from "@/lib/visitors/dashboard-stats";
import { cn } from "@/lib/utils";

type DashboardPageRouteProps = {
  searchParams: Promise<{ month?: string }>;
};

export default async function DashboardPageRoute({
  searchParams,
}: DashboardPageRouteProps) {
  const params = await searchParams;
  const { referenceDate } = resolveDashboardReferenceDate(params.month);
  const calendarMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1,
  );

  const [stats, admin] = await Promise.all([
    getDashboardStats(referenceDate),
    getCurrentAdmin(),
  ]);

  const adminFirstName =
    admin?.name.split(" ").filter(Boolean)[0] ?? "Admin";
  const suivi = stats.followUp;
  const suiviHint = (count: number) =>
    suivi.totalRegistered > 0
      ? `${followUpRate(count, suivi.totalRegistered)}% sur ${suivi.totalRegistered} accueillie${suivi.totalRegistered > 1 ? "s" : ""}`
      : stats.isCurrentMonth
        ? "Aucune personne ce mois"
        : "Aucune personne sur ce mois";

  const maxBarCount = Math.max(...stats.culteBars.map((culte) => culte.count), 1);
  const monthScopeLabel = stats.isCurrentMonth
    ? "Statistiques du mois en cours"
    : `Statistiques — ${stats.monthLabel}`;
  const weekHint = stats.isCurrentMonth
    ? stats.totalSemaine > 0
      ? "Accueils de la semaine en cours"
      : "Semaine en cours"
    : stats.totalSemaine > 0
      ? "Accueils de la semaine"
      : "Aucun accueil cette semaine";

  return (
    <DashboardPage>
      <header className="livento-dashboard-hero">
        <div className="dash-hero-glow" aria-hidden />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="livento-hero-greeting">Bonjour, {adminFirstName}</p>
            <h1 className="livento-hero-title">Tableau de bord</h1>
            <p className="livento-hero-sub">
              Vue d&apos;ensemble du suivi
            </p>
          </div>
          <div className="livento-hero-date">
            <Sparkles className="size-3.5 text-blue-600" />
            {stats.monthLabel}
          </div>
        </div>
      </header>

      <section className="space-y-5">
        <div className="dash-section-head">
          <div>
            <h2 className="livento-section-title">Indicateurs clés</h2>
            <p className="livento-section-desc">{monthScopeLabel}</p>
          </div>
          <DashboardMonthPicker
            monthKey={stats.monthKey}
            monthLabel={stats.monthLabel}
          />
        </div>

        <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCardLink
            href={personnesFilterHref({
              type: "culte_date",
              date: stats.dernierDimanche.culteDateIso!,
              label: stats.dernierDimanche.date,
            })}
            enabled={
              stats.dernierDimanche.count > 0 &&
              stats.dernierDimanche.culteDateIso !== null
            }
          >
            <StatCard
              label="Dernier dimanche"
              value={stats.dernierDimanche.count}
              hint={
                stats.dernierDimanche.count > 0
                  ? stats.dernierDimanche.date
                  : "Aucun culte enregistré"
              }
              icon={ChapelDay}
              iconTone="amber"
              trendPercent={stats.dernierDimanche.trend ?? undefined}
              className={
                stats.dernierDimanche.count > 0 ? "cursor-pointer" : undefined
              }
            />
          </StatCardLink>
          <StatCardLink
            href={personnesFilterHref({
              type: "culte_date",
              date: stats.dernierMercredi.culteDateIso!,
              label: stats.dernierMercredi.date,
            })}
            enabled={
              stats.dernierMercredi.count > 0 &&
              stats.dernierMercredi.culteDateIso !== null
            }
          >
            <StatCard
              label="Dernier mercredi"
              value={stats.dernierMercredi.count}
              hint={
                stats.dernierMercredi.count > 0
                  ? stats.dernierMercredi.date
                  : "Aucun culte enregistré"
              }
              icon={ChapelNight}
              iconTone="indigo"
              trendPercent={stats.dernierMercredi.trend ?? undefined}
              className={
                stats.dernierMercredi.count > 0 ? "cursor-pointer" : undefined
              }
            />
          </StatCardLink>
          <StatCardLink
            href={
              stats.weekRange
                ? personnesFilterHref({
                    type: "culte_range",
                    from: stats.weekRange.from,
                    to: stats.weekRange.to,
                    label: weekHint,
                  })
                : "/dashboard/personnes"
            }
            enabled={stats.totalSemaine > 0 && stats.weekRange !== null}
          >
            <StatCard
              label="Total semaine"
              value={stats.totalSemaine}
              hint={weekHint}
              icon={CalendarRange}
              iconTone="blue"
              trendPercent={stats.evolutionSemaine ?? undefined}
              className={stats.totalSemaine > 0 ? "cursor-pointer" : undefined}
            />
          </StatCardLink>
          <StatCardLink
            href={personnesFilterHref({
              type: "registered_month",
              month: stats.monthKey,
              label: stats.monthLabel,
            })}
            enabled={stats.totalMois > 0}
          >
            <StatCard
              label={stats.isCurrentMonth ? "Ce mois" : "Total mois"}
              value={stats.totalMois}
              hint={stats.moisHint}
              icon={CalendarDays}
              iconTone="emerald"
              trendPercent={stats.evolutionMois ?? undefined}
              className={stats.totalMois > 0 ? "cursor-pointer" : undefined}
            />
          </StatCardLink>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="livento-section-title">Suivi pastoral</h2>
          <p className="livento-section-desc">
            Visitées, appelées et revenues — {stats.monthLabel.toLowerCase()}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard
            label="Visitées"
            value={suivi.visited}
            hint={suiviHint(suivi.visited)}
            icon={Home}
            iconTone="rose"
            trendPercent={suivi.visitedTrend ?? undefined}
          />
          <StatCard
            label="Appelées"
            value={suivi.called}
            hint={suiviHint(suivi.called)}
            icon={Phone}
            iconTone="blue"
            trendPercent={suivi.calledTrend ?? undefined}
          />
          <StatCard
            label="Revenues"
            value={suivi.returned}
            hint={suiviHint(suivi.returned)}
            icon={UserCheck}
            iconTone="emerald"
            trendPercent={suivi.returnedTrend ?? undefined}
          />
        </div>
      </section>

      <CulteCalendarSection
        key={stats.monthKey}
        monthKey={stats.monthKey}
        initialViewMonth={calendarMonth}
        culteReportsByDate={stats.culteReportsByDate}
      />

      <div className="livento-bento-grid lg:grid-cols-2">
        <section className="bento-card">
          <div className="dash-section-head">
            <div>
              <h2 className="livento-section-title">Performance</h2>
              <p className="livento-section-desc">
                Accueils par culte — {stats.monthLabel}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="livento-legend-dot bg-amber-500" />
                Dimanche
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="livento-legend-dot bg-indigo-500" />
                Mercredi
              </span>
            </div>
          </div>

          {stats.culteBars.length === 0 ? (
            <p className="livento-section-desc">
              Aucun accueil enregistré ce mois.
            </p>
          ) : (
            <div className="livento-performance-strip">
              {stats.culteBars.map((culte) => (
                <div key={`${culte.date}-${culte.type}`} className="livento-performance-item">
                  <span className="livento-performance-value">{culte.count}</span>
                  <div
                    className={cn(
                      "livento-performance-bar",
                      culte.type === "dim"
                        ? "livento-performance-bar-dim"
                        : "livento-performance-bar-mer",
                    )}
                    style={{
                      height: `${Math.max((culte.count / maxBarCount) * 48, 6)}px`,
                    }}
                  />
                  <span className="livento-performance-label">
                    {culte.type === "dim" ? "Dim." : "Mer."} {culte.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bento-card">
          <div className="mb-5">
            <h2 className="livento-section-title">Suivi programmé</h2>
            <p className="livento-section-desc">
              Visites pastorales planifiées — {stats.monthLabel.toLowerCase()}
            </p>
          </div>

          {stats.scheduledVisits.length === 0 ? (
            <p className="livento-section-desc">
              Aucune visite programmée sur ce mois.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {stats.scheduledVisits.map((person) => (
                <li key={person.id} className="activity-row">
                  <Link
                    href={`/dashboard/personnes/${person.id}`}
                    className="flex items-center gap-3 transition-opacity hover:opacity-80"
                  >
                    <div className="livento-avatar">
                      {person.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{person.name}</p>
                      <p className="flex items-center gap-1 livento-stat-hint">
                        <CalendarDays className="size-3 text-blue-600" />
                        {person.visitDateLabel}
                        {person.isPast && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            Passée
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/dashboard/personnes"
            className="livento-link-card group"
          >
            Voir toutes les personnes
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </section>
      </div>
    </DashboardPage>
  );
}
