import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, Loader2, Plus, Trash2, Video } from "lucide-react";
import { cancelPost, platforms, useScheduledPosts, useSocialAccounts, type ScheduledPost } from "@/state/publishing";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "../CreatorLayout";
import { PlatformChip } from "./PlatformChip";

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const status = {
  scheduled: { label: "Zaplanowane", tone: "violet" },
  published: { label: "Opublikowane", tone: "green" },
  failed: { label: "Błąd publikacji", tone: "amber" },
} as const;

function dayLabel(date: Date) {
  const today = new Date();
  const diff = Math.round((new Date(date).setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) / 86400000);
  if (diff === 0) return "Dziś";
  if (diff === 1) return "Jutro";
  if (diff === -1) return "Wczoraj";
  return date.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
}

/** Publikacje: plan na najbliższe dni we wszystkich miejscach naraz. Układ pod telefon — lista dzień po dniu. */
export default function CreatorCalendar() {
  const posts = useScheduledPosts();
  const { accounts, demo, connecting, connect } = useSocialAccounts();
  const justAdded = Boolean((useLocation().state as { justAdded?: boolean } | null)?.justAdded);
  const [day, setDay] = useState<string | null>(null);

  // Pasek tygodnia: dziś i sześć kolejnych dni.
  const week = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
      }),
    [],
  );

  const groups = useMemo(() => {
    const visible = [...posts].filter((p) => !day || dayKey(new Date(p.at)) === day).sort((a, b) => +new Date(a.at) - +new Date(b.at));
    const map = new Map<string, ScheduledPost[]>();
    for (const post of visible) {
      const key = dayKey(new Date(post.at));
      map.set(key, [...(map.get(key) ?? []), post]);
    }
    return [...map.values()];
  }, [posts, day]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Publikacje"
        lead="Jedno nagranie, wiele miejsc. Tu widzisz, co i kiedy trafi do kanału w Impulsie i do social mediów."
        action={
          <Link to="/studio/nagraj" className={buttonClass("dark")}>
            <Video className="size-4.5" /> Nagraj wideo
          </Link>
        }
      />

      {justAdded && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-volt-200 px-4 py-3 text-sm font-semibold text-volt-700">
          <Check className="size-4" strokeWidth={3} /> Dodano do planu publikacji.
        </p>
      )}

      {/* Konta */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">Połączone konta</h2>
          <span className="text-xs text-ink-400">{accounts.length} z {platforms.length}</span>
        </div>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          {platforms.map((p) => {
            const account = accounts.find((a) => a.platform === p.id);
            return account ? (
              <span key={p.id} className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-white py-1.5 pr-3.5 pl-1.5 text-sm font-semibold">
                <PlatformChip id={p.id} size="sm" /> {p.name}
                <Check className="size-3.5 text-emerald-600" strokeWidth={3} />
              </span>
            ) : (
              <button key={p.id} type="button" disabled={connecting === p.id} onClick={() => void connect(p.id)} className="flex shrink-0 items-center gap-2 rounded-full border border-dashed border-ink-300 py-1.5 pr-3.5 pl-1.5 text-sm font-semibold text-ink-500 hover:border-ink-900 hover:text-ink-900">
                <PlatformChip id={p.id} size="sm" /> {p.name}
                {connecting === p.id ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-400">
          {demo
            ? "Tryb demo: konta podpinają się na niby. Po podłączeniu dostawcy w panelu administratora przycisk otworzy logowanie do wybranej platformy."
            : "Logujesz się bezpośrednio na stronie platformy. Impuls nie widzi Twojego hasła."}
        </p>
      </Card>

      {/* Pasek tygodnia */}
      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <button type="button" aria-pressed={day === null} onClick={() => setDay(null)} className={cn("shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-semibold", day === null ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white")}>
          Wszystkie
        </button>
        {week.map((d) => {
          const key = dayKey(d);
          const count = posts.filter((p) => dayKey(new Date(p.at)) === key).length;
          return (
            <button key={key} type="button" aria-pressed={day === key} onClick={() => setDay(key)} className={cn("relative w-14 shrink-0 rounded-2xl border py-2 text-center", day === key ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white")}>
              <span className={cn("block text-[11px] font-semibold uppercase", day === key ? "text-ink-300" : "text-ink-400")}>{d.toLocaleDateString("pl-PL", { weekday: "short" })}</span>
              <span className="block font-display text-lg leading-tight font-bold">{d.getDate()}</span>
              {count > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-violet-500" aria-label={`${count} publikacji`} />}
            </button>
          );
        })}
      </div>

      {/* Lista dzień po dniu */}
      <div className="mt-5 space-y-6">
        {groups.length === 0 && (
          <Card className="p-8 text-center">
            <p className="font-semibold">Nic nie jest zaplanowane na ten dzień.</p>
            <p className="mt-1 text-sm text-ink-500">Nagraj wideo, zmontuj je w studiu i wybierz termin.</p>
          </Card>
        )}
        {groups.map((group) => (
          <section key={group[0].id}>
            <h2 className="mb-2 text-sm font-semibold text-ink-500 first-letter:uppercase">{dayLabel(new Date(group[0].at))}</h2>
            <div className="space-y-2.5">
              {group.map((post) => (
                <Card key={post.id} className="flex gap-3 p-3">
                  {post.image ? <img src={post.image} alt="" className="h-20 w-14 shrink-0 rounded-xl object-cover" /> : <span className="h-20 w-14 shrink-0 rounded-xl bg-ink-900" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-bold tabular-nums">{new Date(post.at).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</span>
                      <Badge tone={status[post.status].tone}>{status[post.status].label}</Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-sm font-semibold">{post.title}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      {post.destinations.map((d) => (
                        <PlatformChip key={d} id={d} size="sm" />
                      ))}
                    </div>
                  </div>
                  {post.status === "scheduled" && (
                    <button type="button" aria-label={`Anuluj publikację: ${post.title}`} onClick={() => cancelPost(post.id)} className="inline-flex size-10 shrink-0 items-center justify-center self-center rounded-lg text-ink-400 hover:bg-ink-900/5">
                      <Trash2 className="size-4.5" />
                    </button>
                  )}
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
