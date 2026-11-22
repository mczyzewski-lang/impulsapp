import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, CheckSquare, ChevronDown, ChevronsUp, LayoutList, ListChecks, Play, RectangleVertical, RotateCcw } from "lucide-react";
import { orderVideos, type Tool, type Video } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { cn } from "@/lib/cn";
import { formatAspect } from "@/lib/videoFormat";
import { Button } from "@/components/ui/Button";
import { useAppUi, type VideoView } from "./RecipientLayout";
import { Sheet } from "./Sheet";

const DEMO_SECONDS = 5;

/** Przełącznik widoku w narożniku: pełnoekranowy feed ↔ lista. */
function ViewToggle({ view, onChange, tone }: { view: VideoView; onChange: (v: VideoView) => void; tone: "dark" | "light" }) {
  const options = [
    { id: "feed" as const, label: "Widok pełnoekranowy", icon: RectangleVertical },
    { id: "list" as const, label: "Lista wideo", icon: LayoutList },
  ];
  return (
    <div role="group" aria-label="Sposób wyświetlania wideo" className={cn("inline-flex rounded-full p-1", tone === "dark" ? "bg-black/40 backdrop-blur" : "bg-ink-900/5")}>
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          aria-pressed={view === id}
          onClick={() => onChange(id)}
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-full transition-colors",
            view === id ? (tone === "dark" ? "bg-white text-ink-900" : "bg-white text-ink-900 shadow-sm") : tone === "dark" ? "text-white/70" : "text-ink-400",
          )}
        >
          <Icon className="size-4.5" />
        </button>
      ))}
    </div>
  );
}

interface ReelProps {
  video: Video;
  tool?: Tool;
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
 * Pojedynczy materiał w feedzie. Obsługuje formaty 9:16, 1:1 i 16:9:
 * pionowe wypełnia ekran, pozostałe są wyśrodkowane na rozmytym tle.
 * Materiały bez pliku wideo mają odtwarzanie symulowane.
 */
function Reel({ video, tool, position, active, watched, isLast, showSwipeHint, onComplete, onOpenTool, onOpenNotes, onNext }: ReelProps) {
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const finished = progress >= 100;
  const playing = active && !paused && !finished;
  const vertical = video.format === "9:16";

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const media = useRef<HTMLVideoElement>(null);

  // Materiał z plikiem odtwarzamy naprawdę; bez pliku postęp jest symulowany.
  useEffect(() => {
    const el = media.current;
    if (el) {
      // iOS pozwala na automatyczny start tylko wyciszonego wideo — ustawiamy to wprost na elemencie.
      el.muted = true;
      if (playing) void el.play().catch(() => setPaused(true));
      else el.pause();
      return;
    }
    if (!playing) return;
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 100 / (DEMO_SECONDS * 10))), 100);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (finished) onCompleteRef.current();
  }, [finished]);

  // Po przewinięciu dalej materiał wraca na początek.
  useEffect(() => {
    if (active) return;
    setPaused(false);
    setProgress(0);
    if (media.current) media.current.currentTime = 0;
  }, [active]);

  function toggle() {
    const el = media.current;
    if (finished) {
      if (el) el.currentTime = 0;
      setProgress(0);
      setPaused(false);
      // Start wywołany wprost z dotknięcia — przeglądarki mobilne traktują go jako działanie użytkownika.
      void el?.play().catch(() => setPaused(true));
    } else if (paused) {
      setPaused(false);
      void el?.play().catch(() => setPaused(true));
    } else {
      setPaused(true);
      el?.pause();
    }
  }

  const railButton = "flex flex-col items-center gap-1 text-[11px] font-semibold text-white";
  const railIcon = "inline-flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors hover:bg-white/25";

  return (
    <section data-reel={video.id} className="theme-base relative h-full snap-start snap-always overflow-hidden bg-black text-white">
      {/* Tło dla formatów innych niż pionowy */}
      {!vertical &&
        (video.image ? (
          <img src={video.image} alt="" className="absolute inset-0 size-full scale-125 object-cover opacity-50 blur-3xl" />
        ) : (
          <div className={cn("absolute inset-0 scale-125 bg-linear-to-b opacity-40 blur-3xl", video.poster)} />
        ))}

      {/* Kadr wideo w swoich proporcjach */}
      <div
        className={cn(
          "absolute overflow-hidden bg-linear-to-b",
          video.poster,
          vertical ? "inset-0" : cn("inset-x-0 shadow-2xl", formatAspect[video.format], video.format === "1:1" ? "top-[16%]" : "top-[24%]"),
        )}
      >
        {video.src ? (
          <video
            ref={media}
            src={video.src}
            poster={video.image}
            muted
            playsInline
            preload={active ? "auto" : "metadata"}
            className="absolute inset-0 size-full object-cover"
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              if (el.duration) setProgress(Math.min(99, (el.currentTime / el.duration) * 100));
            }}
            onEnded={() => setProgress(100)}
          />
        ) : (
          <>
            <div className="bg-grid absolute inset-0 opacity-50" />
            <div className="absolute -top-16 -right-16 size-72 rounded-full bg-white/15 blur-3xl" />
          </>
        )}
        <span
          className={cn(
            "absolute top-1/2 left-1/2 inline-flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 backdrop-blur transition-opacity duration-200",
            playing ? "opacity-0" : "opacity-100",
          )}
        >
          {finished ? <RotateCcw className="size-8" /> : <Play className="ml-1 size-8" fill="currentColor" />}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/85 via-black/40 to-transparent" />

      {/* Cały ekran jest przyciskiem odtwórz / wstrzymaj */}
      <button type="button" onClick={toggle} aria-label={finished ? "Odtwórz ponownie" : playing ? "Wstrzymaj" : "Odtwórz"} className="absolute inset-0" />

      {/* Po obejrzeniu na dole pojawia się przycisk narzędzia — pasek akcji przesuwa się nad niego */}
      <div className={cn("absolute right-3 z-10 flex flex-col items-center gap-4 transition-[bottom] duration-200", finished && tool ? "bottom-48" : "bottom-28")}>
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-5">
        <div className="pr-16">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">{video.tag}</span>
            {watched && (
              <span className="inline-flex items-center gap-1 rounded-full bg-volt-400 px-2.5 py-1 text-ink-950">
                <Check className="size-3.5" strokeWidth={3} /> Obejrzane
              </span>
            )}
          </div>
          <h2 className="mt-2.5 text-[1.4rem] leading-tight font-bold text-balance">{video.title}</h2>
          <p className="mt-1.5 line-clamp-2 text-sm text-white/80">{video.description}</p>
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

/** Lista wideo — alternatywa dla feedu, włączana przełącznikiem w narożniku. */
function VideoList({ videos, watched, onPick, toggle }: { videos: Video[]; watched: string[]; onPick: (id: string) => void; toggle: React.ReactNode }) {
  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Wideo</h1>
          <p className="mt-1 text-sm text-ink-500">
            Obejrzane: {watched.length} z {videos.length}. Najświeższe na górze.
          </p>
        </div>
        {toggle}
      </div>
      <ul className="space-y-3">
        {videos.map((v) => (
          <li key={v.id}>
            <button type="button" onClick={() => onPick(v.id)} className="flex w-full gap-3 rounded-2xl border border-line bg-white p-2.5 text-left">
              {/* Miniatura zachowuje proporcje nagrania */}
              <span className="theme-base flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black">
                <span className={cn("relative block overflow-hidden bg-linear-to-b", v.poster, formatAspect[v.format], v.format === "16:9" ? "w-full" : "h-full")}>
                  {v.image && <img src={v.image} alt="" className="absolute inset-0 size-full object-cover" />}
                  <span className="absolute top-1/2 left-1/2 inline-flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink-900">
                    <Play className="ml-0.5 size-3" fill="currentColor" />
                  </span>
                </span>
              </span>
              <span className="min-w-0 flex-1 py-0.5">
                <span className="block text-[11px] font-semibold tracking-wide text-violet-600 uppercase">{v.tag}</span>
                <span className="line-clamp-2 text-sm leading-snug font-semibold">{v.title}</span>
                <span className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-400">
                  {watched.includes(v.id) ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-volt-700">
                      <Check className="size-3.5" strokeWidth={3} /> Obejrzane
                    </span>
                  ) : (
                    <>{v.duration}</>
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Zakładka Wideo. Domyślnie pełnoekranowy feed (najświeższe na górze, przewinięcie w dół = kolejne),
 * z przełącznikiem na listę. /app/wideo/:id otwiera feed od wskazanego materiału.
 */
export default function UserVideosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { channel, watched, markWatched } = useProgress();
  const { openTool, videoView, setVideoView } = useAppUi();
  const { tools, creator } = channel;
  const videos = orderVideos(channel.videos);

  const view: VideoView = id ? "feed" : videoView;
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
  }, [id, creator.slug, view]);

  function onScroll() {
    const el = container.current;
    if (!el || el.clientHeight === 0) return;
    const index = Math.round(el.scrollTop / el.clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
      setScrolled(true);
    }
  }

  function changeView(next: VideoView) {
    setVideoView(next);
    if (id) navigate("/app/wideo", { replace: true });
  }

  if (view === "list") {
    return (
      <VideoList
        videos={videos}
        watched={watched}
        toggle={<ViewToggle view="list" onChange={changeView} tone="light" />}
        onPick={(videoId) => navigate(`/app/wideo/${videoId}`)}
      />
    );
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

      {/* Przełącznik widoku w prawym górnym narożniku, pod nagłówkiem kanału */}
      <div className="theme-base absolute top-[calc(env(safe-area-inset-top)+4.5rem)] right-3 z-20">
        <ViewToggle view="feed" onChange={changeView} tone="dark" />
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
