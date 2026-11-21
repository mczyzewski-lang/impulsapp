import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, Loader2, Plus, Send } from "lucide-react";
import { creator } from "@/data/mock";
import { channelPath } from "@/config";
import { platforms, publish, useSocialAccounts, type Destination } from "@/state/publishing";
import { useRecordings } from "@/state/recordings";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { inputClass } from "../CreatorLayout";
import { PlatformChip } from "./PlatformChip";

const signupUrl = channelPath(creator.slug).replace("/k/", "/s/");

/** Wartość dla <input type="datetime-local"> w czasie lokalnym. */
function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function slot(days: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/**
 * Publikacja po montażu: twórca zaznacza, gdzie wideo ma trafić (kanał Impulsu, social media),
 * i wybiera „teraz” albo termin. Układ pod telefon — jedna kolumna, główny przycisk na dole.
 */
export default function CreatorPublish() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recording = useRecordings().find((r) => r.id === id);
  const { accounts, demo, connecting, connect } = useSocialAccounts();

  const [selected, setSelected] = useState<Destination[]>(["impuls"]);
  const [caption, setCaption] = useState(recording ? `${recording.script.opener} ${recording.script.body}`.trim().slice(0, 220) : "");
  const [withLink, setWithLink] = useState(true);
  const [mode, setMode] = useState<"now" | "later">("later");
  const [when, setWhen] = useState(() => toLocalInput(slot(1, 18)));
  const [busy, setBusy] = useState(false);

  if (!recording) return <Navigate to="/studio/materialy" replace />;

  const isConnected = (platform: string) => accounts.some((a) => a.platform === platform);
  const toggle = (d: Destination) => setSelected((list) => (list.includes(d) ? list.filter((x) => x !== d) : [...list, d]));
  const quick = [
    { label: "Dziś 18:00", date: slot(0, 18) },
    { label: "Jutro 7:30", date: slot(1, 7, 30) },
    { label: "Jutro 18:00", date: slot(1, 18) },
  ].filter((q) => q.date.getTime() > Date.now());

  const scheduledAt = mode === "later" ? new Date(when) : null;
  const invalidDate = mode === "later" && (!when || Number.isNaN(scheduledAt!.getTime()) || scheduledAt!.getTime() < Date.now());

  async function submit() {
    setBusy(true);
    const social = selected.some((d) => d !== "impuls");
    await publish({
      recording: recording!,
      caption: withLink && social ? `${caption}\n\nWięcej: ${signupUrl}` : caption,
      destinations: selected,
      at: scheduledAt,
    });
    navigate("/studio/kalendarz", { state: { justAdded: true } });
  }

  return (
    <div className="mx-auto max-w-xl pb-28">
      <Link to={`/studio/montaz/${recording.id}`} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500">
        <ArrowLeft className="size-4" /> Studio wideo
      </Link>
      <h1 className="text-[1.75rem] leading-tight font-bold">Gdzie i kiedy publikujesz</h1>

      <Card className="mt-5 flex items-center gap-3 p-3">
        <video src={recording.src} poster={recording.image} muted playsInline preload="metadata" className="h-20 w-14 shrink-0 rounded-xl bg-ink-900 object-cover" />
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold">{recording.title}</p>
          <p className="mt-0.5 text-xs text-ink-400">Format {recording.format} · {Math.round(recording.duration)} s</p>
        </div>
      </Card>

      <h2 className="mt-7 mb-2 text-sm font-semibold text-ink-500">Miejsca publikacji</h2>
      <Card className="divide-y divide-line">
        <div className="flex items-center gap-3 p-3.5">
          <PlatformChip id="impuls" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">Kanał w Impulsie</p>
            <p className="truncate text-xs text-ink-400">{creator.channelName} · odbiorcy dostaną powiadomienie</p>
          </div>
          <Toggle checked={selected.includes("impuls")} onChange={() => toggle("impuls")} label="Publikuj w kanale Impulsu" />
        </div>
        {platforms.map((p) => {
          const account = accounts.find((a) => a.platform === p.id);
          return (
            <div key={p.id} className="flex items-center gap-3 p-3.5">
              <PlatformChip id={p.id} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{p.name}</p>
                <p className="truncate text-xs text-ink-400">{account ? account.handle || "Konto podpięte" : "Konto niepodpięte"}</p>
              </div>
              {isConnected(p.id) ? (
                <Toggle checked={selected.includes(p.id)} onChange={() => toggle(p.id)} label={`Publikuj: ${p.name}`} />
              ) : (
                <Button variant="outline" size="sm" disabled={connecting === p.id} onClick={() => void connect(p.id)}>
                  {connecting === p.id ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Połącz
                </Button>
              )}
            </div>
          );
        })}
      </Card>
      {demo && <p className="mt-2 text-xs text-ink-400">Tryb demo: konta są podpinane na niby, a publikacje w social mediach trafiają tylko do kalendarza.</p>}

      <h2 className="mt-7 mb-2 text-sm font-semibold text-ink-500">Opis</h2>
      <Card className="p-3.5">
        <textarea aria-label="Opis publikacji" className={cn(inputClass, "mt-0")} rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} />
        <div className="mt-3 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Dodaj link do strony zapisu</p>
            <p className="truncate text-xs text-ink-400">{signupUrl} — tylko w social mediach</p>
          </div>
          <Toggle checked={withLink} onChange={setWithLink} label="Dodaj link do strony zapisu" />
        </div>
      </Card>

      <h2 className="mt-7 mb-2 text-sm font-semibold text-ink-500">Termin</h2>
      <Card className="p-3.5">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-ink-900/5 p-1" role="radiogroup" aria-label="Termin publikacji">
          {(
            [
              ["now", "Teraz"],
              ["later", "Zaplanuj"],
            ] as const
          ).map(([value, label]) => (
            <button key={value} type="button" role="radio" aria-checked={mode === value} onClick={() => setMode(value)} className={cn("rounded-lg py-2.5 text-sm font-semibold transition", mode === value ? "bg-white shadow-sm" : "text-ink-500")}>
              {label}
            </button>
          ))}
        </div>
        {mode === "later" && (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {quick.map((q) => (
                <button key={q.label} type="button" onClick={() => setWhen(toLocalInput(q.date))} className={cn("rounded-full border px-3.5 py-2 text-sm font-semibold transition", when === toLocalInput(q.date) ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white")}>
                  {q.label}
                </button>
              ))}
            </div>
            <label className="mt-3 block text-sm font-semibold">
              Data i godzina
              <input type="datetime-local" className={inputClass} value={when} min={toLocalInput(new Date())} onChange={(e) => setWhen(e.target.value)} />
            </label>
            {invalidDate && <p className="mt-1.5 text-xs font-semibold text-rose-700">Wybierz termin w przyszłości.</p>}
          </>
        )}
      </Card>

      {/* Główny przycisk przyklejony do dołu — w zasięgu kciuka */}
      <div className="pb-safe-4 fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white/95 px-4 pt-3 backdrop-blur lg:left-64">
        <div className="mx-auto max-w-xl">
          <Button size="lg" className="w-full" disabled={busy || selected.length === 0 || invalidDate} onClick={() => void submit()}>
            {busy ? <Loader2 className="size-5 animate-spin" /> : mode === "later" ? <CalendarClock className="size-5" /> : <Send className="size-5" />}
            {selected.length === 0 ? "Wybierz miejsce publikacji" : `${mode === "later" ? "Zaplanuj" : "Opublikuj teraz"} · ${selected.length} ${selected.length === 1 ? "miejsce" : selected.length < 5 ? "miejsca" : "miejsc"}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
