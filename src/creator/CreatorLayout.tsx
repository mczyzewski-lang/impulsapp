import { useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3, CalendarClock, ExternalLink, FolderOpen, LayoutDashboard, Lightbulb, Link2, Menu, MessagesSquare, PanelTop, Plus, Radio, Settings, Trophy, Users, Video, X,
} from "lucide-react";
import { creator } from "@/data/mock";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

const nav = [
  { to: "/studio", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/studio/kanal", label: "Mój kanał", icon: Radio },
  { to: "/studio/materialy", label: "Materiały", icon: FolderOpen },
  { to: "/studio/tresci", label: "Treści", icon: Lightbulb },
  { to: "/studio/nagraj", label: "Nagraj wideo", icon: Video },
  { to: "/studio/kalendarz", label: "Publikacje", icon: CalendarClock },
  { to: "/studio/odbiorcy", label: "Odbiorcy", icon: Users },
  { to: "/studio/ambasadorzy", label: "Ambasadorzy", icon: Trophy },
  { to: "/studio/interakcje", label: "Czat i interakcje", icon: MessagesSquare, badge: 3 },
  { to: "/studio/analityka", label: "Analityka", icon: BarChart3 },
  { to: "/studio/strona", label: "Strona zapisu", icon: PanelTop },
  { to: "/studio/linki", label: "Linki i kampanie", icon: Link2 },
  { to: "/studio/ustawienia", label: "Ustawienia", icon: Settings },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-ink-900 text-white">
      <div className="pt-safe px-5">
        <Link to="/" className="flex h-16 items-center" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>
      <div className="px-3">
        <Link to="/studio/impuls" onClick={onNavigate} className={buttonClass("primary", "md", "w-full")}>
          <Plus className="size-4.5" strokeWidth={2.5} /> Dodaj impuls
        </Link>
      </div>
      <nav className="mt-5 flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="Panel twórcy">
        {nav.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white",
              )
            }
          >
            <Icon className="size-4.5" />
            <span className="flex-1">{label}</span>
            {badge && <span className="rounded-full bg-volt-400 px-1.5 text-[11px] font-bold text-ink-950">{badge}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="pb-safe border-t border-white/10 p-3">
        <Link
          to={`/k/${creator.slug}`}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-white/5"
        >
          <Avatar name={creator.name} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{creator.channelName}</span>
            <span className="block truncate text-xs text-ink-400">Zobacz kanał jako odbiorca</span>
          </span>
          <ExternalLink className="size-4 text-ink-400" />
        </Link>
      </div>
    </div>
  );
}

export default function CreatorLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-paper lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile: górny pasek + wysuwane menu */}
      <header className="pt-safe sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <button type="button" aria-label="Otwórz menu" onClick={() => setOpen(true)} className="-ml-2 inline-flex size-10 items-center justify-center rounded-lg">
            <Menu className="size-5.5" />
          </button>
          <Logo tone="dark" className="text-lg" />
          <Link to="/studio/impuls" aria-label="Dodaj impuls" className="inline-flex size-9 items-center justify-center rounded-lg bg-volt-400">
            <Plus className="size-5" strokeWidth={2.5} />
          </Link>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Zamknij menu" className="absolute inset-0 bg-ink-950/60" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72 max-w-[85%]">
            <Sidebar onNavigate={() => setOpen(false)} />
            <button type="button" aria-label="Zamknij menu" onClick={() => setOpen(false)} className="pt-safe absolute top-4 right-3 text-ink-300">
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <main key={location.pathname} className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}

export function PageHeader({ title, lead, action }: { title: string; lead?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[1.75rem] leading-tight font-bold sm:text-3xl">{title}</h1>
        {lead && <p className="mt-1.5 max-w-2xl text-ink-500">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

/** Wspólne style pól formularza w panelu. */
export const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base font-normal sm:text-[15px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-ink-900";
export const labelClass = "block text-sm font-semibold text-ink-900";
