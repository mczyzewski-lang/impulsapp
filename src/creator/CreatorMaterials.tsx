import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { files, impulseStats, nf, tools, videos } from "@/data/mock";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { VideoPoster } from "@/components/ui/VideoPoster";
import { PageHeader } from "./CreatorLayout";

const tabs = ["Wideo", "Narzędzia", "Pliki"] as const;
type Tab = (typeof tabs)[number];

const toolDownloads: Record<string, number> = { "rozmowa-7-krokow": 318, "follow-up-szablony": 289, "audyt-oferty": 402 };
const fileDownloads: Record<string, number> = { f1: 642, f2: 371, f3: 298, f4: 154, f5: 420 };

export default function CreatorMaterials() {
  const [tab, setTab] = useState<Tab>("Wideo");
  const counts: Record<Tab, number> = { Wideo: videos.length, Narzędzia: tools.length, Pliki: files.length };

  return (
    <div>
      <PageHeader
        title="Materiały"
        lead="Wszystko, co jest w Twoim kanale. Materiały zostają dostępne dla każdej nowej osoby, która dołączy."
        action={
          <Link to="/studio/impuls" className={buttonClass("dark")}>
            <Plus className="size-4.5" /> Dodaj impuls
          </Link>
        }
      />

      <div className="mb-4 inline-flex rounded-xl bg-ink-900/5 p-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", tab === t ? "bg-white text-ink-900 shadow-sm" : "text-ink-500")}
          >
            {t} <span className="ml-1 text-ink-400">{counts[t]}</span>
          </button>
        ))}
      </div>

      <Card className="divide-y divide-line">
        {tab === "Wideo" &&
          videos.map((v) => {
            const s = impulseStats.find((i) => i.id === v.id);
            return (
              <div key={v.id} className="flex items-center gap-4 p-3.5">
                <VideoPoster poster={v.poster} duration={v.duration} className="h-14 w-24 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{v.title}</p>
                  <p className="text-xs text-ink-400">{v.tag} · {v.date}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold tabular-nums">{nf.format(s?.views ?? 1102)}</p>
                  <p className="text-xs text-ink-400">obejrzeń</p>
                </div>
                <div className="hidden w-20 text-right sm:block">
                  <p className="text-sm font-semibold tabular-nums">{s?.completion ?? 84}%</p>
                  <p className="text-xs text-ink-400">do końca</p>
                </div>
                <Badge tone="green">Opublikowane</Badge>
              </div>
            );
          })}

        {tab === "Narzędzia" &&
          tools.map((t) => (
            <div key={t.id} className="flex items-center gap-4 p-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.title}</p>
                <p className="text-xs text-ink-400">{t.kind} · {t.items.length} punktów · {t.time}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">{toolDownloads[t.id]}</p>
                <p className="text-xs text-ink-400">pobrań</p>
              </div>
              <Badge tone="green" className="hidden sm:inline-flex">Opublikowane</Badge>
            </div>
          ))}

        {tab === "Pliki" &&
          files.map((f) => (
            <div key={f.id} className="flex items-center gap-4 p-3.5">
              <span className="inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-ink-900/5 text-[11px] font-bold text-ink-600">{f.format}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-ink-400">{f.size} · {f.date}</p>
              </div>
              {f.isBonus && <Badge tone="violet" className="hidden sm:inline-flex">Materiał na start</Badge>}
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">{fileDownloads[f.id]}</p>
                <p className="text-xs text-ink-400">pobrań</p>
              </div>
            </div>
          ))}
      </Card>
    </div>
  );
}
