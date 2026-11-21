import { Bell, CheckSquare, FileText, Home, Lock, MessageCircle, Play } from "lucide-react";
import { creator, tools, videos } from "@/data/mock";
import { Avatar } from "@/components/ui/Avatar";
import { VideoPoster } from "@/components/ui/VideoPoster";
import { cn } from "@/lib/cn";

/** Statyczna makieta kanału w telefonie — używana na landing page. */
export function PhoneMock({ className }: { className?: string }) {
  const featured = videos[1];
  return (
    <div
      className={cn(
        "relative w-[300px] rounded-[2.6rem] border border-white/10 bg-ink-950 p-2.5 shadow-2xl shadow-black/60",
        className,
      )}
      aria-hidden
    >
      <div className="absolute top-4 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink-950" />
      <div className="overflow-hidden rounded-[2.1rem] bg-paper text-ink-900">
        <div className="flex items-center gap-2.5 bg-white px-4 pt-10 pb-3">
          <Avatar name={creator.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] leading-tight font-bold">{creator.channelName}</p>
            <p className="truncate text-[11px] text-ink-400">{creator.name}</p>
          </div>
          <Bell className="size-4 text-ink-400" />
        </div>

        <div className="space-y-3 px-3.5 pt-3 pb-4">
          <div className="rounded-2xl bg-ink-900 p-3 text-white">
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <Lock className="size-3.5 text-volt-400" />
              Odblokuj czat z twórcą: 1/3 kroków
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/15">
              <div className="h-full w-1/3 rounded-full bg-volt-400" />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-2.5">
            <VideoPoster poster={featured.poster} duration={featured.duration} className="aspect-video" />
            <p className="mt-2 text-[10px] font-semibold tracking-wide text-violet-600 uppercase">{featured.tag}</p>
            <p className="text-[13px] leading-snug font-bold">{featured.title}</p>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-white p-2.5">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-volt-200 text-volt-700">
              <CheckSquare className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold">{tools[0].title}</p>
              <p className="text-[10px] text-ink-400">Checklista · 5 min</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 border-t border-line bg-white px-1 pt-2 pb-3 text-[9px] font-semibold text-ink-400">
          {[
            { icon: Home, label: "Start", active: true },
            { icon: Play, label: "Wideo" },
            { icon: CheckSquare, label: "Narzędzia" },
            { icon: FileText, label: "Pliki" },
            { icon: MessageCircle, label: "Czat" },
          ].map(({ icon: Icon, label, active }) => (
            <span key={label} className={cn("flex flex-col items-center gap-1", active && "text-ink-900")}>
              <Icon className="size-4" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
