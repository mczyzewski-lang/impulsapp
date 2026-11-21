import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, CheckSquare, ChevronDown, FileText, Home, Lock, LockOpen, Mail, MessageCircle, Play, ShieldCheck } from "lucide-react";
import { defaultChannel } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Sheet } from "./Sheet";
import { ToolSheet } from "./ToolSheet";

const tabs = [
  { to: "/app", label: "Start", icon: Home, end: true },
  { to: "/app/wideo", label: "Wideo", icon: Play },
  { to: "/app/narzedzia", label: "Narzędzia", icon: CheckSquare },
  { to: "/app/pliki", label: "Pliki", icon: FileText },
  { to: "/app/czat", label: "Czat", icon: MessageCircle },
];

/**
 * Rama aplikacji o stałej wysokości. Na telefonie zajmuje cały ekran,
 * na desktopie wygląda jak urządzenie. Sama się nie przewija — przewija się
 * tylko obszar treści (ScreenScroll / <main>), więc nagłówek i nawigacja stoją w miejscu.
 */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="h-dvh overflow-hidden bg-ink-900 sm:flex sm:items-center sm:justify-center sm:bg-ink-950 sm:p-6">
      <div className="h-full sm:max-h-[880px] sm:w-[412px] sm:rounded-[3rem] sm:border sm:border-white/10 sm:bg-ink-800 sm:p-2.5 sm:shadow-2xl sm:shadow-black/60">
        <div className={cn("relative flex h-full flex-col overflow-hidden bg-paper sm:rounded-[2.4rem]", className)}>{children}</div>
      </div>
    </div>
  );
}

/** Przewijany obszar treści wewnątrz ramki. */
export function ScreenScroll({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-phone-scroll className="no-scrollbar relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className={cn("flex min-h-full flex-col", className)}>{children}</div>
    </div>
  );
}

/* ───────────── Akcje dostępne z każdego ekranu kanału ───────────── */

interface AppUi {
  openTool: (id: string) => void;
}
const AppUiContext = createContext<AppUi | null>(null);

export function useAppUi() {
  const ctx = useContext(AppUiContext);
  if (!ctx) throw new Error("useAppUi musi być użyty wewnątrz RecipientLayout");
  return ctx;
}

/* ───────────── Przełącznik kanałów ───────────── */

function ChannelSwitcher({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { channel, joinedChannels, pendingInvites, switchChannel } = useProgress();

  function pick(slug: string) {
    switchChannel(slug);
    onClose();
    navigate("/app");
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-30">
          <motion.button
            type="button"
            aria-label="Zamknij listę kanałów"
            className="absolute inset-0 cursor-default bg-ink-950/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="menu"
            aria-label="Twoje kanały"
            className="pt-safe absolute inset-x-0 top-0 rounded-b-[1.75rem] bg-white shadow-2xl"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button type="button" onClick={onClose} className="flex w-full items-center gap-2 px-4 pt-4 pb-2 text-left text-sm font-semibold text-ink-400">
              Twoje kanały
              <ChevronDown className="size-4 rotate-180" />
            </button>
            <ul className="px-2">
              {joinedChannels.map(({ channel: c, stepsDone, chatUnlocked }) => {
                const active = c.creator.slug === channel.creator.slug;
                return (
                  <li key={c.creator.slug}>
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => pick(c.creator.slug)}
                      className={cn("flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left", active ? "bg-paper" : "hover:bg-paper/60")}
                    >
                      <Avatar name={c.creator.name} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-[15px] font-bold">{c.creator.channelName}</span>
                        <span className="block truncate text-xs text-ink-400">
                          {c.creator.name} · {chatUnlocked ? "czat odblokowany" : `${stepsDone}/3 do czatu`}
                        </span>
                      </span>
                      {active && <Check className="size-5 text-violet-600" strokeWidth={2.5} />}
                    </button>
                  </li>
                );
              })}
            </ul>

            {pendingInvites.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">Zaproszenia</p>
                <ul className="px-2">
                  {pendingInvites.map((c) => (
                    <li key={c.creator.slug}>
                      <Link to={`/k/${c.creator.slug}`} onClick={onClose} role="menuitem" className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-paper/60">
                        <Avatar name={c.creator.name} className="opacity-70" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-[15px] font-bold">{c.creator.channelName}</span>
                          <span className="block truncate text-xs text-ink-400">{c.creator.name} zaprasza Cię do kanału</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                          <Mail className="size-3" /> Otwórz
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="flex items-start gap-2 px-4 pt-3 pb-5 text-xs text-ink-400">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              Kanały pojawiają się tu tylko z zaproszeń od twórców. Nie ma wyszukiwarki ani poleceń.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ───────────── Layout kanału ───────────── */

export default function RecipientLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { joined, channel, chatUnlocked, stepsDone, steps, notificationsRead, name } = useProgress();
  const { creator } = channel;

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [toolId, setToolId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const ui = useMemo<AppUi>(() => ({ openTool: setToolId }), []);
  const closeTool = useCallback(() => setToolId(null), []);

  // Informacja zwrotna po zaliczeniu kroku — żeby postęp nie zmieniał się „po cichu”.
  const previous = useRef({ slug: creator.slug, stepsDone });
  useEffect(() => {
    const prev = previous.current;
    previous.current = { slug: creator.slug, stepsDone };
    if (prev.slug !== creator.slug) {
      setToast(null);
      return;
    }
    if (stepsDone <= prev.stepsDone) return;
    if (stepsDone === steps.length) {
      setToast(null);
      setToolId(null);
      setCelebrate(true);
      return;
    }
    setToast(`Krok zaliczony · ${stepsDone}/${steps.length} do odblokowania czatu`);
  }, [creator.slug, stepsDone, steps.length]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  // Do aplikacji wchodzi się wyłącznie przez zaproszenie twórcy.
  if (!joined) return <Navigate to={`/k/${defaultChannel.creator.slug}`} replace />;

  // Wideo jest pełnoekranowe: nagłówek leży na materiale, nawigacja jest ciemna.
  const immersive = pathname.startsWith("/app/wideo");

  return (
    <AppUiContext.Provider value={ui}>
      <PhoneFrame className={immersive ? "bg-black" : undefined}>
        <header
          className={cn(
            "pt-safe z-20 shrink-0",
            immersive
              ? "absolute inset-x-0 top-0 bg-linear-to-b from-black/70 to-transparent text-white"
              : "border-b border-line bg-white",
          )}
        >
          <div className="flex items-center gap-1 px-3 py-2.5">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={switcherOpen}
              aria-label={`Kanał: ${creator.channelName}. Zmień kanał`}
              onClick={() => setSwitcherOpen(true)}
              className={cn("flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 pr-2 text-left", immersive ? "hover:bg-white/10" : "hover:bg-ink-900/5")}
            >
              <Avatar name={creator.name} />
              <span className="min-w-0">
                <span className="flex items-center gap-1 font-display text-[15px] leading-tight font-bold">
                  <span className="truncate">{creator.channelName}</span>
                  <ChevronDown className="size-4 shrink-0 opacity-60" strokeWidth={2.5} />
                </span>
                <span className={cn("block truncate text-xs", immersive ? "text-white/70" : "text-ink-400")}>Prywatny kanał · {creator.name}</span>
              </span>
            </button>
            <Link
              to="/app/powiadomienia"
              aria-label="Powiadomienia"
              className={cn("relative inline-flex size-10 shrink-0 items-center justify-center rounded-full", immersive ? "hover:bg-white/10" : "text-ink-600 hover:bg-ink-900/5")}
            >
              <Bell className="size-5" />
              {!notificationsRead && <span className="absolute top-2 right-2 size-2.5 rounded-full bg-violet-500 ring-2 ring-white" />}
            </Link>
            <Link to="/app/profil" aria-label="Twój profil" className="shrink-0 p-1">
              <Avatar name={name || "Ty"} size="sm" className="from-ink-700 to-ink-900 ring-1 ring-white/30" />
            </Link>
          </div>
        </header>

        <main
          data-phone-scroll
          className={cn("no-scrollbar relative min-h-0 flex-1", immersive ? "overflow-hidden" : "overflow-y-auto overscroll-contain px-4 pt-5 pb-8")}
        >
          {/* Krótkie przenikanie zamiast twardego przeskoku między ekranami */}
          <motion.div key={pathname.split("/").slice(0, 3).join("/")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }} className={immersive ? "h-full" : undefined}>
            <Outlet />
          </motion.div>
        </main>

        <nav className={cn("pb-safe z-20 shrink-0 border-t", immersive ? "border-white/10 bg-black text-white" : "border-line bg-white")} aria-label="Kanał">
          <ul className="grid grid-cols-5">
            {tabs.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "relative flex flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] font-semibold transition-colors",
                      immersive ? (isActive ? "text-white" : "text-white/50") : isActive ? "text-ink-900" : "text-ink-400",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className={cn("absolute top-0 h-0.5 w-8 rounded-full", immersive ? "bg-volt-400" : "bg-ink-900")} />}
                      <span className="relative">
                        <Icon className="size-5.5" strokeWidth={isActive ? 2.4 : 2} />
                        {label === "Czat" && !chatUnlocked && (
                          <Lock className={cn("absolute -top-1 -right-2 size-3.5 rounded-full p-0.5", immersive ? "bg-black text-volt-400" : "bg-white text-violet-600")} strokeWidth={3} />
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

        {/* Warstwy nad ekranem — wszystkie wewnątrz ramki telefonu */}
        <AnimatePresence>
          {toast && (
            <motion.div
              role="status"
              className="pointer-events-none absolute inset-x-0 top-20 z-50 flex justify-center px-4"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xl">
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-volt-400 text-ink-950">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {toast}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <ChannelSwitcher open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
        <ToolSheet toolId={toolId} onClose={closeTool} />

        <Sheet open={celebrate} onClose={() => setCelebrate(false)} title="Wszystkie kroki wykonane">
          <div className="pt-2 pb-2 text-center">
            <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-volt-400">
              <LockOpen className="size-7" />
            </span>
            <h2 className="mt-5 text-2xl font-bold">Czat z {creator.firstNameIns} odblokowany</h2>
            <p className="mx-auto mt-2 max-w-xs text-[15px] text-ink-500">
              Twoja aktywność dała Ci bezpośredni kontakt. Masz jedną wiadomość na ten impuls — wykorzystaj ją dobrze.
            </p>
            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={() => {
                setCelebrate(false);
                navigate("/app/czat");
              }}
            >
              Napisz do {creator.firstNameGen}
            </Button>
            <Button variant="ghost" className="mt-2 w-full" onClick={() => setCelebrate(false)}>
              Później
            </Button>
          </div>
        </Sheet>
      </PhoneFrame>
    </AppUiContext.Provider>
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
