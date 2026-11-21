import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import { Bell, CheckSquare, FileText, Home, Lock, MessageCircle, Play } from "lucide-react";
import { creator } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";

const tabs = [
  { to: "/app", label: "Start", icon: Home, end: true },
  { to: "/app/wideo", label: "Wideo", icon: Play },
  { to: "/app/narzedzia", label: "Narzędzia", icon: CheckSquare },
  { to: "/app/pliki", label: "Pliki", icon: FileText },
  { to: "/app/czat", label: "Czat", icon: MessageCircle },
];

/** Rama „telefonu”: na desktopie wąska kolumna, na mobile pełny ekran. */
export function PhoneFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-dvh bg-ink-900 sm:bg-ink-950 sm:py-6">
      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-paper sm:min-h-[calc(100dvh-3rem)] sm:overflow-hidden sm:rounded-[2rem] sm:shadow-2xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function RecipientLayout() {
  const { joined, chatUnlocked, notificationsRead, name } = useProgress();

  // Do aplikacji wchodzi się wyłącznie przez zaproszenie twórcy.
  if (!joined) return <Navigate to={`/k/${creator.slug}`} replace />;

  return (
    <PhoneFrame>
      <header className="pt-safe sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar name={creator.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[15px] leading-tight font-bold">{creator.channelName}</p>
            <p className="truncate text-xs text-ink-400">Prywatny kanał · {creator.name}</p>
          </div>
          <Link
            to="/app/powiadomienia"
            aria-label="Powiadomienia"
            className="relative inline-flex size-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-900/5"
          >
            <Bell className="size-5" />
            {!notificationsRead && <span className="absolute top-2 right-2 size-2.5 rounded-full border-2 border-white bg-violet-600" />}
          </Link>
          <Link to="/app/profil" aria-label="Twój profil">
            <Avatar name={name || "Ty"} size="sm" className="from-ink-700 to-ink-900" />
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-8">
        <Outlet />
      </main>

      <nav className="pb-safe sticky bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur" aria-label="Kanał">
        <ul className="grid grid-cols-5">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "relative flex flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] font-semibold transition",
                    isActive ? "text-ink-900" : "text-ink-400 hover:text-ink-600",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-ink-900" />}
                    <span className="relative">
                      <Icon className="size-5.5" strokeWidth={isActive ? 2.4 : 2} />
                      {label === "Czat" && !chatUnlocked && (
                        <Lock className="absolute -top-1 -right-2 size-3.5 rounded-full bg-white p-0.5 text-violet-600" strokeWidth={3} />
                      )}
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </PhoneFrame>
  );
}

export function PageTitle({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-2xl font-bold">{title}</h1>
      {lead && <p className="mt-1 text-sm text-ink-500">{lead}</p>}
    </div>
  );
}
