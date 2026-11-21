import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CheckSquare } from "lucide-react";
import { tools, videos } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { VideoPoster } from "@/components/ui/VideoPoster";
import { UnlockProgress } from "@/components/UnlockProgress";
import { PageTitle } from "./RecipientLayout";
import { VideoPlayer } from "./VideoPlayer";

/** Lista wideo w kanale. */
export function UserVideosPage() {
  const { watched } = useProgress();
  return (
    <div>
      <PageTitle title="Wideo" lead={`Obejrzane: ${watched.length} z ${videos.length}. Krótkie materiały, każdy z jednym zadaniem.`} />
      <ul className="space-y-3">
        {videos.map((v) => (
          <li key={v.id}>
            <Link to={`/app/wideo/${v.id}`} className="flex gap-3 rounded-2xl border border-line bg-white p-2.5">
              <VideoPoster poster={v.poster} duration={v.duration} className="h-[76px] w-28 shrink-0" />
              <div className="min-w-0 flex-1 py-0.5">
                <p className="text-[11px] font-semibold tracking-wide text-violet-600 uppercase">{v.tag}</p>
                <p className="line-clamp-2 text-sm leading-snug font-semibold">{v.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
                  {watched.includes(v.id) ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-volt-700">
                      <Check className="size-3.5" strokeWidth={3} /> Obejrzane
                    </span>
                  ) : (
                    v.date
                  )}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Widok pojedynczego materiału wideo. */
export default function UserVideoPage() {
  const { id } = useParams();
  const { markWatched, chatUnlocked } = useProgress();
  const index = videos.findIndex((v) => v.id === id);
  if (index === -1) return <Navigate to="/app/wideo" replace />;

  const video = videos[index];
  const tool = tools.find((t) => t.id === video.toolId);
  const next = videos[index + 1];

  return (
    <div className="space-y-5">
      <Link to="/app/wideo" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500">
        <ArrowLeft className="size-4" /> Wszystkie wideo
      </Link>

      {/* key resetuje odtwarzacz przy zmianie materiału */}
      <VideoPlayer key={video.id} video={video} onComplete={() => markWatched(video.id)} />

      <div>
        <div className="flex items-center gap-2">
          <Badge tone="violet">{video.tag}</Badge>
          <span className="text-xs text-ink-400">{video.date}</span>
        </div>
        <h1 className="mt-2 text-[1.6rem] leading-tight font-bold">{video.title}</h1>
        <p className="mt-2 text-ink-500">{video.description}</p>
      </div>

      <section className="rounded-2xl border border-line bg-white p-4">
        <h2 className="text-base font-bold">Najważniejsze z tego impulsu</h2>
        <ul className="mt-3 space-y-2.5">
          {video.takeaways.map((t) => (
            <li key={t} className="flex gap-2.5 text-[15px] text-ink-600">
              <Check className="mt-0.5 size-4.5 shrink-0 text-violet-600" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {tool && (
        <Link to={`/app/narzedzia/${tool.id}`} className="flex items-center gap-3 rounded-2xl bg-volt-200 p-4">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-volt-400">
            <CheckSquare className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-volt-700">Wdróż od razu · {tool.time}</p>
            <p className="text-sm font-bold">{tool.title}</p>
          </div>
          <ArrowRight className="size-5" />
        </Link>
      )}

      {!chatUnlocked && <UnlockProgress compact />}

      {next && (
        <Link to={`/app/wideo/${next.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5">
          <VideoPoster poster={next.poster} duration={next.duration} className="h-16 w-24 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink-400">Następne</p>
            <p className="line-clamp-2 text-sm leading-snug font-semibold">{next.title}</p>
          </div>
        </Link>
      )}

      <Link to="/app" className={buttonClass("outline", "md", "w-full")}>
        Wróć na start
      </Link>
    </div>
  );
}
