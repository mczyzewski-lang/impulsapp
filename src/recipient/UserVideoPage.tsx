import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, CheckSquare, ChevronDown, ChevronsUp, ListChecks, Play, RotateCcw } from "lucide-react";
import type { Tool, Video } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAppUi } from "./RecipientLayout";
import { Sheet } from "./Sheet";

const DEMO_SECONDS = 5;

interface ReelProps {
  video: Video;
  tool?: Tool;
  creatorName: string;
  position: string;
  active: boolean;
  watched: boolean;
  isLast: boolean;
  showSwipeHint: boolean;
  onComplete: () => void;
  onOpenTool: () => void;
  onOpenNotes: () => void;
  onNext: () => void;
}

/**
 * Pojedynczy pionowy materiał. Odtwarzanie jest symulowane (brak plików wideo w demo):
 * aktywny materiał „gra” kilka sekund i wtedy liczy się jako obejrzany.
 */
function Reel({ video, tool, creatorName, position, active, watched, isLast, showSwipeHint, onComplete, onOpenTool, onOpenNotes, onNext }: ReelProps) {
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const finished = progress >= 100;
  const playing = active && !paused && !finished;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 100 / (DEMO_SECONDS * 10))), 100);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (finished) onCompleteRef.current();
  }, [finished]);

  // Po przewinięciu dalej materiał wraca do stanu wyjściowego.
  useEffect(() => {
    if (!active) setPaused(false);
  }, [active]);

  function toggle() {
    if (finished) {
      setProgress(0);
      setPaused(false);
    } else {
      setPaused((p) => !p);
    }
  }

  const railButton = "flex flex-col items-center gap-1 text-[11px] font-semibold text-white";
  const railIcon = "inline-flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors hover:bg-white/25";

  return (
    <section data-reel={video.id} className={cn("relative h-full snap-start snap-always overflow-hidden bg-linear-to-b text-white", video.poster)}>
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="absolute -top-16 -right-16 size-72 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/85 via-black/40 to-transparent" />

      {/* Cały ekran jest przyciskiem odtwórz / wstrzymaj */}
      <button type="button" onClick={toggle} aria-label={finished ? "Odtwórz ponownie" : playing ? "Wstrzymaj" : "Odtwórz"} className="absolute inset-0 flex items-center justify-center">
        <span className={cn("inline-flex size-20 items-center justify-center rounded-full bg-black/35 backdrop-blur transition-opacity duration-200", playing ? "opacity-0" : "opacity-100")}>
          {finished ? <RotateCcw className="size-8" /> : <Play className="ml-1 size-8" fill="currentColor" />}
        </span>
      </button>

      {/* Boczny pasek akcji */}
      <div className="absolute right-3 bottom-28 z-10 flex flex-col items-center gap-4">
        <button type="button" onClick={onOpenNotes} className={railButton}>
          <span className={railIcon}>
            <ListChecks className="size-5.5" />
          </span>
          Wnioski
        </button>
        {tool && (
          <button type="button" onClick={onOpenTool} className={railButton}>
            <span className={cn(railIcon, "bg-volt-400 text-ink-950 hover:bg-volt-300")}>
              <CheckSquare className="size-5.5" />
            </span>
            Narzędzie
          </button>
        )}
        {!isLast && (
          <button type="button" onClick={onNext} className={railButton}>
            <span className={railIcon}>
              <ChevronDown className="size-6" />
            </span>
            Dalej
          </button>
        )}
      </div>

      {/* Opis materiału */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-5">
        <div className="pr-16">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">{video.tag}</span>
            <span className="text-white/70">{video.date} · {video.duration}</span>
            {watched && (
              <span className="inline-flex items-center gap-1 rounded-full bg-volt-400 px-2.5 py-1 text-ink-950">
                <Check className="size-3.5" strokeWidth={3} /> Obejrzane
              </span>
            )}
          </div>
          <h2 className="mt-2.5 text-[1.4rem] leading-tight font-bold text-balance">{video.title}</h2>
          <p className="mt-1.5 line-clamp-2 text-sm text-white/80">{video.description}</p>
          <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-white/80">
            <Avatar name={creatorName} size="sm" className="size-6 text-[10px]" /> {creatorName}
          </p>
        </div>

        {finished && tool && (
          <button type="button" onClick={onOpenTool} className="pointer-events-auto mt-4 flex w-full items-center gap-3 rounded-2xl bg-volt-400 p-3 text-left text-ink-950">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-volt-400">
              <CheckSquare className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold opacity-70">Wdróż od razu · {tool.time}</span>
              <span className="block truncate text-sm font-bold">{tool.title}</span>
            </span>
          </button>
        )}

        <div className="mt-4 flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-volt-400 transition-[width] duration-100 ease-linear" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[11px] font-semibold text-white/70 tabular-nums">{position}</span>
        </div>
      </div>

      {showSwipeHint && !finished && (
        <p className="pointer-events-none absolute inset-x-0 top-36 flex animate-bounce flex-col items-center text-xs font-semibold text-white/80">
          <ChevronsUp className="size-5" />
          Przesuń w górę, żeby zobaczyć kolejny
        </p>
      )}
    </section>
  );
}

/**
 * Wideo: pionowy, pełnoekranowy feed materiałów jednego twórcy.
 * /app/wideo/:id otwiera feed od wskazanego materiału.
 */
export default function UserVideosPage() {
  const { id } = useParams();
  const { channel, watched, markWatched } = useProgress();
  const { openTool } = useAppUi();
  const { videos, tools, creator } = channel;

  const container = useRef<HTMLDivElement>(null);
  const startIndex = Math.max(0, videos.findIndex((v) => v.id === id));
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [notes, setNotes] = useState<Video | null>(null);
  const [scrolled, setScrolled] = useState(false);

  function scrollToIndex(index: number, smooth: boolean) {
    const el = container.current;
    if (el) el.scrollTo({ top: index * el.clientHeight, behavior: smooth ? "smooth" : "instant" });
  }

  // Link do konkretnego materiału ustawia feed na nim, bez animacji.
  useLayoutEffect(() => {
    scrollToIndex(startIndex, false);
    setActiveIndex(startIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, creator.slug]);

  function onScroll() {
    const el = container.current;
    if (!el || el.clientHeight === 0) return;
    const index = Math.round(el.scrollTop / el.clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
      setScrolled(true);
    }
  }

  const notesTool = notes ? tools.find((t) => t.id === notes.toolId) : undefined;

  return (
    <>
      <div ref={container} onScroll={onScroll} className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto overscroll-contain">
        {videos.map((video, i) => {
          const tool = tools.find((t) => t.id === video.toolId);
          return (
            <Reel
              key={video.id}
              video={video}
              tool={tool}
              creatorName={creator.name}
              position={`${i + 1}/${videos.length}`}
              active={i === activeIndex && !notes}
              watched={watched.includes(video.id)}
              isLast={i === videos.length - 1}
              showSwipeHint={i === 0 && !scrolled && videos.length > 1}
              onComplete={() => markWatched(video.id)}
              onOpenTool={() => tool && openTool(tool.id)}
              onOpenNotes={() => setNotes(video)}
              onNext={() => scrollToIndex(i + 1, true)}
            />
          );
        })}
      </div>

      <Sheet open={Boolean(notes)} onClose={() => setNotes(null)} title="Najważniejsze z tego impulsu">
        {notes && (
          <div>
            <h2 className="text-xl leading-tight font-bold">{notes.title}</h2>
            <ul className="mt-4 space-y-3">
              {notes.takeaways.map((t) => (
                <li key={t} className="flex gap-2.5 text-[15px] text-ink-600">
                  <Check className="mt-0.5 size-4.5 shrink-0 text-violet-600" />
                  {t}
                </li>
              ))}
            </ul>
            {notesTool && (
              <Button
                variant="dark"
                size="lg"
                className="mt-6 w-full"
                onClick={() => {
                  setNotes(null);
                  openTool(notesTool.id);
                }}
              >
                <CheckSquare className="size-5" /> Otwórz narzędzie
              </Button>
            )}
          </div>
        )}
      </Sheet>
    </>
  );
}
