import { useMemo, useState } from "react";
import { Gift, LockOpen, MessageCircle, Search } from "lucide-react";
import { members, nf, segmentCounts, segmentInfo, type Segment } from "@/data/mock";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageHeader } from "./CreatorLayout";
import { SegmentBadge, segmentDot } from "./SegmentBadge";

const segments: Segment[] = ["zimny", "ciepły", "aktywny", "ambasador"];

/** Odbiorcy: prosty CRM z lead scoringiem (zimny → ciepły → aktywny → ambasador). */
export default function CreatorAudience() {
  const [filter, setFilter] = useState<Segment | "wszyscy">("wszyscy");
  const [query, setQuery] = useState("");
  const total = segments.reduce((sum, s) => sum + segmentCounts[s], 0);

  const visible = useMemo(
    () =>
      members.filter(
        (m) =>
          (filter === "wszyscy" || m.segment === filter) &&
          (m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase())),
      ),
    [filter, query],
  );

  return (
    <div>
      <PageHeader title="Odbiorcy" lead="Każda osoba w kanale dostaje wynik zaangażowania od 0 do 100. Na jego podstawie trafia do jednego z czterech segmentów." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {segments.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={filter === s}
            onClick={() => setFilter(filter === s ? "wszyscy" : s)}
            className={cn("rounded-2xl border bg-white p-4 text-left transition", filter === s ? "border-ink-900 ring-2 ring-ink-900" : "border-line hover:border-ink-300")}
          >
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className={cn("size-2.5 rounded-full", segmentDot[s])} />
              {segmentInfo[s].label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums">{nf.format(segmentCounts[s])}</p>
            <p className="mt-1 text-xs text-ink-500">{segmentInfo[s].rule}</p>
          </button>
        ))}
      </div>

      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full" aria-hidden>
        {segments.map((s) => (
          <span key={s} className={segmentDot[s]} style={{ width: `${(segmentCounts[s] / total) * 100}%` }} />
        ))}
      </div>

      <Card className="mt-6">
        <div className="flex flex-col gap-3 border-b border-line p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block sm:w-72">
            <span className="sr-only">Szukaj odbiorcy</span>
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj po imieniu lub emailu"
              className="h-10 w-full rounded-lg border border-line bg-paper pr-3 pl-9 text-sm outline-none focus:border-ink-900 focus:bg-white"
            />
          </label>
          <p className="text-sm text-ink-500">
            {filter === "wszyscy" ? "Wszyscy odbiorcy" : `Segment: ${segmentInfo[filter].label}`} · pokazano {visible.length}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-ink-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Odbiorca</th>
                <th className="px-3 py-3 font-semibold">Segment</th>
                <th className="px-3 py-3 font-semibold">Wynik</th>
                <th className="px-3 py-3 text-right font-semibold">Wideo</th>
                <th className="px-3 py-3 text-right font-semibold">Narzędzia</th>
                <th className="px-3 py-3 text-right font-semibold">CTA</th>
                <th className="px-3 py-3 font-semibold">Czat</th>
                <th className="px-4 py-3 font-semibold">Ostatnio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((m) => (
                <tr key={m.id} className="hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{m.name}</p>
                        <p className="truncate text-xs text-ink-400">{m.source}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><SegmentBadge segment={m.segment} /></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 font-semibold tabular-nums">{m.score}</span>
                      <ProgressBar value={m.score} className="w-16" barClassName="bg-ink-900" label={`Wynik ${m.name}`} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{m.videos}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{m.tools}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{m.cta}</td>
                  <td className="px-3 py-3">
                    {m.chat ? <LockOpen className="size-4 text-volt-700" aria-label="Odblokowany" /> : <span className="text-ink-300">—</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-500">{m.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <p className="p-8 text-center text-sm text-ink-400">Brak odbiorców dla tych kryteriów.</p>}
        </div>
      </Card>
    </div>
  );
}

/** Ambasadorzy: najbardziej zaangażowani odbiorcy i szybkie akcje. */
export function CreatorAmbassadors() {
  const ambassadors = members.filter((m) => m.segment === "ambasador");
  const rising = members.filter((m) => m.segment === "aktywny");

  return (
    <div>
      <PageHeader
        title="Ambasadorzy"
        lead={`${segmentCounts.ambasador} osoby wracają co tydzień, odpowiadają na pytania i klikają Twoje CTA. To oni najchętniej polecą Cię dalej.`}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ambassadors.map((m) => (
          <Card key={m.id} className="p-5">
            <div className="flex items-center gap-3">
              <Avatar name={m.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-bold">{m.name}</p>
                <p className="truncate text-xs text-ink-400">Z kampanii: {m.source}</p>
              </div>
              <span className="rounded-xl bg-volt-400 px-2.5 py-1 font-display text-lg font-bold tabular-nums">{m.score}</span>
            </div>
            <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                ["Wideo", m.videos],
                ["Narzędzia", m.tools],
                ["Odpowiedzi", m.answers],
                ["CTA", m.cta],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-paper py-2">
                  <dd className="font-display font-bold tabular-nums">{value}</dd>
                  <dt className="text-[11px] text-ink-500">{label}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex gap-2">
              <Button variant="dark" size="sm" className="flex-1">
                <MessageCircle className="size-4" /> Napisz
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Gift className="size-4" /> Wyślij bonus
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-9 mb-3 text-lg font-bold">Blisko awansu</h2>
      <Card className="divide-y divide-line">
        {rising.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-3.5">
            <Avatar name={m.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{m.name}</p>
              <p className="text-xs text-ink-400">Brakuje {85 - m.score} pkt do ambasadora</p>
            </div>
            <ProgressBar value={m.score} max={85} className="hidden w-32 sm:block" barClassName="bg-violet-500" label={`Postęp ${m.name}`} />
            <SegmentBadge segment={m.segment} />
          </div>
        ))}
      </Card>
    </div>
  );
}
