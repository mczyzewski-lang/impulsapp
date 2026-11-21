import { Bell, Check, CheckSquare, ChevronDown, FileText, Home, ListChecks, Lock, MessageCircle, Play } from "lucide-react";
import { creator, tools, videos } from "@/data/mock";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

const tabs = [
  { icon: Home, label: "Start" },
  { icon: Play, label: "Wideo" },
  { icon: CheckSquare, label: "Narzędzia" },
  { icon: FileText, label: "Pliki" },
  { icon: MessageCircle, label: "Czat" },
];

/**
 * Makieta aplikacji odbiorcy na landing page — odwzorowuje jej aktualny, ciemny wygląd.
 * view="feed": pełnoekranowe wideo; view="home": ekran Start z impulsem tygodnia.
 */
export function PhoneMock({ className, view = "feed" }: { className?: string; view?: "feed" | "home" }) {
  const featured = videos[1];
  const activeTab = view === "feed" ? "Wideo" : "Start";

  return (
    <div className={cn("relative w-[300px] rounded-[2.6rem] border border-white/10 bg-ink-800 p-2.5 shadow-2xl shadow-black/60", className)} aria-hidden>
      <div className="flex h-[600px] flex-col overflow-hidden rounded-[2.1rem] bg-[#070b18] text-white">
        <div className="flex shrink-0 items-center gap-2.5 border-b border-white/10 px-3.5 pt-4 pb-2.5">
          <Avatar name={creator.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[13px] leading-tight font-bold">
              <span className="truncate">{creator.channelName}</span>
              <ChevronDown className="size-3 shrink-0 opacity-60" strokeWidth={3} />
            </p>
            <p className="truncate text-[10px] text-ink-400">Prywatny kanał · {creator.name}</p>
          </div>
          <Bell className="size-4 text-ink-300" />
        </div>

        {view === "feed" ? (
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <video src={featured.src} poster={featured.image} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute right-2.5 bottom-20 flex flex-col items-center gap-3 text-[8px] font-semibold">
              <span className="flex flex-col items-center gap-0.5">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                  <ListChecks className="size-4" />
                </span>
                Wnioski
              </span>
              <span className="flex flex-col items-center gap-0.5">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-volt-400 text-ink-950">
                  <CheckSquare className="size-4" />
                </span>
                Narzędzie
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3.5 pr-14">
              <p className="flex items-center gap-1.5 text-[9px] font-semibold">
                <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">{featured.tag}</span>
                <span className="text-white/70">{featured.duration}</span>
              </p>
              <p className="mt-1.5 font-display text-[15px] leading-tight font-bold">{featured.title}</p>
              <div className="mt-2.5 h-0.5 rounded-full bg-white/25">
                <div className="h-full w-2/5 rounded-full bg-volt-400" />
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-2.5 overflow-hidden px-3 pt-3">
            <p className="font-display text-[15px] font-bold">Twój impuls na ten tydzień</p>
            <div className="rounded-2xl border border-white/10 bg-ink-800 p-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <img src={featured.image} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/80 to-transparent" />
                <span className="absolute top-1/2 left-1/2 inline-flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink-900">
                  <Play className="ml-0.5 size-4" fill="currentColor" />
                </span>
                <p className="absolute inset-x-2.5 bottom-2 font-display text-[12px] leading-tight font-bold">{featured.title}</p>
              </div>
              <div className="flex items-center gap-2 px-1 pt-2 pb-0.5">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-volt-400/15 text-volt-300">
                  <CheckSquare className="size-3.5" />
                </span>
                <p className="min-w-0 truncate text-[11px] font-semibold">{tools[0].title}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink-800 p-3">
              <p className="flex items-center gap-2 text-[11px] font-semibold">
                <Lock className="size-3.5 text-volt-400" /> Odblokuj czat z twórcą: 1/3 kroków
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-white/15">
                <div className="h-full w-1/3 rounded-full bg-volt-400" />
              </div>
              <ul className="mt-2.5 space-y-1.5 text-[10px] text-ink-300">
                <li className="flex items-center gap-2">
                  <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-volt-400 text-ink-950">
                    <Check className="size-2.5" strokeWidth={4} />
                  </span>
                  <span className="line-through">Obejrzyj 3 materiały wideo</span>
                </li>
                <li className="flex items-center gap-2"><span className="size-3.5 rounded-full border border-white/30" /> Pobierz 1 narzędzie</li>
                <li className="flex items-center gap-2"><span className="size-3.5 rounded-full border border-white/30" /> Odpowiedz na 1 pytanie</li>
              </ul>
            </div>
          </div>
        )}

        <div className="grid shrink-0 grid-cols-5 border-t border-white/10 px-1 pt-2 pb-3 text-[9px] font-semibold text-ink-400">
          {tabs.map(({ icon: Icon, label }) => (
            <span key={label} className={cn("relative flex flex-col items-center gap-1", label === activeTab && "text-white")}>
              {label === activeTab && <span className="absolute -top-2 h-0.5 w-6 rounded-full bg-volt-400" />}
              <Icon className="size-4" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
