import { Link } from "react-router-dom";
import { ArrowRight, Check, CheckSquare, ChevronRight, Gift, MessageCircleQuestion, Play } from "lucide-react";
import { useProgress } from "@/state/progress";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UnlockProgress } from "@/components/UnlockProgress";
import { useAppUi } from "./RecipientLayout";

/** Pionowa okładka materiału — zapowiedź pełnoekranowego wideo. */
function ReelCover({ poster, className, children }: { poster: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-linear-to-b text-white", poster, className)}>
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/80 to-transparent" />
      {children}
    </div>
  );
}

export default function UserChannelHome() {
  const { name, channel, watched, downloaded, answer } = useProgress();
  const { openTool } = useAppUi();
  const { creator, videos, tools, files, weeklyQuestion } = channel;

  const welcome = videos[0];
  const latest = videos[1] ?? welcome;
  const latestTool = tools.find((t) => t.id === latest.toolId);
  const bonus = files.find((f) => f.isBonus);
  const earlier = videos.filter((v) => v.id !== latest.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ink-500">Cześć{name ? `, ${name}` : ""}</p>
        <h1 className="text-2xl leading-tight font-bold">Twój impuls na ten tydzień</h1>
      </div>

      <Card className="overflow-hidden">
        <Link to={`/app/wideo/${latest.id}`} className="block p-2.5">
          <ReelCover poster={latest.poster} className="aspect-[4/5]">
            <span className="absolute top-1/2 left-1/2 inline-flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink-900 shadow-xl">
              <Play className="ml-1 size-6" fill="currentColor" />
            </span>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">{latest.tag}</span>
                <span className="text-white/70">{latest.date} · {latest.duration}</span>
                {watched.includes(latest.id) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-volt-400 px-2.5 py-1 text-ink-950">
                    <Check className="size-3.5" strokeWidth={3} /> Obejrzane
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-xl leading-tight font-bold text-balance">{latest.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-white/80">{latest.description}</p>
            </div>
          </ReelCover>
        </Link>
        {latestTool && (
          <button type="button" onClick={() => openTool(latestTool.id)} className="flex w-full items-center gap-3 border-t border-line bg-paper/60 px-4 py-3.5 text-left">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-volt-200 text-volt-700">
              <CheckSquare className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-ink-400">Narzędzie do tego impulsu</span>
              <span className="block truncate text-sm font-semibold">{latestTool.title}</span>
            </span>
            {downloaded.includes(latestTool.id) ? <Badge tone="volt">Pobrane</Badge> : <ArrowRight className="size-5 text-ink-400" />}
          </button>
        )}
      </Card>

      <UnlockProgress />

      <Card className="p-4">
        <p className="flex items-center gap-2 text-xs font-semibold text-violet-700">
          <MessageCircleQuestion className="size-4" /> Pytanie od {creator.firstNameGen}
        </p>
        <p className="mt-2 font-display text-lg leading-snug font-bold">{weeklyQuestion.text}</p>
        {answer ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-volt-700">
            <Check className="size-4" strokeWidth={3} /> Twoja odpowiedź została wysłana
          </p>
        ) : (
          <Link to="/app/czat" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900">
            Odpowiedz jednym zdaniem <ArrowRight className="size-4" />
          </Link>
        )}
      </Card>

      {bonus && (
        <Link to="/app/pliki" className="flex items-center gap-3 rounded-2xl bg-linear-to-br from-violet-600 to-indigo-700 p-4 text-white">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Gift className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-violet-200">Twój prywatny materiał</span>
            <span className="block text-sm font-semibold">{bonus.title}</span>
          </span>
          <ChevronRight className="size-5 text-violet-200" />
        </Link>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Pozostałe wideo</h2>
          <Link to="/app/wideo" className="text-sm font-semibold text-violet-700">Wszystkie</Link>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4">
          {earlier.map((v) => (
            <Link key={v.id} to={`/app/wideo/${v.id}`} className="w-36 shrink-0 snap-start">
              <ReelCover poster={v.poster} className="aspect-[9/16]">
                {watched.includes(v.id) && (
                  <span className="absolute top-2 left-2 inline-flex size-6 items-center justify-center rounded-full bg-volt-400 text-ink-950">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <p className="text-[10px] font-semibold text-white/70">{v.tag} · {v.duration}</p>
                  <p className="mt-0.5 line-clamp-3 text-[13px] leading-snug font-semibold">{v.title}</p>
                </div>
              </ReelCover>
            </Link>
          ))}
        </div>
      </section>

      <p className="pt-2 text-center text-xs text-ink-400">{creator.cadence}. Damy Ci znać powiadomieniem.</p>
    </div>
  );
}
