import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CameraOff, Circle, Clapperboard, Mic, RotateCcw, Square, Type, Volume2 } from "lucide-react";
import type { VideoFormat } from "@/data/mock";
import { speak, stopSpeaking } from "@/integrations/ai";
import { addRecording, sampleScript, type Recording, type Script } from "@/state/recordings";
import { cn } from "@/lib/cn";
import { formatAspect, formatLabel } from "@/lib/videoFormat";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader, inputClass, labelClass } from "../CreatorLayout";

type Phase = "idle" | "countdown" | "lektor" | "recording" | "done";
type Camera = "starting" | "ready" | "unavailable";

const modes: { id: Script["mode"]; title: string; body: string; openerLabel: string }[] = [
  { id: "hook", title: "Hook + treść", body: "Mocne pierwsze zdanie czytasz Ty, potem rozwijasz myśl.", openerLabel: "Hook — czytasz Ty" },
  { id: "question", title: "Pytanie + treść", body: "Pytanie czyta lektor, a Ty na nie odpowiadasz.", openerLabel: "Pytanie — czyta lektor" },
];

const DEMO_CLIP = { src: "/videos/pytanie-otwierajace.mp4", image: "/videos/pytanie-otwierajace.jpg", duration: 6.1 };

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["video/mp4", "video/webm;codecs=vp9,opus", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t));
}

/** Nagrywanie z ręki z prompterem. Treść wklejasz sam — prompter układa ją w hook/pytanie i treść. */
export default function CreatorRecorder() {
  const navigate = useNavigate();

  // Scenariusz może przyjść z ekranu „Treści” — wtedy prompter jest od razu gotowy.
  const incoming = (useLocation().state as { script?: Script } | null)?.script;
  const [script, setScript] = useState<Script>(incoming ?? sampleScript);
  const [format, setFormat] = useState<VideoFormat>("9:16");
  const [speed, setSpeed] = useState(34);
  const [fontSize, setFontSize] = useState(26);

  const [camera, setCamera] = useState<Camera>("starting");
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState<Recording | null>(null);

  const preview = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const prompter = useRef<HTMLDivElement>(null);
  const offset = useRef(0);

  const mode = modes.find((m) => m.id === script.mode)!;

  /* ── Kamera ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("brak API kamery");
        const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
        if (cancelled) return media.getTracks().forEach((t) => t.stop());
        stream.current = media;
        if (preview.current) preview.current.srcObject = media;
        setCamera("ready");
      } catch {
        if (!cancelled) setCamera("unavailable");
      }
    })();
    return () => {
      cancelled = true;
      stream.current?.getTracks().forEach((t) => t.stop());
      stopSpeaking();
    };
  }, []);

  // Po powrocie z ekranu wyniku element <video> jest nowy — podpinamy strumień ponownie.
  useEffect(() => {
    if (phase !== "done" && preview.current && stream.current && preview.current.srcObject !== stream.current) {
      preview.current.srcObject = stream.current;
    }
  }, [phase]);

  /* ── Przewijanie promptera ── */
  useEffect(() => {
    if (phase !== "recording") return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      offset.current += ((now - last) / 1000) * speed;
      last = now;
      if (prompter.current) prompter.current.style.transform = `translateY(${-offset.current}px)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, speed]);

  /* ── Licznik czasu nagrania ── */
  useEffect(() => {
    if (phase !== "recording" && phase !== "lektor") return;
    const id = setInterval(() => setSeconds((performance.now() - startedAt.current) / 1000), 200);
    return () => clearInterval(id);
  }, [phase]);

  const finish = useCallback(
    (blob: Blob | null, duration: number) => {
      const base = {
        id: `nagranie-${Date.now()}`,
        title: script.opener.replace(/[.?!]+$/, "") || "Nowe nagranie",
        format,
        script,
        createdAt: "przed chwilą",
      };
      // Bez kamery (np. na komputerze bez uprawnień) próbę promptera kończymy nagraniem przykładowym.
      const recording: Recording = blob
        ? { ...base, src: URL.createObjectURL(blob), blob, duration: Math.max(1, duration) }
        : { ...base, ...DEMO_CLIP };
      addRecording(recording);
      setResult(recording);
      setPhase("done");
    },
    [format, script],
  );

  function beginCapture() {
    startedAt.current = performance.now();
    setSeconds(0);
    if (camera !== "ready" || !stream.current) return;
    chunks.current = [];
    const mimeType = pickMimeType();
    const rec = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined);
    rec.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data);
    rec.onstop = () => finish(new Blob(chunks.current, { type: rec.mimeType }), (performance.now() - startedAt.current) / 1000);
    rec.start();
    recorder.current = rec;
  }

  async function start() {
    offset.current = 0;
    if (prompter.current) prompter.current.style.transform = "translateY(0)";
    setPhase("countdown");
    for (let n = 3; n > 0; n--) {
      setCount(n);
      await new Promise((r) => setTimeout(r, 800));
    }
    beginCapture();
    if (script.mode === "question" && script.opener.trim()) {
      // Pytanie czyta lektor — prompter rusza dopiero, gdy skończy.
      setPhase("lektor");
      await speak(script.opener);
    }
    setPhase((p) => (p === "done" ? p : "recording"));
  }

  function stop() {
    stopSpeaking();
    if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
    else finish(null, 0);
    recorder.current = null;
  }

  function retake() {
    setResult(null);
    setPhase("idle");
    setSeconds(0);
  }

  const busy = phase === "countdown" || phase === "lektor" || phase === "recording";
  const clock = `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

  return (
    <div>
      <PageHeader
        title="Nagraj wideo"
        lead="Wklej swoją treść, a prompter poprowadzi Cię przez nagranie. Telefon trzymasz w ręce — tekst przewija się przy obiektywie."
        action={
          <Link to="/studio/tresci" className={buttonClass("outline")}>
            Wybierz z Treści
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        {/* ── Scenariusz ── */}
        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-bold">1. Format scenariusza</h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Format scenariusza">
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={script.mode === m.id}
                  disabled={busy}
                  onClick={() => setScript((s) => ({ ...s, mode: m.id }))}
                  className={cn("rounded-xl border p-3.5 text-left transition", script.mode === m.id ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-ink-300")}
                >
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {m.id === "hook" ? <Mic className="size-4" /> : <Volume2 className="size-4" />} {m.title}
                  </p>
                  <p className={cn("mt-1 text-xs", script.mode === m.id ? "text-ink-300" : "text-ink-500")}>{m.body}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold">2. Twoja treść</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelClass}>
                  {script.mode === "hook" ? "Hook" : "Pytanie"}
                  <input
                    className={inputClass}
                    value={script.opener}
                    disabled={busy}
                    onChange={(e) => setScript((s) => ({ ...s, opener: e.target.value }))}
                    placeholder={script.mode === "hook" ? "Jedno zdanie, które zatrzymuje przewijanie" : "Pytanie, które zadają Ci odbiorcy"}
                  />
                </label>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-400">
                  {script.mode === "hook" ? "Czytasz je Ty, patrząc w obiektyw." : "Przeczyta je lektor ElevenLabs, zanim zaczniesz mówić."}
                  {script.mode === "question" && (
                    <button type="button" disabled={busy || !script.opener.trim()} onClick={() => void speak(script.opener)} className="inline-flex items-center gap-1 font-semibold text-violet-700 disabled:opacity-40">
                      <Volume2 className="size-3.5" /> Odsłuchaj
                    </button>
                  )}
                </p>
              </div>
              <label className={labelClass}>
                Treść
                <textarea
                  className={inputClass}
                  rows={6}
                  value={script.body}
                  disabled={busy}
                  onChange={(e) => setScript((s) => ({ ...s, body: e.target.value }))}
                  placeholder="Wklej tekst, notatki albo fragment artykułu. Krótkie zdania czyta się najłatwiej."
                />
                <span className="mt-1 block text-xs font-normal text-ink-400">
                  {script.body.split(/\s+/).filter(Boolean).length} słów · około {Math.max(5, Math.round(script.body.split(/\s+/).filter(Boolean).length / 2.3))} s mówienia
                </span>
              </label>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold">3. Kadr i prompter</h2>
            <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Format wideo">
              {(Object.keys(formatLabel) as VideoFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={format === f}
                  disabled={busy}
                  onClick={() => setFormat(f)}
                  className={cn("rounded-xl border px-3 py-2.5 text-left transition", format === f ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-ink-300")}
                >
                  <span className="block text-sm font-semibold">{f}</span>
                  <span className={cn("block text-xs", format === f ? "text-ink-300" : "text-ink-500")}>{formatLabel[f]}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Tempo przewijania
                <input type="range" min={14} max={70} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="mt-2 w-full accent-ink-900" />
              </label>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Type className="size-4" /> Wielkość tekstu
                </span>
                <input type="range" min={18} max={38} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="mt-2 w-full accent-ink-900" />
              </label>
            </div>
          </Card>
        </div>

        {/* ── Kamera z prompterem ── */}
        <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <div className={cn("relative mx-auto overflow-hidden rounded-[2rem] bg-black text-white", formatAspect[format], format === "9:16" ? "max-h-[640px]" : "w-full")}>
            {phase === "done" && result ? (
              <video key={result.id} src={result.src} poster={result.image} controls playsInline className="absolute inset-0 size-full object-cover" />
            ) : (
              <>
                {camera === "unavailable" ? (
                  <img src={DEMO_CLIP.image} alt="" className="absolute inset-0 size-full object-cover opacity-60" />
                ) : (
                  <video ref={preview} autoPlay muted playsInline className="absolute inset-0 size-full -scale-x-100 object-cover" />
                )}

                {/* Prompter: tekst przy górnej krawędzi, czyli blisko obiektywu */}
                <div className="absolute inset-x-0 top-0 h-[58%] overflow-hidden bg-linear-to-b from-black/80 via-black/55 to-transparent px-5 pt-5">
                  <div ref={prompter} className="will-change-transform" style={{ fontSize }}>
                    <p className="mb-1 text-[11px] font-bold tracking-wide text-volt-400 uppercase">{mode.openerLabel}</p>
                    <p className={cn("leading-snug font-bold", script.mode === "question" && "text-volt-300")}>{script.opener || "…"}</p>
                    <p className="mt-4 mb-1 text-[11px] font-bold tracking-wide text-white/60 uppercase">Treść — czytasz Ty</p>
                    <p className="leading-snug font-semibold whitespace-pre-line">{script.body || "Tu pojawi się Twoja treść."}</p>
                    <div className="h-64" />
                  </div>
                </div>

                {phase === "countdown" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="font-display text-8xl font-extrabold">{count}</span>
                  </div>
                )}
                {phase === "lektor" && (
                  <p className="absolute inset-x-4 bottom-24 flex items-center justify-center gap-2 rounded-full bg-volt-400 px-4 py-2 text-sm font-bold text-ink-950">
                    <Volume2 className="size-4" /> Lektor czyta pytanie…
                  </p>
                )}
                {camera === "unavailable" && phase === "idle" && (
                  <p className="absolute inset-x-4 bottom-24 flex items-start gap-2 rounded-2xl bg-black/70 p-3 text-xs">
                    <CameraOff className="size-4 shrink-0" />
                    Brak dostępu do kamery. Możesz przećwiczyć prompter — po zatrzymaniu podstawimy nagranie przykładowe.
                  </p>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/80 to-transparent px-5 pt-10 pb-5">
                  <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums", busy ? "text-white" : "text-white/60")}>
                    {(phase === "recording" || phase === "lektor") && <span className="size-2.5 animate-pulse rounded-full bg-rose-500" />}
                    {clock}
                  </span>
                  {busy ? (
                    <button type="button" aria-label="Zatrzymaj nagrywanie" disabled={phase === "countdown"} onClick={stop} className="inline-flex size-16 items-center justify-center rounded-full border-4 border-white disabled:opacity-40">
                      <Square className="size-6 text-rose-500" fill="currentColor" />
                    </button>
                  ) : (
                    <button type="button" aria-label="Rozpocznij nagrywanie" disabled={camera === "starting"} onClick={() => void start()} className="inline-flex size-16 items-center justify-center rounded-full border-4 border-white disabled:opacity-40">
                      <Circle className="size-11 text-rose-500" fill="currentColor" />
                    </button>
                  )}
                  <span className="w-10 text-right text-xs font-semibold text-white/60">{format}</span>
                </div>
              </>
            )}
          </div>

          {phase === "done" && result && (
            <div className="mt-4 space-y-2">
              <Button size="lg" className="w-full" onClick={() => navigate(`/studio/montaz/${result.id}`)}>
                <Clapperboard className="size-5" /> Otwórz w Studiu wideo <ArrowRight className="size-5" />
              </Button>
              <Button variant="outline" className="w-full" onClick={retake}>
                <RotateCcw className="size-4" /> Nagraj ponownie
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
