import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Camera, Mic, Type, Volume2 } from "lucide-react";
import type { VideoFormat } from "@/data/mock";
import { speak } from "@/integrations/ai";
import { sampleScript, type Script } from "@/state/recordings";
import { cn } from "@/lib/cn";
import { formatLabel } from "@/lib/videoFormat";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader, inputClass, labelClass } from "../CreatorLayout";
import type { CameraSetup } from "./RecorderCamera";

const modes: { id: Script["mode"]; title: string; body: string }[] = [
  { id: "hook", title: "Hook + treść", body: "Mocne pierwsze zdanie czytasz Ty, potem rozwijasz myśl." },
  { id: "question", title: "Pytanie + treść", body: "Pytanie czyta lektor, a Ty na nie odpowiadasz." },
];

/**
 * Przygotowanie nagrania: scenariusz, kadr i ustawienia promptera.
 * Sama kamera otwiera się na osobnym, pełnym ekranie (RecorderCamera).
 */
export default function CreatorRecorder() {
  const navigate = useNavigate();
  // Scenariusz może przyjść z ekranu „Treści” albo wrócić z kamery.
  const incoming = (useLocation().state as { script?: Script } | null)?.script;

  const [script, setScript] = useState<Script>(incoming ?? sampleScript);
  const [format, setFormat] = useState<VideoFormat>("9:16");
  const [speed, setSpeed] = useState(34);
  const [fontSize, setFontSize] = useState(26);

  const words = script.body.split(/\s+/).filter(Boolean).length;

  function openCamera() {
    const setup: CameraSetup = { script, format, speed, fontSize };
    navigate("/nagrywanie", { state: setup });
  }

  return (
    <div className="pb-24 lg:pb-0">
      <PageHeader
        title="Nagraj wideo"
        lead="Przygotuj tekst, a potem otwórz kamerę. Nagrywasz na pełnym ekranie telefonu — prompter przewija się przy obiektywie."
        action={
          <Link to="/studio/tresci" className={buttonClass("outline")}>
            Wybierz z Treści
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
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
                    onChange={(e) => setScript((s) => ({ ...s, opener: e.target.value }))}
                    placeholder={script.mode === "hook" ? "Jedno zdanie, które zatrzymuje przewijanie" : "Pytanie, które zadają Ci odbiorcy"}
                  />
                </label>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-400">
                  {script.mode === "hook" ? "Czytasz je Ty, patrząc w obiektyw." : "Przeczyta je lektor ElevenLabs, zanim zaczniesz mówić."}
                  {script.mode === "question" && (
                    <button type="button" disabled={!script.opener.trim()} onClick={() => void speak(script.opener)} className="inline-flex items-center gap-1 font-semibold text-violet-700 disabled:opacity-40">
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
                  onChange={(e) => setScript((s) => ({ ...s, body: e.target.value }))}
                  placeholder="Wklej tekst, notatki albo fragment artykułu. Krótkie zdania czyta się najłatwiej."
                />
                <span className="mt-1 block text-xs font-normal text-ink-400">
                  {words} słów · około {Math.max(5, Math.round(words / 2.3))} s mówienia
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
                <span className="mt-1 block text-xs font-normal text-ink-400">Zmienisz je też w trakcie nagrywania.</span>
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

        {/* Podgląd tekstu w prompterze i wejście do kamery */}
        <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <p className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">Tak zobaczysz tekst</p>
          <div className="max-h-72 overflow-hidden rounded-3xl bg-ink-900 p-5 text-white" style={{ fontSize: fontSize * 0.8 }}>
            <p className="mb-1 text-[11px] font-bold tracking-wide text-volt-400 uppercase">{script.mode === "hook" ? "Hook — czytasz Ty" : "Pytanie — czyta lektor"}</p>
            <p className={cn("leading-snug font-bold", script.mode === "question" && "text-volt-300")}>{script.opener || "…"}</p>
            <p className="mt-4 mb-1 text-[11px] font-bold tracking-wide text-white/60 uppercase">Treść — czytasz Ty</p>
            <p className="leading-snug font-semibold whitespace-pre-line">{script.body || "Tu pojawi się Twoja treść."}</p>
          </div>
          <Button size="lg" className="mt-4 hidden w-full lg:inline-flex" onClick={openCamera}>
            <Camera className="size-5" /> Otwórz kamerę
          </Button>
        </div>
      </div>

      {/* Na telefonie przycisk jest przyklejony do dołu */}
      <div className="pb-safe-4 fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white/95 px-4 pt-3 backdrop-blur lg:hidden">
        <Button size="lg" className="w-full" onClick={openCamera}>
          <Camera className="size-5" /> Otwórz kamerę
        </Button>
      </div>
    </div>
  );
}
