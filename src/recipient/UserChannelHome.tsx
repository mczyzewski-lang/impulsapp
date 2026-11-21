import { Link } from "react-router-dom";
import { ArrowRight, CheckSquare, ChevronRight, Gift, MessageCircleQuestion } from "lucide-react";
import { creator, files, tools, videos, weeklyQuestion } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { VideoPoster } from "@/components/ui/VideoPoster";
import { UnlockProgress } from "@/components/UnlockProgress";

export default function UserChannelHome() {
  const { name, watched, downloaded, answer } = useProgress();
  const welcome = videos[0];
  const latest = videos[1];
  const latestTool = tools.find((t) => t.id === latest.toolId)!;
  const bonus = files.find((f) => f.isBonus)!;
  const welcomeWatched = watched.includes(welcome.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ink-500">Cześć{name ? `, ${name}` : ""}</p>
        <h1 className="text-2xl leading-tight font-bold">Twój impuls na ten tydzień</h1>
      </div>

      {!welcomeWatched && (
        <Link to={`/app/wideo/${welcome.id}`} className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-3">
          <VideoPoster poster={welcome.poster} className="h-14 w-20 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-violet-700">Zacznij tutaj · {welcome.duration}</p>
            <p className="truncate text-sm font-semibold">Wideo powitalne od Marty</p>
          </div>
          <ChevronRight className="size-5 text-violet-400" />
        </Link>
      )}

      <Card className="overflow-hidden">
        <Link to={`/app/wideo/${latest.id}`} className="block p-3">
          <VideoPoster poster={latest.poster} duration={latest.duration} playSize="lg" className="aspect-video" watched={watched.includes(latest.id)} />
          <div className="px-1 pt-3.5 pb-1">
            <div className="flex items-center gap-2">
              <Badge tone="violet">{latest.tag}</Badge>
              <span className="text-xs text-ink-400">{latest.date}</span>
            </div>
            <h2 className="mt-2 text-lg leading-snug font-bold">{latest.title}</h2>
            <p className="mt-1 text-sm text-ink-500">{latest.description}</p>
          </div>
        </Link>
        <Link to={`/app/narzedzia/${latestTool.id}`} className="flex items-center gap-3 border-t border-line bg-paper/60 px-4 py-3.5">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-volt-200 text-volt-700">
            <CheckSquare className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink-400">Narzędzie do tego impulsu</p>
            <p className="truncate text-sm font-semibold">{latestTool.title}</p>
          </div>
          {downloaded.includes(latestTool.id) ? <Badge tone="volt">Pobrane</Badge> : <ArrowRight className="size-5 text-ink-400" />}
        </Link>
      </Card>

      <UnlockProgress />

      {!answer && (
        <Card className="p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-violet-700">
            <MessageCircleQuestion className="size-4" /> Pytanie od Marty
          </p>
          <p className="mt-2 font-display text-lg leading-snug font-bold">{weeklyQuestion.text}</p>
          <Link to="/app/czat" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900">
            Odpowiedz jednym zdaniem <ArrowRight className="size-4" />
          </Link>
        </Card>
      )}

      <Link to="/app/pliki" className="flex items-center gap-3 rounded-2xl bg-linear-to-br from-violet-600 to-indigo-700 p-4 text-white">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Gift className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-violet-200">Twój prywatny materiał</p>
          <p className="text-sm font-semibold">{bonus.title}</p>
        </div>
        <ChevronRight className="size-5 text-violet-200" />
      </Link>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Poprzednie impulsy</h2>
          <Link to="/app/wideo" className="text-sm font-semibold text-violet-700">Wszystkie</Link>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4">
          {videos.slice(2).map((v) => (
            <Link key={v.id} to={`/app/wideo/${v.id}`} className="w-52 shrink-0 snap-start">
              <VideoPoster poster={v.poster} duration={v.duration} className="aspect-video" watched={watched.includes(v.id)} />
              <p className="mt-2 line-clamp-2 text-sm leading-snug font-semibold">{v.title}</p>
              <p className="mt-0.5 text-xs text-ink-400">{v.date}</p>
            </Link>
          ))}
        </div>
      </section>

      <p className="pt-2 text-center text-xs text-ink-400">{creator.cadence}. Damy Ci znać powiadomieniem.</p>
    </div>
  );
}
