import { useState } from "react";
import { activityLabels, activitySeries, funnel, impulseStats, kpis, nf } from "@/data/mock";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { AreaChart, Bars, Funnel } from "./charts";
import { PageHeader } from "./CreatorLayout";

const ranges = ["7 dni", "14 dni", "30 dni"];

const weeklyUnlocks = [
  { label: "13 paź", value: 14 },
  { label: "20 paź", value: 19 },
  { label: "27 paź", value: 22 },
  { label: "3 lis", value: 31 },
  { label: "10 lis", value: 24 },
  { label: "17 lis", value: 27 },
];

export default function CreatorAnalytics() {
  const [range, setRange] = useState("14 dni");
  const rate = (a: number, b: number) => `${Math.round((a / b) * 100)}%`;

  const ratios = [
    { label: "Z listy do kanału", value: rate(kpis.installed, kpis.invited), hint: "zaproszeni → dołączyli" },
    { label: "Aktywni w kanale", value: rate(kpis.active, kpis.installed), hint: "w ostatnich 30 dniach" },
    { label: "Odblokowali czat", value: rate(kpis.chatUnlocked, kpis.active), hint: "spośród aktywnych" },
    { label: "Kliknięcia CTA", value: rate(kpis.ctaClicks, kpis.active), hint: "spośród aktywnych" },
  ];

  return (
    <div>
      <PageHeader
        title="Analityka"
        lead="Nie otwarcia, tylko działania: kto obejrzał, pobrał, odpowiedział i kliknął."
        action={
          <div className="inline-flex rounded-xl bg-ink-900/5 p-1">
            {ranges.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={range === r}
                onClick={() => setRange(r)}
                className={cn("rounded-lg px-3.5 py-1.5 text-sm font-semibold transition", range === r ? "bg-white shadow-sm" : "text-ink-500")}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ratios.map((r) => (
          <Card key={r.label} className="p-4">
            <p className="text-sm text-ink-500">{r.label}</p>
            <p className="mt-1.5 font-display text-3xl font-bold tabular-nums">{r.value}</p>
            <p className="mt-1 text-xs text-ink-400">{r.hint}</p>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h2 className="text-lg font-bold">Aktywni odbiorcy</h2>
          <p className="text-sm text-ink-500">Osoby, które obejrzały lub pobrały cokolwiek danego dnia · {range}</p>
          <AreaChart data={activitySeries} labels={activityLabels} className="mt-5" />
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-lg font-bold">Nowe odblokowania czatu</h2>
          <p className="mb-4 text-sm text-ink-500">Tygodniowo</p>
          <Bars data={weeklyUnlocks} />
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-lg font-bold">Lejek aktywacji</h2>
          <p className="mb-5 text-sm text-ink-500">Procent pokazuje przejście z poprzedniego etapu</p>
          <Funnel steps={funnel} />
        </Card>

        <Card className="lg:col-span-3">
          <div className="p-5 pb-2">
            <h2 className="text-lg font-bold">Skuteczność impulsów</h2>
            <p className="text-sm text-ink-500">Obejrzenia, pobrania narzędzi i kliknięcia CTA</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs text-ink-400">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Impuls</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Obejrzenia</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Do końca</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Pobrania</th>
                  <th className="px-5 py-2.5 text-right font-semibold">CTA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {impulseStats.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3">
                      <p className="font-semibold">{s.title}</p>
                      <p className="text-xs text-ink-400">{s.sent}</p>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{nf.format(s.views)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{s.completion}%</td>
                    <td className="px-3 py-3 text-right tabular-nums">{s.downloads || "—"}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{s.cta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
