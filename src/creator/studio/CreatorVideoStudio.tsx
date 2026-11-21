import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Captions, Check, ImagePlus, Loader2, Pause, Play, Scissors, Sparkles, Trash2 } from "lucide-react";
import { creator } from "@/data/mock";
import { generateInfographic, getCapabilities, transcribe, type Capabilities, type Caption } from "@/integrations/ai";
import { scriptText, useRecordings } from "@/state/recordings";
import { cn } from "@/lib/cn";
import { formatAspect } from "@/lib/videoFormat";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { PageHeader, inputClass } from "../CreatorLayout";

/* ───────────── Styl marki i infografiki ───────────── */

const accents = [
  { name: "Limonka", value: "#c8f542", ink: "#0b1020" },
  { name: "Fiolet", value: "#8b5cf6", ink: "#ffffff" },
  { name: "Błękit", value: "#38bdf8", ink: "#0b1020" },
  { name: "Bursztyn", value: "#f59e0b", ink: "#0b1020" },
];

interface Brand {
  accent: (typeof accents)[number];
  dark: boolean;
}

interface Infographic {
  id: string;
  kind: "Kroki" | "Cytat";
  title: string;
  points: string[];
  /** Sekunda nagrania, w której plansza się pojawia. */
  at: number;
  /** Obraz z OpenAI; bez niego plansza jest składana lokalnie. */
  image?: string;
}

const INFOGRAPHIC_SECONDS = 2.2;

function sentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Plansza w stylu marki — wersja składana lokalnie (tryb demo i podgląd przed generowaniem). */
function InfographicCard({ item, brand, className }: { item: Infographic; brand: Brand; className?: string }) {
  if (item.image) return <img src={item.image} alt={item.title} className={cn("rounded-2xl object-cover", className)} />;
  const surface = brand.dark ? { background: "#0b1020", color: "#ffffff" } : { background: "#ffffff", color: "#0b1020" };
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl p-[7%] shadow-2xl", className)} style={surface}>
      <span className="h-1.5 w-10 shrink-0 rounded-full" style={{ background: brand.accent.value }} />
      {item.kind === "Cytat" ? (
        <p className="my-auto font-display text-[1.15em] leading-tight font-bold text-balance">„{item.title}”</p>
      ) : (
        <>
          <p className="mt-[6%] font-display text-[1.05em] leading-tight font-bold text-balance">{item.title}</p>
          <ol className="mt-[6%] space-y-[5%]">
            {item.points.map((point, i) => (
              <li key={point} className="flex items-start gap-[4%] text-[0.72em] leading-snug font-medium">
                <span className="inline-flex size-[1.7em] shrink-0 items-center justify-center rounded-full text-[0.9em] font-bold" style={{ background: brand.accent.value, color: brand.accent.ink }}>
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="mt-auto pt-[6%] text-[0.55em] font-semibold tracking-wide uppercase opacity-60">{creator.channelName}</p>
    </div>
  );
}

const captionStyles = [
  { id: "pasek", label: "Pasek", className: "rounded-lg bg-black/70 px-3 py-1.5 text-white" },
  { id: "akcent", label: "Akcent marki", className: "rounded-lg px-3 py-1.5 font-extrabold uppercase" },
  { id: "czysty", label: "Czysty", className: "text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.9)]" },
] as const;
type CaptionStyle = (typeof captionStyles)[number]["id"];

const tabs = [
  { id: "trim", label: "Przycinanie", icon: Scissors },
  { id: "captions", label: "Napisy", icon: Captions },
  { id: "graphics", label: "Infografiki", icon: ImagePlus },
] as const;
type Tab = (typeof tabs)[number]["id"];

const time = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;

/**
 * Studio wideo: montaż nagrania zrobionego w aplikacji.
 * Przycinanie, napisy (ElevenLabs) i infografiki w stylu marki (OpenAI) — z podglądem na żywo.
 */
export default function CreatorVideoStudio() {
  const { id } = useParams();
  const recording = useRecordings().find((r) => r.id === id);

  const video = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(recording?.duration ?? 0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<Tab>("trim");
  const [caps, setCaps] = useState<Capabilities | null>(null);

  const [trim, setTrim] = useState({ start: 0, end: recording?.duration ?? 0 });

  const [captions, setCaptions] = useState<Caption[]>([]);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("akcent");
  const [captionsBusy, setCaptionsBusy] = useState(false);
  const [captionsDemo, setCaptionsDemo] = useState(false);

  const [brand, setBrand] = useState<Brand>({ accent: accents[0], dark: true });
  const [graphics, setGraphics] = useState<Infographic[]>([]);
  const [graphicsBusy, setGraphicsBusy] = useState<string | null>(null);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void getCapabilities().then(setCaps);
  }, []);

  const script = recording ? scriptText(recording.script) : "";
  const activeCaption = captionsOn ? captions.find((c) => current >= c.start && current < c.end) : undefined;
  const activeGraphic = graphics.find((g) => current >= g.at && current < g.at + INFOGRAPHIC_SECONDS);
  const styleClass = captionStyles.find((s) => s.id === captionStyle)!.className;

  const timelineMarks = useMemo(
    () => ({
      captions: captions.map((c) => ({ id: c.id, left: (c.start / duration) * 100, width: ((c.end - c.start) / duration) * 100 })),
      graphics: graphics.map((g) => ({ id: g.id, left: (g.at / duration) * 100, width: (INFOGRAPHIC_SECONDS / duration) * 100 })),
    }),
    [captions, graphics, duration],
  );

  if (!recording) return <Navigate to="/studio/materialy" replace />;

  function seek(seconds: number) {
    const el = video.current;
    if (!el) return;
    const target = Math.max(0, Math.min(duration, seconds));
    el.currentTime = target;
    // Stan ustawiamy z wartości docelowej — zanim wideo się załaduje, currentTime potrafi wrócić do zera.
    setCurrent(target);
  }

  function togglePlay() {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      if (el.currentTime < trim.start || el.currentTime >= trim.end - 0.05) el.currentTime = trim.start;
      void el.play();
    } else {
      el.pause();
    }
  }

  function onTimeUpdate() {
    const el = video.current;
    if (!el) return;
    // Podgląd odtwarza tylko wybrany fragment.
    if (el.currentTime >= trim.end) {
      el.pause();
      el.currentTime = trim.end;
    }
    setCurrent(el.currentTime);
  }

  function onLoaded() {
    const el = video.current;
    // Nagrania z MediaRecorder często nie mają zapisanej długości — wtedy bierzemy czas zmierzony przy nagrywaniu.
    const real = el && Number.isFinite(el.duration) && el.duration > 0 ? el.duration : recording!.duration;
    setDuration(real);
    setTrim({ start: 0, end: real });
  }

  async function makeCaptions() {
    setCaptionsBusy(true);
    const result = await transcribe({ blob: recording!.blob, script, duration });
    setCaptions(result.captions);
    setCaptionsDemo(result.demo);
    setCaptionsOn(true);
    setCaptionsBusy(false);
  }

  function makeGraphics() {
    const lines = sentences(recording!.script.body);
    const steps = lines.slice(0, 3).map((s) => s.replace(/[.!?]+$/, ""));
    const next: Infographic[] = [];
    if (steps.length) next.push({ id: "g-kroki", kind: "Kroki", title: recording!.script.opener.replace(/[.!?]+$/, ""), points: steps, at: +(duration * 0.3).toFixed(1) });
    const quote = lines[lines.length - 1] ?? recording!.script.opener;
    next.push({ id: "g-cytat", kind: "Cytat", title: quote.replace(/[.!?]+$/, ""), points: [], at: +(duration * 0.68).toFixed(1) });
    setGraphics(next);
  }

  async function renderWithAi(item: Infographic) {
    setGraphicsBusy(item.id);
    const image = await generateInfographic({
      title: item.title,
      points: item.points,
      brandName: creator.channelName,
      accentColor: brand.accent.value,
      dark: brand.dark,
    });
    if (image) setGraphics((list) => list.map((g) => (g.id === item.id ? { ...g, image } : g)));
    setGraphicsBusy(null);
  }

  const vertical = recording.format === "9:16";

  return (
    <div>
      <Link to="/studio/materialy" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500">
        <ArrowLeft className="size-4" /> Materiały
      </Link>
      <PageHeader
        title="Studio wideo"
        lead={recording.title}
        action={
          saved ? (
            <Link to="/studio/impuls" className={buttonClass("dark")}>
              <Check className="size-4.5" /> Zapisano — dodaj do impulsu
            </Link>
          ) : (
            <Button onClick={() => setSaved(true)}>
              <Check className="size-4.5" /> Zapisz montaż
            </Button>
          )
        }
      />

      {caps && (!caps.elevenlabs || !caps.openai) && (
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Tryb demo:{" "}
          {[!caps.elevenlabs && "napisy powstają z tekstu promptera zamiast z transkrypcji ElevenLabs", !caps.openai && "infografiki są składane lokalnie zamiast generowane przez OpenAI"]
            .filter(Boolean)
            .join(", a ")}
          . Po ustawieniu kluczy na serwerze studio użyje prawdziwych integracji.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* ── Podgląd ── */}
        <div className="min-w-0">
          <div className={cn("relative mx-auto overflow-hidden rounded-[1.75rem] bg-black text-white", formatAspect[recording.format], vertical ? "max-h-[620px]" : "w-full")}>
            <video
              ref={video}
              src={recording.src}
              poster={recording.image}
              playsInline
              preload="metadata"
              className="absolute inset-0 size-full object-cover"
              onLoadedMetadata={onLoaded}
              onTimeUpdate={onTimeUpdate}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />

            {activeGraphic && (
              <div className={cn("absolute inset-x-[8%] text-[clamp(13px,3.6vw,19px)]", vertical ? "top-[14%]" : "inset-y-[6%] left-auto w-[46%]")}>
                <InfographicCard item={activeGraphic} brand={brand} className={vertical ? "aspect-[4/5] w-full" : "h-full w-full"} />
              </div>
            )}

            {activeCaption && (
              <p className="absolute inset-x-4 bottom-[13%] flex justify-center text-center">
                <span className={cn("text-lg leading-snug font-bold", styleClass)} style={captionStyle === "akcent" ? { background: brand.accent.value, color: brand.accent.ink } : undefined}>
                  {activeCaption.text}
                </span>
              </p>
            )}

            <button type="button" onClick={togglePlay} aria-label={playing ? "Wstrzymaj" : "Odtwórz"} className="absolute inset-0 flex items-center justify-center">
              <span className={cn("inline-flex size-16 items-center justify-center rounded-full bg-black/45 backdrop-blur transition-opacity", playing ? "opacity-0" : "opacity-100")}>
                <Play className="ml-1 size-6" fill="currentColor" />
              </span>
            </button>
          </div>

          {/* ── Oś czasu ── */}
          <Card className="mt-4 p-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={togglePlay} aria-label={playing ? "Wstrzymaj" : "Odtwórz"} className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white">
                {playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="ml-0.5 size-4" fill="currentColor" />}
              </button>
              <span className="text-sm font-semibold tabular-nums">
                {time(current)} <span className="text-ink-400">/ {time(duration)}</span>
              </span>
              <span className="ml-auto text-xs text-ink-400">Fragment: {time(Math.max(0, trim.end - trim.start))}</span>
            </div>

            <div
              className="relative mt-4 h-16 cursor-pointer rounded-xl bg-ink-900/5"
              onClick={(e) => {
                const box = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - box.left) / box.width) * duration);
              }}
            >
              {duration > 0 && (
                <>
                  <div className="absolute inset-y-0 rounded-xl border-2 border-ink-900 bg-white" style={{ left: `${(trim.start / duration) * 100}%`, right: `${100 - (trim.end / duration) * 100}%` }} />
                  {timelineMarks.graphics.map((m) => (
                    <span key={m.id} className="absolute top-2 h-5 rounded-md bg-violet-500" style={{ left: `${m.left}%`, width: `${m.width}%` }} title="Infografika" />
                  ))}
                  {timelineMarks.captions.map((m) => (
                    <span key={m.id} className="absolute bottom-2 h-3 rounded-sm bg-volt-500" style={{ left: `calc(${m.left}% + 1px)`, width: `calc(${m.width}% - 2px)` }} />
                  ))}
                  <span className="absolute inset-y-0 w-0.5 bg-rose-500" style={{ left: `${(current / duration) * 100}%` }} />
                </>
              )}
            </div>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-violet-500" /> infografiki</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-volt-500" /> napisy</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm border-2 border-ink-900" /> wybrany fragment</span>
            </p>
          </Card>
        </div>

        {/* ── Narzędzia ── */}
        <div className="min-w-0">
          <div className="mb-4 inline-flex max-w-full overflow-x-auto rounded-xl bg-ink-900/5 p-1" role="tablist">
            {tabs.map(({ id: tabId, label, icon: Icon }) => (
              <button
                key={tabId}
                type="button"
                role="tab"
                aria-selected={tab === tabId}
                onClick={() => setTab(tabId)}
                className={cn("inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition", tab === tabId ? "bg-white text-ink-900 shadow-sm" : "text-ink-500")}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>

          {tab === "trim" && (
            <Card className="p-5">
              <h2 className="text-lg font-bold">Przytnij początek i koniec</h2>
              <p className="mt-1 text-sm text-ink-500">Usuń sięganie po telefon na starcie i ciszę na końcu. Podgląd odtwarza tylko wybrany fragment.</p>
              <label className="mt-5 block text-sm font-semibold">
                Początek: {time(trim.start)}
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={trim.start}
                  onChange={(e) => {
                    const start = Math.min(+e.target.value, trim.end - 0.5);
                    setTrim((t) => ({ ...t, start }));
                    seek(start);
                  }}
                  className="mt-2 w-full accent-ink-900"
                />
              </label>
              <label className="mt-4 block text-sm font-semibold">
                Koniec: {time(trim.end)}
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={trim.end}
                  onChange={(e) => {
                    const end = Math.max(+e.target.value, trim.start + 0.5);
                    setTrim((t) => ({ ...t, end }));
                    seek(end - 0.3);
                  }}
                  className="mt-2 w-full accent-ink-900"
                />
              </label>
            </Card>
          )}

          {tab === "captions" && (
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">Napisy</h2>
                  <p className="mt-1 text-sm text-ink-500">Większość osób ogląda bez dźwięku. ElevenLabs rozpoznaje mowę i dzieli ją na krótkie linie.</p>
                </div>
                {captions.length > 0 && <Toggle checked={captionsOn} onChange={setCaptionsOn} label="Pokaż napisy" />}
              </div>

              <Button variant="dark" className="mt-4" disabled={captionsBusy} onClick={() => void makeCaptions()}>
                {captionsBusy ? <Loader2 className="size-4.5 animate-spin" /> : <Sparkles className="size-4.5" />}
                {captions.length ? "Wygeneruj ponownie" : "Wygeneruj napisy"}
              </Button>
              {captions.length > 0 && captionsDemo && <p className="mt-2 text-xs text-ink-400">Wersja demo: napisy z tekstu promptera, rozłożone równo na czas nagrania.</p>}

              {captions.length > 0 && (
                <>
                  <p className="mt-5 text-sm font-semibold">Styl</p>
                  <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Styl napisów">
                    {captionStyles.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={captionStyle === s.id}
                        onClick={() => setCaptionStyle(s.id)}
                        className={cn("rounded-lg border px-3.5 py-2 text-sm font-semibold transition", captionStyle === s.id ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white")}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <ul className="mt-5 space-y-2">
                    {captions.map((c) => (
                      <li key={c.id} className="flex items-center gap-2">
                        <button type="button" onClick={() => seek(c.start)} className="w-12 shrink-0 text-left text-xs font-semibold text-violet-700 tabular-nums">
                          {time(c.start)}
                        </button>
                        <input
                          aria-label={`Napis od ${time(c.start)}`}
                          className={cn(inputClass, "mt-0 py-2")}
                          value={c.text}
                          onChange={(e) => setCaptions((list) => list.map((x) => (x.id === c.id ? { ...x, text: e.target.value } : x)))}
                        />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          )}

          {tab === "graphics" && (
            <Card className="p-5">
              <h2 className="text-lg font-bold">Infografiki w stylu marki</h2>
              <p className="mt-1 text-sm text-ink-500">Plansze, które pojawiają się w trakcie wideo i zostawiają w głowie najważniejsze punkty. Powstają z Twojej treści.</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                <div className="flex items-center gap-2" role="radiogroup" aria-label="Kolor marki">
                  {accents.map((a) => (
                    <button
                      key={a.name}
                      type="button"
                      role="radio"
                      aria-checked={brand.accent.name === a.name}
                      aria-label={a.name}
                      onClick={() => setBrand((b) => ({ ...b, accent: a }))}
                      className={cn("size-8 rounded-full border-2 transition", brand.accent.name === a.name ? "border-ink-900 ring-2 ring-ink-900/20" : "border-white")}
                      style={{ background: a.value }}
                    />
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm font-medium">
                  Ciemne tło
                  <Toggle checked={brand.dark} onChange={(dark) => setBrand((b) => ({ ...b, dark }))} label="Ciemne tło plansz" />
                </label>
              </div>

              <Button variant="dark" className="mt-4" onClick={makeGraphics}>
                <Sparkles className="size-4.5" /> {graphics.length ? "Ułóż ponownie z treści" : "Wygeneruj z treści"}
              </Button>

              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {graphics.map((g) => (
                  <li key={g.id} className="rounded-2xl border border-line p-3">
                    <div className="text-[15px]">
                      <InfographicCard item={g} brand={brand} className="aspect-[4/5] w-full" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Badge tone="violet">{g.kind}</Badge>
                      <button type="button" aria-label={`Usuń planszę: ${g.title}`} onClick={() => setGraphics((list) => list.filter((x) => x.id !== g.id))} className="inline-flex size-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-900/5">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <label className="mt-2 block text-xs font-semibold">
                      Pojawia się w {time(g.at)}
                      <input
                        type="range"
                        min={0}
                        max={Math.max(0, duration - INFOGRAPHIC_SECONDS)}
                        step={0.1}
                        value={g.at}
                        onChange={(e) => {
                          const at = +e.target.value;
                          setGraphics((list) => list.map((x) => (x.id === g.id ? { ...x, at } : x)));
                          seek(at + 0.1);
                        }}
                        className="mt-1.5 w-full accent-ink-900"
                      />
                    </label>
                    <Button variant="outline" size="sm" className="mt-2 w-full" disabled={!caps?.openai || graphicsBusy === g.id} onClick={() => void renderWithAi(g)}>
                      {graphicsBusy === g.id ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                      {caps?.openai ? "Wygeneruj grafikę AI" : "Grafika AI — wymaga OpenAI"}
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
