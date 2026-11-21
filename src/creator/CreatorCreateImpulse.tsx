import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, CheckCircle2, CheckSquare, FileUp, Film, Link2, Plus, Trash2, Zap } from "lucide-react";
import { creator, type VideoFormat } from "@/data/mock";
import { formatAspect, formatLabel } from "@/lib/videoFormat";
import { channelPath } from "@/config";
import { cn } from "@/lib/cn";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { Toggle } from "@/components/ui/Toggle";
import { PageHeader, inputClass, labelClass } from "./CreatorLayout";

function Dropzone({ icon: Icon, title, hint, filled, onFill }: { icon: typeof Film; title: string; hint: string; filled: string | null; onFill: () => void }) {
  return (
    <button
      type="button"
      onClick={onFill}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border border-dashed p-4 text-left transition",
        filled ? "border-volt-500 bg-volt-200/40" : "border-ink-300 bg-paper hover:border-ink-900",
      )}
    >
      <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", filled ? "bg-ink-900 text-volt-400" : "bg-white text-ink-500")}>
        {filled ? <CheckCircle2 className="size-5" /> : <Icon className="size-5" />}
      </span>
      <span>
        <span className="block text-sm font-semibold">{filled ?? title}</span>
        <span className="block text-xs text-ink-400">{filled ? "Kliknij, żeby podmienić" : hint}</span>
      </span>
    </button>
  );
}

/** Kreator impulsu: tytuł, opis, wideo, narzędzie, plik i CTA w jednym formularzu. */
export default function CreatorCreateImpulse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState<string | null>(null);
  const [format, setFormat] = useState<VideoFormat>("9:16");
  const [file, setFile] = useState<string | null>(null);
  const [withTool, setWithTool] = useState(true);
  const [toolTitle, setToolTitle] = useState("");
  const [items, setItems] = useState<string[]>(["", ""]);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [notify, setNotify] = useState(true);
  const [published, setPublished] = useState(false);

  const link = `${channelPath(creator.slug)}/nowy-impuls`;
  const filledItems = items.filter((i) => i.trim());

  function publish(e: FormEvent) {
    e.preventDefault();
    setPublished(true);
    window.scrollTo({ top: 0 });
  }

  if (published) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-volt-400">
          <Zap className="size-7" fill="currentColor" strokeWidth={0} />
        </span>
        <h1 className="mt-6 text-3xl font-bold">Impuls opublikowany</h1>
        <p className="mt-2 text-ink-500">
          „{title}” jest już w kanale{notify ? ", a odbiorcy dostali powiadomienie" : ""}. Teraz zaproś resztę listy — wklej ten link w najbliższego maila.
        </p>
        <Card className="mt-6 flex items-center justify-between gap-3 p-3 pl-4 text-left">
          <span className="truncate text-sm font-medium">{link}</span>
          <CopyButton text={`https://${link}`} label="Kopiuj link" />
        </Card>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/studio/linki" className={buttonClass("dark")}>
            Przygotuj tekst do maila <ArrowRight className="size-4.5" />
          </Link>
          <Link to="/studio" className={buttonClass("outline")}>Wróć do dashboardu</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={publish}>
      <PageHeader
        title="Dodaj impuls"
        lead="Impuls to jedna myśl i jedno działanie: krótkie wideo, narzędzie do wdrożenia i wyraźny następny krok."
        action={
          <Button type="submit" disabled={!title.trim()}>
            <Zap className="size-4.5" fill="currentColor" strokeWidth={0} /> Opublikuj impuls
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-bold">1. O czym jest ten impuls</h2>
            <div className="mt-4 space-y-4">
              <label className={labelClass}>
                Tytuł
                <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="np. Jedno pytanie, które otwiera rozmowę sprzedażową" />
              </label>
              <label className={labelClass}>
                Opis
                <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Co odbiorca zrobi inaczej po obejrzeniu? Dwa zdania wystarczą." />
              </label>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold">2. Wideo</h2>
            <p className="mt-1 mb-4 text-sm text-ink-500">Najlepiej działają materiały 3–6 minut nagrane telefonem. Przyjmujemy wideo pionowe, kwadratowe i poziome.</p>
            <Dropzone icon={Film} title="Dodaj wideo" hint="MP4 lub MOV, do 2 GB" filled={video} onFill={() => setVideo("impuls-13.mp4 · 4:48")} />
            <div className="mt-4">
              <p className={labelClass}>Format</p>
              <div className="mt-1.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Format wideo">
                {(Object.keys(formatLabel) as VideoFormat[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={format === f}
                    onClick={() => setFormat(f)}
                    className={cn("flex items-center gap-3 rounded-xl border p-3 text-left transition", format === f ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-ink-300")}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center">
                      <span className={cn("block rounded-[3px] border-2 border-current", formatAspect[f], f === "16:9" ? "w-full" : "h-full")} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{f}</span>
                      <span className={cn("block text-xs", format === f ? "text-ink-300" : "text-ink-500")}>{formatLabel[f]}</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-400">Format rozpoznamy z pliku. W feedzie odbiorcy pionowe wideo wypełnia ekran, pozostałe są wyśrodkowane.</p>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">3. Narzędzie lub checklista</h2>
                <p className="mt-1 text-sm text-ink-500">To, co odbiorca odhacza u siebie. Pobranie liczy się do odblokowania czatu.</p>
              </div>
              <Toggle checked={withTool} onChange={setWithTool} label="Dodaj narzędzie" />
            </div>
            {withTool && (
              <div className="mt-4 space-y-3">
                <label className={labelClass}>
                  Nazwa narzędzia
                  <input className={inputClass} value={toolTitle} onChange={(e) => setToolTitle(e.target.value)} placeholder="np. Rozmowa sprzedażowa w 7 krokach" />
                </label>
                <div>
                  <p className={labelClass}>Punkty checklisty</p>
                  <ul className="mt-1.5 space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckSquare className="size-4.5 shrink-0 text-ink-300" />
                        <input
                          aria-label={`Punkt ${i + 1}`}
                          className={cn(inputClass, "mt-0")}
                          value={item}
                          onChange={(e) => setItems((list) => list.map((v, idx) => (idx === i ? e.target.value : v)))}
                          placeholder={`Punkt ${i + 1}`}
                        />
                        <button type="button" aria-label={`Usuń punkt ${i + 1}`} disabled={items.length <= 1} onClick={() => setItems((list) => list.filter((_, idx) => idx !== i))} className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-900/5 disabled:opacity-30">
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => setItems((list) => [...list, ""])}>
                    <Plus className="size-4" /> Dodaj punkt
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold">4. Plik do pobrania</h2>
            <p className="mt-1 mb-4 text-sm text-ink-500">Opcjonalnie: PDF, arkusz, nagranie lub inny materiał bonusowy.</p>
            <Dropzone icon={FileUp} title="Dodaj plik" hint="PDF, XLSX, DOCX, MP3 — do 200 MB" filled={file} onFill={() => setFile("mapa-rozmowy.pdf · 1,2 MB")} />
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold">5. CTA</h2>
            <p className="mt-1 text-sm text-ink-500">Jeden następny krok dla osób, które chcą więcej. Kliknięcia zobaczysz w analityce.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Tekst przycisku
                <input className={inputClass} value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="np. Umów konsultację" />
              </label>
              <label className={labelClass}>
                Link
                <input className={inputClass} type="url" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://" />
              </label>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-paper p-3.5">
              <Bell className="size-5 text-ink-400" />
              <p className="flex-1 text-sm font-medium">Wyślij powiadomienie do odbiorców kanału</p>
              <Toggle checked={notify} onChange={setNotify} label="Powiadomienie o impulsie" />
            </div>
          </Card>
        </div>

        {/* Podgląd na żywo — tak impuls zobaczy odbiorca */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">Podgląd u odbiorcy</p>
          <div className="rounded-[2rem] border border-line bg-white p-3 shadow-sm">
            <div className={cn("relative mx-auto flex items-center justify-center rounded-2xl", formatAspect[format], format === "9:16" && "max-h-80", video ? "bg-linear-to-br from-violet-600 to-ink-900 text-white" : "bg-paper text-ink-300")}>
              <Film className="size-7" />
            </div>
            <div className="px-1.5 pt-3 pb-1.5">
              <p className="text-[11px] font-semibold tracking-wide text-violet-600 uppercase">Impuls #13</p>
              <p className={cn("font-display text-lg leading-snug font-bold", !title && "text-ink-300")}>{title || "Tytuł impulsu"}</p>
              <p className={cn("mt-1 text-sm", description ? "text-ink-500" : "text-ink-300")}>{description || "Opis pojawi się tutaj."}</p>

              {withTool && (
                <div className="mt-3 rounded-xl bg-volt-200/60 p-3">
                  <p className="text-xs font-semibold text-volt-700">Checklista · {filledItems.length} {filledItems.length === 1 ? "punkt" : "punktów"}</p>
                  <p className="text-sm font-semibold">{toolTitle || "Nazwa narzędzia"}</p>
                </div>
              )}
              {file && (
                <p className="mt-2 flex items-center gap-2 rounded-xl bg-paper p-3 text-sm font-medium">
                  <FileUp className="size-4 text-ink-400" /> {file}
                </p>
              )}
              {ctaLabel && (
                <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-ink-900 py-2.5 text-sm font-semibold text-white">
                  <Link2 className="size-4" /> {ctaLabel}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
