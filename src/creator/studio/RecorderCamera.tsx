import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CameraOff, Circle, Clapperboard, Minus, Plus, RotateCcw, Square, Volume2, X } from "lucide-react";
import type { VideoFormat } from "@/data/mock";
import { speak, stopSpeaking } from "@/integrations/ai";
import { addRecording, sampleScript, type Recording, type Script } from "@/state/recordings";
import { cn } from "@/lib/cn";
import { formatAspect } from "@/lib/videoFormat";
import { Button } from "@/components/ui/Button";

type Phase = "idle" | "countdown" | "lektor" | "recording" | "done";
type Camera = "starting" | "ready" | "unavailable";

export interface CameraSetup {
  script: Script;
  format: VideoFormat;
  speed: number;
  fontSize: number;
}

const DEMO_CLIP = { src: "/videos/pytanie-otwierajace.mp4", image: "/videos/pytanie-otwierajace.jpg", duration: 6.1 };

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["video/mp4", "video/webm;codecs=vp9,opus", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t));
}

/**
 * Nagrywanie na pełnym ekranie telefonu: obraz z kamery wypełnia całą szerokość i wysokość,
 * prompter leży przy górnej krawędzi (blisko obiektywu), a przycisk nagrywania — pod kciukiem.
 * Ekran działa poza układem panelu, żeby nic nie zabierało miejsca.
 */
export default function RecorderCamera() {
  const navigate = useNavigate();
  const setup = (useLocation().state as Partial<CameraSetup> | null) ?? {};
  const script = setup.script ?? sampleScript;
  const format = setup.format ?? "9:16";
  const fontSize = setup.fontSize ?? 26;

  const [speed, setSpeed] = useState(setup.speed ?? 34);
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

  // Po „Nagraj ponownie” element <video> jest nowy — podpinamy strumień jeszcze raz.
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
      // Bez kamery próbę promptera kończymy nagraniem przykładowym, żeby dało się przejść dalej.
      const recording: Recording = blob ? { ...base, src: URL.createObjectURL(blob), blob, duration: Math.max(1, duration) } : { ...base, ...DEMO_CLIP };
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
  const glass = "inline-flex size-11 items-center justify-center rounded-full bg-black/45 backdrop-blur";

  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-white">
      {phase === "done" && result ? (
        <>
          <video key={result.id} src={result.src} poster={result.image} controls playsInline className="absolute inset-0 size-full object-contain" />
          <div className="pt-safe absolute inset-x-0 top-0 flex justify-end p-3">
            <button type="button" aria-label="Zamknij" onClick={() => navigate("/studio/nagraj")} className={glass}>
              <X className="size-5" />
            </button>
          </div>
          <div className="pb-safe-4 absolute inset-x-0 bottom-0 space-y-2 bg-linear-to-t from-black via-black/80 to-transparent px-4 pt-16">
            <Button size="lg" className="w-full" onClick={() => navigate(`/studio/montaz/${result.id}`)}>
              <Clapperboard className="size-5" /> Otwórz w Studiu wideo <ArrowRight className="size-5" />
            </Button>
            <Button variant="glass" className="w-full" onClick={retake}>
              <RotateCcw className="size-4" /> Nagraj ponownie
            </Button>
          </div>
        </>
      ) : (
        <>
          {camera === "unavailable" ? (
            <img src={DEMO_CLIP.image} alt="" className="absolute inset-0 size-full object-cover opacity-60" />
          ) : (
            <video ref={preview} autoPlay muted playsInline className="absolute inset-0 size-full -scale-x-100 object-cover" />
          )}

          {/* Dla formatu innego niż pionowy pokazujemy kadr, który trafi do nagrania */}
          {format !== "9:16" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className={cn("w-full rounded-lg border-2 border-white/80 shadow-[0_0_0_9999px_rgb(0_0_0/0.55)]", formatAspect[format])} />
            </div>
          )}

          {/* Prompter: tekst przy górnej krawędzi, czyli blisko obiektywu */}
          <div className="pt-safe absolute inset-x-0 top-0 h-[56%] overflow-hidden bg-linear-to-b from-black/85 via-black/55 to-transparent">
            <div ref={prompter} className="px-5 pt-16 will-change-transform" style={{ fontSize }}>
              <p className="mb-1 text-[11px] font-bold tracking-wide text-volt-400 uppercase">{script.mode === "hook" ? "Hook — czytasz Ty" : "Pytanie — czyta lektor"}</p>
              <p className={cn("leading-snug font-bold", script.mode === "question" && "text-volt-300")}>{script.opener || "…"}</p>
              <p className="mt-4 mb-1 text-[11px] font-bold tracking-wide text-white/60 uppercase">Treść — czytasz Ty</p>
              <p className="leading-snug font-semibold whitespace-pre-line">{script.body || "Tu pojawi się Twoja treść."}</p>
              <div className="h-80" />
            </div>
          </div>

          {/* Górny pasek: zamknięcie i tempo promptera */}
          <div className="pt-safe absolute inset-x-0 top-0 z-10">
            <div className="flex items-center justify-between p-3">
              <button type="button" aria-label="Zamknij kamerę" disabled={busy} onClick={() => navigate("/studio/nagraj", { state: { script } })} className={cn(glass, "disabled:opacity-30")}>
                <X className="size-5" />
              </button>
              <div className="flex items-center gap-1 rounded-full bg-black/45 p-1 backdrop-blur">
                <button type="button" aria-label="Wolniej" onClick={() => setSpeed((s) => Math.max(14, s - 6))} className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white/15">
                  <Minus className="size-4" />
                </button>
                <span className="w-14 text-center text-xs font-semibold">Tempo</span>
                <button type="button" aria-label="Szybciej" onClick={() => setSpeed((s) => Math.min(70, s + 6))} className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white/15">
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {phase === "countdown" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="font-display text-9xl font-extrabold">{count}</span>
            </div>
          )}
          {phase === "lektor" && (
            <p className="absolute inset-x-5 bottom-36 flex items-center justify-center gap-2 rounded-full bg-volt-400 px-4 py-2.5 text-sm font-bold text-ink-950">
              <Volume2 className="size-4" /> Lektor czyta pytanie…
            </p>
          )}
          {camera === "unavailable" && phase === "idle" && (
            <p className="absolute inset-x-5 bottom-36 flex items-start gap-2 rounded-2xl bg-black/70 p-3.5 text-sm">
              <CameraOff className="mt-0.5 size-4 shrink-0" />
              Brak dostępu do kamery. Możesz przećwiczyć prompter — po zatrzymaniu podstawimy nagranie przykładowe.
            </p>
          )}

          <div className="pb-safe-4 absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/85 to-transparent px-7 pt-14">
            <span className={cn("inline-flex w-16 items-center gap-1.5 text-sm font-semibold tabular-nums", busy ? "text-white" : "text-white/60")}>
              {(phase === "recording" || phase === "lektor") && <span className="size-2.5 animate-pulse rounded-full bg-rose-500" />}
              {clock}
            </span>
            {busy ? (
              <button type="button" aria-label="Zatrzymaj nagrywanie" disabled={phase === "countdown"} onClick={stop} className="inline-flex size-20 items-center justify-center rounded-full border-4 border-white disabled:opacity-40">
                <Square className="size-7 text-rose-500" fill="currentColor" />
              </button>
            ) : (
              <button type="button" aria-label="Rozpocznij nagrywanie" disabled={camera === "starting"} onClick={() => void start()} className="inline-flex size-20 items-center justify-center rounded-full border-4 border-white disabled:opacity-40">
                <Circle className="size-14 text-rose-500" fill="currentColor" />
              </button>
            )}
            <span className="w-16 text-right text-xs font-semibold text-white/60">{format}</span>
          </div>
        </>
      )}
    </div>
  );
}
