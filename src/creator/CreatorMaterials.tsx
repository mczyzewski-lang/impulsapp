import { useState } from "react";
import { Link } from "react-router-dom";
import { Clapperboard, Plus, Video as VideoIcon } from "lucide-react";
import { files, impulseStats, nf, tools, videos } from "@/data/mock";
import { useRecordings } from "@/state/recordings";
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
  const recordings = useRecordings();
  // Nagrania zrobione w aplikacji, których jeszcze nie ma w kanale.
  const drafts = recordings.filter((r) => !videos.some((v) => v.id === r.id));
  const counts: Record<Tab, number> = { Wideo: videos.length, Narzędzia: tools.length, Pliki: files.length };

  return (
    <div>
      <PageHeader
        title="Materiały"
        lead="Wszystko, co jest w Twoim kanale. Materiały zostają dostępne dla każdej nowej osoby, która dołączy."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/studio/nagraj" className={buttonClass("outline")}>
              <VideoIcon className="size-4.5" /> Nagraj wideo
            </Link>
            <Link to="/studio/impuls" className={buttonClass("dark")}>
              <Plus className="size-4.5" /> Dodaj impuls
            </Link>
          </div>
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
          drafts.map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-3.5">
              <video src={r.src} poster={r.image} muted playsInline preload="metadata" className="h-14 w-24 shrink-0 rounded-xl bg-ink-900 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{r.title}</p>
                <p className="text-xs text-ink-400">Nagrane w aplikacji · {r.createdAt} · format {r.format}</p>
              </div>
              <Link to={`/studio/montaz/${r.id}`} className={buttonClass("dark", "sm")}>
                <Clapperboard className="size-4" /> Studio wideo
              </Link>
              <Badge tone="amber">Szkic</Badge>
            </div>
          ))}

        {tab === "Wideo" &&
          videos.map((v) => {
            const s = impulseStats.find((i) => i.id === v.id);
            return (
              <div key={v.id} className="flex items-center gap-4 p-3.5">
                <VideoPoster poster={v.poster} image={v.image} duration={v.duration} className="h-14 w-24 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{v.title}</p>
                  <p className="text-xs text-ink-400">{v.tag} · {v.date} · format {v.format}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold tabular-nums">{nf.format(s?.views ?? 1102)}</p>
                  <p className="text-xs text-ink-400">obejrzeń</p>
                </div>
                <div className="hidden w-20 text-right sm:block">
                  <p className="text-sm font-semibold tabular-nums">{s?.completion ?? 84}%</p>
                  <p className="text-xs text-ink-400">do końca</p>
                </div>
                {/* Tylko materiały nagrane w aplikacji da się otworzyć w studiu */}
                {recordings.some((r) => r.id === v.id) && (
                  <Link to={`/studio/montaz/${v.id}`} className={buttonClass("outline", "sm")}>
                    <Clapperboard className="size-4" /> <span className="hidden sm:inline">Studio wideo</span>
                  </Link>
                )}
                <Badge tone="green" className="hidden md:inline-flex">Opublikowane</Badge>
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
