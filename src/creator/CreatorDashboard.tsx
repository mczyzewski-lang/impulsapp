import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, Download, LockOpen, MousePointerClick, Play, Plus, Smartphone, Star, UserCheck, UserPlus,
} from "lucide-react";
import { activityLabels, activitySeries, answers, creator, funnel, kpis, members, nf, weeklyQuestion } from "@/data/mock";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AreaChart, Funnel } from "./charts";
import { PageHeader } from "./CreatorLayout";
import { SegmentBadge } from "./SegmentBadge";

const stats = [
  { label: "Zaproszeni", value: kpis.invited, delta: "+320", icon: UserPlus },
  { label: "Pobrali aplikację", value: kpis.installed, delta: "+118", icon: Smartphone },
  { label: "Aktywni odbiorcy", value: kpis.active, delta: "+144", icon: UserCheck, highlight: true },
  { label: "Obejrzenia wideo", value: kpis.videoViews, delta: "+702", icon: Play },
  { label: "Pobrania narzędzi", value: kpis.toolDownloads, delta: "+318", icon: Download },
  { label: "Kliknięcia CTA", value: kpis.ctaClicks, delta: "+96", icon: MousePointerClick },
  { label: "Odblokowali czat", value: kpis.chatUnlocked, delta: "+27", icon: LockOpen },
];

export default function CreatorDashboard() {
  const top = members.slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Dzień dobry, ${creator.name.split(" ")[0]}`}
        lead="Tak wygląda awans z Twojej listy emailowej do kanału ambasadorów. Zmiany z ostatnich 7 dni."
        action={
          <Link to="/studio/impuls" className={buttonClass("dark")}>
            <Plus className="size-4.5" /> Dodaj impuls
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value, delta, icon: Icon, highlight }) => (
          <Card key={label} className={highlight ? "border-ink-900 bg-ink-900 p-4 text-white" : "p-4"}>
            <div className="flex items-center justify-between">
              <span className={highlight ? "text-volt-400" : "text-ink-400"}>
                <Icon className="size-4.5" />
              </span>
              <span className={`inline-flex items-center text-xs font-semibold ${highlight ? "text-volt-400" : "text-emerald-600"}`}>
                <ArrowUpRight className="size-3.5" />
                {delta}
              </span>
            </div>
            <p className="mt-3 font-display text-[1.7rem] leading-none font-bold tabular-nums">{nf.format(value)}</p>
            <p className={`mt-1.5 text-sm ${highlight ? "text-ink-300" : "text-ink-500"}`}>{label}</p>
          </Card>
        ))}
        <Link to="/studio/linki" className="flex flex-col justify-between rounded-2xl border border-dashed border-ink-300 p-4 transition hover:border-ink-900 hover:bg-white">
          <span className="text-sm font-semibold">Zaproś kolejnych odbiorców</span>
          <span className="inline-flex items-center gap-1 text-sm text-violet-700">
            Wygeneruj link <ArrowRight className="size-4" />
          </span>
        </Link>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">Aktywni odbiorcy</h2>
              <p className="text-sm text-ink-500">Ostatnie 14 dni</p>
            </div>
            <p className="font-display text-2xl font-bold tabular-nums">{nf.format(kpis.active)}</p>
          </div>
          <AreaChart data={activitySeries} labels={activityLabels} className="mt-5" />
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="text-lg font-bold">Awans z listy emailowej</h2>
          <p className="mb-5 text-sm text-ink-500">Od zaproszenia do ambasadora</p>
          <Funnel steps={funnel} />
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Najbardziej zaangażowani odbiorcy</h2>
            <Link to="/studio/odbiorcy" className="text-sm font-semibold text-violet-700">Wszyscy</Link>
          </div>
          <ul className="divide-y divide-line">
            {top.map((m, i) => (
              <li key={m.id} className="flex items-center gap-3 py-3">
                <span className="w-4 text-sm font-semibold text-ink-400 tabular-nums">{i + 1}</span>
                <Avatar name={m.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.name}</p>
                  <p className="truncate text-xs text-ink-400">
                    {m.videos} wideo · {m.tools} narzędzi · {m.answers} odpowiedzi
                  </p>
                </div>
                <SegmentBadge segment={m.segment} />
                <span className="w-8 text-right font-display font-bold tabular-nums">{m.score}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Pytania i odpowiedzi</h2>
            <Link to="/studio/interakcje" className="text-sm font-semibold text-violet-700">Otwórz</Link>
          </div>
          <div className="rounded-xl bg-paper p-3.5">
            <p className="text-xs font-semibold text-violet-700">Twoje aktualne pytanie · 187 odpowiedzi</p>
            <p className="mt-1 text-sm font-semibold">{weeklyQuestion.text}</p>
          </div>
          <ul className="mt-1 divide-y divide-line">
            {answers.slice(0, 3).map((a) => {
              const member = members.find((m) => m.id === a.memberId)!;
              return (
                <li key={a.id} className="flex gap-3 py-3">
                  <Avatar name={member.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-xs text-ink-400">
                      <span className="font-semibold text-ink-900">{member.name}</span> · {a.time}
                      {a.starred && <Star className="size-3.5 text-amber-500" fill="currentColor" />}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-ink-600">{a.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
