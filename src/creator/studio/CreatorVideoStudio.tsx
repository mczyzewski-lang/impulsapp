import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowLeftToLine, ArrowRightToLine, Captions, Check, Film, ImagePlus, Loader2, Pause, Play, Plus, Scissors, Sparkles, Trash2 } from "lucide-react";
import { creator } from "@/data/mock";
import { generateInfographic, getCapabilities, transcribe, type Capabilities, type Caption } from "@/integrations/ai";
import { scriptText, useRecordings } from "@/state/recordings";
import { cn } from "@/lib/cn";
import { formatAspect } from "@/lib/videoFormat";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { inputClass } from "../CreatorLayout";

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
  { id: "clips", label: "Klipy", icon: Film },
  { id: "captions", label: "Napisy", icon: Captions },
  { id: "graphics", label: "Infografiki", icon: ImagePlus },
] as const;
type Tab = (typeof tabs)[number]["id"];

const time = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;

/* ───────────── Klipy na osi czasu ───────────── */

/** Fragment montażu: źródło wideo i wybrany z niego zakres. */
interface Clip {
  id: string;
  src: string;
  label: string;
  /** Długość całego pliku źródłowego. */
  duration: number;
  start: number;
  end: number;
}

const MIN_CLIP = 0.3;
const clipLength = (c: Clip) => c.end - c.start;
const newClipId = () => `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/** Odczytuje długość pliku wideo wybranego z urządzenia. */
function probeDuration(src: string): Promise<number> {
  return new Promise((resolve) => {
    const el = document.createElement("video");
    el.preload = "metadata";
    el.muted = true;
    const done = (value: number) => resolve(Number.isFinite(value) && value > 0 ? value : 5);
    el.onloadedmetadata = () => done(el.duration);
    el.onerror = () => done(5);
    el.src = src;
  });
}

/**
 * Studio wideo: montaż nagrania zrobionego w aplikacji.
 * Klipy (własne fragmenty, cięcie, przycinanie, kolejność), napisy (ElevenLabs)
 * i infografiki w stylu marki (OpenAI) — z podglądem na żywo. Układ pod telefon:
 * podgląd i oś czasu na górze, narzędzia pod spodem.
 */
export default function CreatorVideoStudio() {
  const { id } = useParams();
  const recording = useRecordings().find((r) => r.id === id);

  const video = useRef<HTMLVideoElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  /** Skok do wykonania, gdy nowe źródło wideo się załaduje. */
  const pending = useRef<{ time: number; play: boolean } | null>(null);

  const [clips, setClips] = useState<Clip[]>(() =>
    recording ? [{ id: newClipId(), src: recording.src, label: "Nagranie", duration: recording.duration, start: 0, end: recording.duration }] : [],
  );
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<Tab>("clips");
  const [caps, setCaps] = useState<Capabilities | null>(null);

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

  /* ── Czas montażu: suma długości klipów ── */
  const offsets = useMemo(() => {
    let sum = 0;
    return clips.map((c) => {
      const at = sum;
      sum += clipLength(c);
      return at;
    });
  }, [clips]);
  const duration = clips.reduce((sum, c) => sum + clipLength(c), 0);
  const active = clips[Math.min(index, clips.length - 1)];

  const script = recording ? scriptText(recording.script) : "";
  const activeCaption = captionsOn ? captions.find((c) => current >= c.start && current < c.end) : undefined;
  const activeGraphic = graphics.find((g) => current >= g.at && current < g.at + INFOGRAPHIC_SECONDS);
  const styleClass = captionStyles.find((s) => s.id === captionStyle)!.className;

  if (!recording || !active) return <Navigate to="/studio/materialy" replace />;

  /** Przechodzi do klipu `i` w chwili `local` jego źródła. */
  function goTo(list: Clip[], i: number, local: number, play: boolean) {
    const el = video.current;
    const target = list[i];
    if (!el || !target) return;
    if (el.getAttribute("src") === target.src) {
      el.currentTime = local;
      if (play) void el.play().catch(() => undefined);
    } else {
      // Inne źródło: skok wykonamy po załadowaniu nowego pliku.
      pending.current = { time: local, play };
    }
    setIndex(i);
  }

  function seek(seconds: number, play = false) {
    const target = Math.max(0, Math.min(duration - 0.01, seconds));
    let i = offsets.findIndex((at, n) => target >= at && target < at + clipLength(clips[n]));
    if (i < 0) i = clips.length - 1;
    goTo(clips, i, clips[i].start + (target - offsets[i]), play);
    setCurrent(target);
  }

  function togglePlay() {
    const el = video.current;
    if (!el) return;
    if (!el.paused) return el.pause();
    if (current >= duration - 0.05) seek(0, true);
    else void el.play().catch(() => undefined);
  }

  function onTimeUpdate() {
    const el = video.current;
    if (!el || pending.current) return;
    if (el.currentTime >= active.end - 0.03) {
      // Koniec klipu: następny albo koniec montażu.
      if (index < clips.length - 1) goTo(clips, index + 1, clips[index + 1].start, !el.paused);
      else {
        el.pause();
        setCurrent(duration);
      }
      return;
    }
    setCurrent(offsets[index] + Math.max(0, el.currentTime - active.start));
  }

  function onLoaded() {
    const el = video.current;
    if (!el) return;
    // Nagrania z MediaRecorder często nie mają zapisanej długości — wtedy zostaje czas zmierzony przy nagrywaniu.
    const real = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : null;
    if (real && Math.abs(real - active.duration) > 0.05) {
      setClips((list) => list.map((c) => (c.src === active.src ? { ...c, duration: real, end: c.end === c.duration ? real : Math.min(c.end, real) } : c)));
    }
    const jump = pending.current ?? { time: active.start, play: false };
    pending.current = null;
    el.currentTime = jump.time;
    if (jump.play) void el.play().catch(() => undefined);
  }

  /* ── Operacje na klipach ── */

  const local = active.start + (current - offsets[index]);
  const canSplit = local - active.start > MIN_CLIP && active.end - local > MIN_CLIP;

  function split() {
    if (!canSplit) return;
    video.current?.pause();
    const next = [...clips];
    next.splice(index, 1, { ...active, end: local }, { ...active, id: newClipId(), start: local });
    setClips(next);
    setIndex(index + 1);
  }

  function removeActive() {
    if (clips.length < 2) return;
    video.current?.pause();
    const next = clips.filter((_, i) => i !== index);
    const i = Math.min(index, next.length - 1);
    setClips(next);
    goTo(next, i, next[i].start, false);
    setCurrent(next.slice(0, i).reduce((sum, c) => sum + clipLength(c), 0));
  }

  function move(direction: -1 | 1) {
    const to = index + direction;
    if (to < 0 || to >= clips.length) return;
    const next = [...clips];
    [next[index], next[to]] = [next[to], next[index]];
    setClips(next);
    setIndex(to);
    setCurrent(next.slice(0, to).reduce((sum, c) => sum + clipLength(c), 0) + (local - active.start));
  }

  function trimActive(patch: Partial<Pick<Clip, "start" | "end">>) {
    video.current?.pause();
    const updated = { ...active, ...patch };
    setClips((list) => list.map((c) => (c.id === active.id ? updated : c)));
    const at = patch.start !== undefined ? updated.start : Math.max(updated.start, updated.end - 0.3);
    if (video.current) video.current.currentTime = at;
    setCurrent(offsets[index] + (at - updated.start));
  }

  async function addFile(file: File | undefined) {
    if (!file) return;
    video.current?.pause();
    const src = URL.createObjectURL(file);
    const length = await probeDuration(src);
    const clip: Clip = { id: newClipId(), src, label: file.name.replace(/\.[^.]+$/, "").slice(0, 24) || "Fragment", duration: length, start: 0, end: length };
    // Nowy fragment trafia za aktualny klip.
    const next = [...clips];
    next.splice(index + 1, 0, clip);
    setClips(next);
    goTo(next, index + 1, 0, false);
    setCurrent(next.slice(0, index + 1).reduce((sum, c) => sum + clipLength(c), 0));
    if (fileInput.current) fileInput.current.value = "";
  }

  /* ── Napisy i infografiki ── */

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
    const image = await generateInfographic({ title: item.title, points: item.points, brandName: creator.channelName, accentColor: brand.accent.value, dark: brand.dark });
    if (image) setGraphics((list) => list.map((g) => (g.id === item.id ? { ...g, image } : g)));
    setGraphicsBusy(null);
  }

  const vertical = recording.format === "9:16";

  return (
    <div>
      {/* Zwarty nagłówek: na telefonie liczy się każdy wiersz nad podglądem */}
      <div className="mb-3 flex items-center gap-3 lg:mb-6">
        <Link to="/studio/materialy" aria-label="Wróć do materiałów" className="-ml-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-900/5">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl leading-tight font-bold lg:text-3xl">Studio wideo</h1>
          <p className="truncate text-sm text-ink-500">{recording.title}</p>
        </div>
        {saved ? (
          <Link to={`/studio/publikacja/${recording.id}`} className={buttonClass("primary", "sm", "lg:h-11 lg:px-5")}>
            <Check className="size-4.5" /> Publikuj
          </Link>
        ) : (
          <Button size="sm" className="lg:h-11 lg:px-5" onClick={() => setSaved(true)}>
            <Check className="size-4.5" /> Zapisz
          </Button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* ── Podgląd i oś czasu ── na telefonie przyklejone do góry, narzędzia przewijają się pod nimi */}
        <div className="sticky top-14 z-10 -mx-4 min-w-0 bg-paper px-4 pt-1 pb-3 lg:static lg:mx-0 lg:p-0">
          {/* Na telefonie podgląd ma ograniczoną wysokość, żeby oś czasu i narzędzia były w zasięgu */}
          <div className={cn("relative mx-auto overflow-hidden rounded-[1.5rem] bg-black text-white", formatAspect[recording.format], vertical ? "max-h-[34dvh] lg:max-h-[620px]" : "max-h-[34dvh] lg:max-h-none lg:w-full")}>
            <video
              ref={video}
              src={active.src}
              poster={index === 0 ? recording.image : undefined}
              playsInline
              preload="auto"
              className="absolute inset-0 size-full object-cover"
              onLoadedMetadata={onLoaded}
              onTimeUpdate={onTimeUpdate}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />

            {activeGraphic && (
              <div className={cn("absolute inset-x-[8%] text-[clamp(11px,3vw,19px)]", vertical ? "top-[12%]" : "inset-y-[6%] left-auto w-[46%]")}>
                <InfographicCard item={activeGraphic} brand={brand} className={vertical ? "aspect-[4/5] w-full" : "h-full w-full"} />
              </div>
            )}

            {activeCaption && (
              <p className="absolute inset-x-3 bottom-[12%] flex justify-center text-center">
                <span className={cn("text-base leading-snug font-bold sm:text-lg", styleClass)} style={captionStyle === "akcent" ? { background: brand.accent.value, color: brand.accent.ink } : undefined}>
                  {activeCaption.text}
                </span>
              </p>
            )}

            <button type="button" onClick={togglePlay} aria-label={playing ? "Wstrzymaj podgląd" : "Odtwórz podgląd"} className="absolute inset-0 flex items-center justify-center">
              <span className={cn("inline-flex size-14 items-center justify-center rounded-full bg-black/45 backdrop-blur transition-opacity", playing ? "opacity-0" : "opacity-100")}>
                <Play className="ml-1 size-6" fill="currentColor" />
              </span>
            </button>
          </div>

          <Card className="mt-2 p-2.5 sm:p-4 lg:mt-3">
            <div className="flex items-center gap-3">
              <button type="button" onClick={togglePlay} aria-label={playing ? "Wstrzymaj" : "Odtwórz"} className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white">
                {playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="ml-0.5 size-4" fill="currentColor" />}
              </button>
              <span className="text-sm font-semibold tabular-nums">
                {time(current)} <span className="text-ink-400">/ {time(duration)}</span>
              </span>
              <span className="ml-auto text-xs text-ink-400">
                {clips.length} {clips.length === 1 ? "klip" : clips.length < 5 ? "klipy" : "klipów"}
              </span>
            </div>

            {/* Oś czasu: klipy w kolejności montażu, pod nimi infografiki i napisy */}
            <div className="relative mt-2.5 select-none">
              <div className="flex h-11 gap-1" role="list" aria-label="Klipy na osi czasu">
                {clips.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    role="listitem"
                    aria-current={i === index}
                    aria-label={`Klip ${i + 1}: ${c.label}, ${time(clipLength(c))}`}
                    onClick={() => seek(offsets[i])}
                    style={{ flexGrow: clipLength(c), flexBasis: 0 }}
                    className={cn(
                      "min-w-6 overflow-hidden rounded-lg border-2 px-1.5 text-left text-[10px] leading-tight font-semibold transition",
                      i === index ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white text-ink-500",
                    )}
                  >
                    <span className="block truncate">{i + 1}. {c.label}</span>
                    <span className="block truncate opacity-70">{time(clipLength(c))}</span>
                  </button>
                ))}
              </div>
              <div
                className="relative mt-1.5 h-7 cursor-pointer rounded-lg bg-ink-900/5"
                onClick={(e) => {
                  const box = e.currentTarget.getBoundingClientRect();
                  seek(((e.clientX - box.left) / box.width) * duration);
                }}
              >
                {graphics.map((g) => (
                  <span key={g.id} className="absolute top-1 h-2.5 rounded-sm bg-violet-500" style={{ left: `${(g.at / duration) * 100}%`, width: `${(INFOGRAPHIC_SECONDS / duration) * 100}%` }} />
                ))}
                {captions.map((c) => (
                  <span key={c.id} className="absolute bottom-1 h-2.5 rounded-sm bg-volt-500" style={{ left: `calc(${(c.start / duration) * 100}% + 1px)`, width: `calc(${((c.end - c.start) / duration) * 100}% - 2px)` }} />
                ))}
              </div>
              <span className="pointer-events-none absolute inset-y-0 w-0.5 bg-rose-500" style={{ left: `${Math.min(100, (current / duration) * 100)}%` }} />
            </div>
            <p className="mt-2 hidden flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400 lg:flex">
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-violet-500" /> infografiki</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-volt-500" /> napisy</span>
            </p>
          </Card>
        </div>

        {/* ── Narzędzia ── */}
        <div className="min-w-0">
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-ink-900/5 p-1" role="tablist">
            {tabs.map(({ id: tabId, label, icon: Icon }) => (
              <button
                key={tabId}
                type="button"
                role="tab"
                aria-selected={tab === tabId}
                onClick={() => setTab(tabId)}
                className={cn("inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm font-semibold whitespace-nowrap transition", tab === tabId ? "bg-white text-ink-900 shadow-sm" : "text-ink-500")}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>

          {tab === "clips" && (
            <Card className="p-4 sm:p-5">
              <h2 className="text-lg font-bold">Klipy</h2>
              <p className="mt-1 text-sm text-ink-500">Tnij w miejscu, w którym stoi czerwona kreska. Dodaj własny fragment z telefonu, np. ujęcie ekranu albo produktu.</p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="dark" disabled={!canSplit} onClick={split}>
                  <Scissors className="size-4.5" /> Przetnij tutaj
                </Button>
                <Button variant="outline" onClick={() => fileInput.current?.click()}>
                  <Plus className="size-4.5" /> Dodaj fragment
                </Button>
                <input ref={fileInput} type="file" accept="video/*" className="hidden" aria-label="Wybierz plik wideo" onChange={(e) => void addFile(e.target.files?.[0])} />
              </div>

              <div className="mt-5 rounded-xl bg-paper p-3.5">
                <p className="text-sm font-semibold">
                  Klip {index + 1} z {clips.length}: {active.label} <span className="font-normal text-ink-400">· {time(clipLength(active))}</span>
                </p>
                <label className="mt-3 block text-sm font-medium">
                  Początek: {time(active.start)}
                  <input type="range" aria-label="Początek klipu" min={0} max={active.duration} step={0.1} value={active.start} onChange={(e) => trimActive({ start: Math.min(+e.target.value, active.end - MIN_CLIP) })} className="mt-1.5 w-full accent-ink-900" />
                </label>
                <label className="mt-3 block text-sm font-medium">
                  Koniec: {time(active.end)}
                  <input type="range" aria-label="Koniec klipu" min={0} max={active.duration} step={0.1} value={active.end} onChange={(e) => trimActive({ end: Math.max(+e.target.value, active.start + MIN_CLIP) })} className="mt-1.5 w-full accent-ink-900" />
                </label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" disabled={index === 0} onClick={() => move(-1)}>
                    <ArrowLeftToLine className="size-4" /> Wcześniej
                  </Button>
                  <Button variant="outline" size="sm" disabled={index === clips.length - 1} onClick={() => move(1)}>
                    Później <ArrowRightToLine className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={clips.length < 2} onClick={removeActive} className="text-rose-700">
                    <Trash2 className="size-4" /> Usuń
                  </Button>
                </div>
              </div>
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

      {caps && (!caps.elevenlabs || !caps.openai) && (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Tryb demo:{" "}
          {[!caps.elevenlabs && "napisy powstają z tekstu promptera zamiast z transkrypcji ElevenLabs", !caps.openai && "infografiki są składane lokalnie zamiast generowane przez OpenAI"]
            .filter(Boolean)
            .join(", a ")}
          .
        </p>
      )}
    </div>
  );
}
