"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Download } from "lucide-react";
import type { MonthStats } from "@/lib/visitors/month-stats";

type MonthStatsPrintViewProps = {
  stats: MonthStats;
  generatedAt: string;
};

export function MonthStatsPrintView({ stats, generatedAt }: MonthStatsPrintViewProps) {
  useEffect(() => {
    document.body.classList.add("report-print-mode");
    return () => document.body.classList.remove("report-print-mode");
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
      <div className="print-hide mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="dash-btn-primary h-10 px-5"
        >
          <Download className="size-4" />
          Imprimer / Enregistrer en PDF
        </button>
        <Link
          href={`/dashboard/stats/${stats.yearMonth}`}
          className="dash-btn-secondary h-10 px-5"
        >
          Retour au détail mois
        </Link>
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-col gap-5 border-b-2 border-blue-600 pb-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex shrink-0 justify-center sm:justify-start">
            <Image
              src="/cir-logo.png"
              alt="Communauté Internationale de la Rédemption"
              width={120}
              height={120}
              className="h-24 w-24 object-contain print:h-28 print:w-28"
              priority
            />
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
              CIR — Palais de Dieu · Cotonou
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              Statistiques mensuelles
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {stats.monthLabel} · Généré le {generatedAt}
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Accueillies en culte
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-950">
              {stats.totalCulte}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Fiches saisies
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-950">
              {stats.totalRegistered}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Dimanches
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-950">
              {stats.dimTotal}
            </p>
            <p className="text-xs text-slate-500">
              {stats.dimCultes} culte{stats.dimCultes > 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Mercredis
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-950">
              {stats.merTotal}
            </p>
            <p className="text-xs text-slate-500">
              {stats.merCultes} culte{stats.merCultes > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3 print:grid-cols-3">
          <div className="rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-bold uppercase text-slate-400">Visitées</p>
            <p className="text-xl font-bold text-slate-900">{stats.followUp.visited}</p>
          </div>
          <div className="rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-bold uppercase text-slate-400">Appelées</p>
            <p className="text-xl font-bold text-slate-900">{stats.followUp.called}</p>
          </div>
          <div className="rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-bold uppercase text-slate-400">Revenues</p>
            <p className="text-xl font-bold text-slate-900">{stats.followUp.returned}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
            Cultes du mois
          </h2>
          {stats.cultes.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Aucun accueil enregistré.</p>
          ) : (
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-500">
                    Date
                  </th>
                  <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-500">
                    Culte
                  </th>
                  <th className="px-2 py-2 text-right text-[11px] font-bold uppercase text-slate-500">
                    Accueillies
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.cultes.map((culte) => (
                  <tr key={culte.date} className="border-b border-slate-100">
                    <td className="px-2 py-2.5 font-medium text-slate-900">
                      {culte.dateLabel}
                    </td>
                    <td className="px-2 py-2.5 text-slate-600">{culte.typeLabel}</td>
                    <td className="px-2 py-2.5 text-right font-bold text-slate-900">
                      {culte.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </article>
    </div>
  );
}
