import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play, RotateCcw } from "lucide-react";
import type { Video } from "@/data/mock";
import { cn } from "@/lib/cn";

interface VideoPlayerProps {
  video: Video;
  className?: string;
  onComplete: () => void;
}

const DEMO_SECONDS = 5;

/**
 * Odtwarzacz pojedynczego materiału. Bez pliku wideo odtwarzanie jest symulowane:
 * „Odtwarzanie” trwa kilka sekund, po czym materiał liczy się jako obejrzany.
 */
export function VideoPlayer({ video, className, onComplete }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const media = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = media.current;
    if (el) {
      if (playing) void el.play().catch(() => setPlaying(false));
      else el.pause();
      return;
    }
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => Math.min(100, p + 100 / (DEMO_SECONDS * 10)));
    }, 100);
    return () => clearInterval(id);
  }, [playing]);

  const finished = progress >= 100;

  useEffect(() => {
    if (finished) {
      setPlaying(false);
      onCompleteRef.current();
    }
  }, [finished]);

  function toggle() {
    if (finished) {
      setProgress(0);
      if (media.current) media.current.currentTime = 0;
    }
    setPlaying((p) => !p || finished);
  }

  return (
    <div className={cn("theme-base relative aspect-video w-full overflow-hidden rounded-2xl bg-linear-to-br text-white", video.poster, className)}>
      {video.src ? (
        <video
          ref={media}
          src={video.src}
          poster={video.image}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full object-cover"
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            if (el.duration) setProgress(Math.min(99, (el.currentTime / el.duration) * 100));
          }}
          onEnded={() => setProgress(100)}
        />
      ) : (
        <>
          <div className="bg-grid absolute inset-0 opacity-60" />
          <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/15 blur-3xl" />
        </>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Wstrzymaj" : finished ? "Odtwórz ponownie" : "Odtwórz"}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span
          className={cn(
            "inline-flex size-16 items-center justify-center rounded-full bg-white/95 text-ink-900 shadow-xl transition",
            playing && "scale-90 opacity-0 hover:opacity-100",
          )}
        >
          {finished ? <RotateCcw className="size-6" /> : playing ? <Pause className="size-6" fill="currentColor" /> : <Play className="ml-1 size-6" fill="currentColor" />}
        </span>
      </button>

      {finished && (
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-volt-400 px-2.5 py-1 text-xs font-bold text-ink-950">
          <Check className="size-3.5" strokeWidth={3} /> Obejrzane
        </span>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-ink-950/80 to-transparent px-3.5 pt-8 pb-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>{playing ? "Odtwarzanie" : finished ? "Koniec" : "Dotknij, żeby odtworzyć"}</span>
          <span>{video.duration}</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-volt-400 transition-[width] duration-100 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
