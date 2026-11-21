import { useState } from "react";
import { Check, Lock, Minus, Plus, Upload } from "lucide-react";
import { creator, videos } from "@/data/mock";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { VideoPoster } from "@/components/ui/VideoPoster";
import { PageHeader, inputClass, labelClass } from "./CreatorLayout";

function Stepper({ value, onChange, min = 0, max = 10 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-line bg-white">
      <button type="button" aria-label="Mniej" disabled={value <= min} onClick={() => onChange(value - 1)} className="inline-flex size-10 items-center justify-center disabled:opacity-30">
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center font-display font-bold tabular-nums">{value}</span>
      <button type="button" aria-label="Więcej" disabled={value >= max} onClick={() => onChange(value + 1)} className="inline-flex size-10 items-center justify-center disabled:opacity-30">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

const chatModes = [
  { id: "one", title: "Jedna wiadomość na impuls", body: "Odbiorca wysyła jedną przemyślaną wiadomość po każdym impulsie." },
  { id: "answers", title: "Tylko odpowiedzi na moje pytania", body: "Odbiorcy odpowiadają na pytania, ale nie piszą pierwsi." },
  { id: "open", title: "Otwarte wiadomości", body: "Bez limitu. Polecane tylko przy małych kanałach." },
];

/** Mój kanał: tożsamość kanału, wideo powitalne i warunki odblokowania czatu. */
export default function CreatorChannelSettings() {
  const [name, setName] = useState(creator.channelName);
  const [promise, setPromise] = useState(creator.promise);
  const [rules, setRules] = useState({ videos: 3, tools: 1, answers: 1 });
  const [chatEnabled, setChatEnabled] = useState(true);
  const [mode, setMode] = useState("one");
  const [saved, setSaved] = useState(false);

  const conditions = [
    { key: "videos" as const, label: "Obejrzane materiały wideo", unit: (n: number) => `Obejrzyj ${n} ${n === 1 ? "materiał" : "materiały"} wideo` },
    { key: "tools" as const, label: "Pobrane narzędzia", unit: (n: number) => `Pobierz ${n} ${n === 1 ? "narzędzie" : "narzędzia"}` },
    { key: "answers" as const, label: "Odpowiedzi na pytania twórcy", unit: (n: number) => `Odpowiedz na ${n} ${n === 1 ? "pytanie" : "pytania"} od twórcy` },
  ];
  const active = conditions.filter((c) => rules[c.key] > 0);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <PageHeader
        title="Mój kanał"
        lead="To widzi odbiorca, który kliknie Twój link. Ustaw obietnicę kanału, powitanie i zasady interakcji."
        action={
          <Button variant="dark" onClick={save}>
            {saved && <Check className="size-4.5" />}
            {saved ? "Zapisano" : "Zapisz zmiany"}
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-bold">Kanał</h2>
            <div className="mt-4 space-y-4">
              <label className={labelClass}>
                Nazwa kanału
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className={labelClass}>
                Obietnica kanału
                <textarea className={inputClass} rows={2} value={promise} onChange={(e) => setPromise(e.target.value)} />
                <span className="mt-1 block text-xs font-normal text-ink-400">Jedno zdanie: co odbiorca będzie umiał lub miał dzięki Twoim impulsom.</span>
              </label>
              <label className={labelClass}>
                Rytm publikacji
                <input className={inputClass} defaultValue={creator.cadence} />
              </label>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold">Wideo powitalne</h2>
            <p className="mt-1 text-sm text-ink-500">Pierwsza rzecz, którą widzi nowa osoba w kanale. Najlepiej 1–3 minuty.</p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <VideoPoster poster={videos[0].poster} duration={videos[0].duration} className="aspect-video w-full sm:w-56" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{videos[0].title}</p>
                <p className="mt-0.5 text-xs text-ink-400">Obejrzało 84% nowych odbiorców</p>
                <Button variant="outline" size="sm" className="mt-3">
                  <Upload className="size-4" /> Podmień wideo
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Warunki odblokowania czatu</h2>
                <p className="mt-1 text-sm text-ink-500">Czat dostają odbiorcy, którzy spełnią wszystkie warunki. Zero wyłącza warunek.</p>
              </div>
              <Toggle checked={chatEnabled} onChange={setChatEnabled} label="Czat w kanale" />
            </div>

            <div className={cn("mt-4 divide-y divide-line transition", !chatEnabled && "pointer-events-none opacity-40")}>
              {conditions.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-4 py-3">
                  <span className="text-[15px] font-medium">{c.label}</span>
                  <Stepper value={rules[c.key]} onChange={(n) => setRules((r) => ({ ...r, [c.key]: n }))} />
                </div>
              ))}
            </div>

            <h3 className="mt-5 text-base font-bold">Sposób interakcji</h3>
            <div className={cn("mt-3 grid gap-2.5 sm:grid-cols-3", !chatEnabled && "pointer-events-none opacity-40")} role="radiogroup" aria-label="Sposób interakcji">
              {chatModes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={cn("rounded-xl border p-3.5 text-left transition", mode === m.id ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-ink-300")}
                >
                  <p className="text-sm font-semibold">{m.title}</p>
                  <p className={cn("mt-1 text-xs", mode === m.id ? "text-ink-300" : "text-ink-500")}>{m.body}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Podgląd na żywo */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">Podgląd zaproszenia</p>
          <div className="rounded-3xl bg-ink-900 p-5 text-center text-white">
            <Avatar name={creator.name} size="lg" className="ring-4 ring-white/10" />
            <p className="mt-3 text-xs text-ink-300">{creator.name} zaprasza Cię do kanału</p>
            <p className="mt-0.5 font-display text-xl leading-tight font-bold">{name || "Nazwa kanału"}</p>
            <p className="mt-2 text-sm text-ink-300">{promise}</p>

            {chatEnabled && active.length > 0 && (
              <div className="mt-5 rounded-2xl bg-white/5 p-3.5 text-left">
                <p className="flex items-center gap-2 text-xs font-semibold">
                  <Lock className="size-3.5 text-volt-400" /> Odblokuj czat z twórcą: 0/{active.length} kroków
                </p>
                <ul className="mt-2.5 space-y-1.5 text-xs text-ink-300">
                  {active.map((c) => (
                    <li key={c.key} className="flex items-center gap-2">
                      <span className="size-3.5 rounded-full border border-white/30" />
                      {c.unit(rules[c.key])}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-5 rounded-xl bg-volt-400 py-3 text-sm font-bold text-ink-950">Odbierz materiał i dołącz do kanału</div>
          </div>
        </div>
      </div>
    </div>
  );
}
