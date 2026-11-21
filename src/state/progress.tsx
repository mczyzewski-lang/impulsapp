import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { channelBySlug, channels, defaultChannel, type Channel } from "@/data/mock";

/**
 * Lokalny stan odbiorcy (mock zamiast backendu).
 * Odbiorca może należeć do wielu kanałów — aktywność i postęp
 * odblokowania czatu są liczone osobno dla każdego z nich.
 */

export const UNLOCK_RULES = { videos: 3, tools: 1, answers: 1 } as const;

interface ChannelProgress {
  watched: string[];
  downloaded: string[];
  checked: Record<string, number[]>;
  answer: string | null;
  message: string | null;
}

const emptyProgress: ChannelProgress = { watched: [], downloaded: [], checked: {}, answer: null, message: null };

interface ProgressState {
  name: string;
  /** Slugi kanałów, do których odbiorca dołączył (zawsze przez zaproszenie). */
  joinedSlugs: string[];
  activeSlug: string;
  byChannel: Record<string, ChannelProgress>;
  notificationsRead: boolean;
}

const initial: ProgressState = {
  name: "",
  joinedSlugs: [],
  activeSlug: defaultChannel.creator.slug,
  byChannel: {},
  notificationsRead: false,
};

export interface UnlockStep {
  id: "videos" | "tools" | "answers";
  label: string;
  hint: string;
  current: number;
  target: number;
  done: boolean;
  to: string;
}

export interface ChannelSummary {
  channel: Channel;
  stepsDone: number;
  chatUnlocked: boolean;
}

interface ProgressContextValue extends ChannelProgress {
  name: string;
  joined: boolean;
  joinedSlugs: string[];
  /** Aktywny kanał wraz z jego treścią. */
  channel: Channel;
  joinedChannels: ChannelSummary[];
  pendingInvites: Channel[];
  notificationsRead: boolean;
  steps: UnlockStep[];
  stepsDone: number;
  chatUnlocked: boolean;
  join: (slug: string, name?: string) => void;
  switchChannel: (slug: string) => void;
  markWatched: (id: string) => void;
  markDownloaded: (id: string) => void;
  toggleCheck: (toolId: string, index: number) => void;
  submitAnswer: (text: string) => void;
  sendMessage: (text: string) => void;
  readNotifications: () => void;
  reset: () => void;
}

const STORAGE_KEY = "impuls.progress.v2";
const ProgressContext = createContext<ProgressContextValue | null>(null);

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

function stepsDoneOf(p: ChannelProgress) {
  return (
    Number(p.watched.length >= UNLOCK_RULES.videos) +
    Number(p.downloaded.length >= UNLOCK_RULES.tools) +
    Number(Boolean(p.answer))
  );
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* brak dostępu do storage — stan zostaje w pamięci */
    }
  }, [state]);

  /** Zmiana postępu w aktywnym kanale. */
  const patch = useCallback((fn: (p: ChannelProgress) => ChannelProgress) => {
    setState((s) => {
      const current = s.byChannel[s.activeSlug] ?? emptyProgress;
      const next = fn(current);
      return next === current ? s : { ...s, byChannel: { ...s.byChannel, [s.activeSlug]: next } };
    });
  }, []);

  const join = useCallback(
    (slug: string, name?: string) =>
      setState((s) => ({
        ...s,
        name: name ?? s.name,
        activeSlug: slug,
        joinedSlugs: s.joinedSlugs.includes(slug) ? s.joinedSlugs : [...s.joinedSlugs, slug],
      })),
    [],
  );
  const switchChannel = useCallback(
    (slug: string) => setState((s) => (s.joinedSlugs.includes(slug) ? { ...s, activeSlug: slug } : s)),
    [],
  );
  const markWatched = useCallback(
    (id: string) => patch((p) => (p.watched.includes(id) ? p : { ...p, watched: [...p.watched, id] })),
    [patch],
  );
  const markDownloaded = useCallback(
    (id: string) => patch((p) => (p.downloaded.includes(id) ? p : { ...p, downloaded: [...p.downloaded, id] })),
    [patch],
  );
  const toggleCheck = useCallback(
    (toolId: string, index: number) =>
      patch((p) => {
        const list = p.checked[toolId] ?? [];
        const next = list.includes(index) ? list.filter((i) => i !== index) : [...list, index];
        return { ...p, checked: { ...p.checked, [toolId]: next } };
      }),
    [patch],
  );
  const submitAnswer = useCallback((text: string) => patch((p) => ({ ...p, answer: text })), [patch]);
  const sendMessage = useCallback((text: string) => patch((p) => ({ ...p, message: text })), [patch]);
  const readNotifications = useCallback(
    () => setState((s) => (s.notificationsRead ? s : { ...s, notificationsRead: true })),
    [],
  );
  const reset = useCallback(() => setState(initial), []);

  const value = useMemo<ProgressContextValue>(() => {
    const progress = state.byChannel[state.activeSlug] ?? emptyProgress;
    const steps: UnlockStep[] = [
      {
        id: "videos",
        label: `Obejrzyj ${UNLOCK_RULES.videos} materiały wideo`,
        hint: "Wideo powitalne też się liczy.",
        current: Math.min(progress.watched.length, UNLOCK_RULES.videos),
        target: UNLOCK_RULES.videos,
        done: progress.watched.length >= UNLOCK_RULES.videos,
        to: "/app/wideo",
      },
      {
        id: "tools",
        label: "Pobierz 1 narzędzie",
        hint: "Checklista, szablon albo arkusz.",
        current: Math.min(progress.downloaded.length, UNLOCK_RULES.tools),
        target: UNLOCK_RULES.tools,
        done: progress.downloaded.length >= UNLOCK_RULES.tools,
        to: "/app/narzedzia",
      },
      {
        id: "answers",
        label: "Odpowiedz na 1 pytanie od twórcy",
        hint: "Jedno zdanie wystarczy.",
        current: progress.answer ? 1 : 0,
        target: UNLOCK_RULES.answers,
        done: Boolean(progress.answer),
        to: "/app/czat",
      },
    ];
    const stepsDone = steps.filter((s) => s.done).length;

    return {
      ...progress,
      name: state.name,
      joined: state.joinedSlugs.length > 0,
      joinedSlugs: state.joinedSlugs,
      channel: channelBySlug(state.activeSlug),
      joinedChannels: state.joinedSlugs.map((slug) => {
        const done = stepsDoneOf(state.byChannel[slug] ?? emptyProgress);
        return { channel: channelBySlug(slug), stepsDone: done, chatUnlocked: done === 3 };
      }),
      pendingInvites: channels.filter((c) => !state.joinedSlugs.includes(c.creator.slug)),
      notificationsRead: state.notificationsRead,
      steps,
      stepsDone,
      chatUnlocked: stepsDone === steps.length,
      join,
      switchChannel,
      markWatched,
      markDownloaded,
      toggleCheck,
      submitAnswer,
      sendMessage,
      readNotifications,
      reset,
    };
  }, [state, join, switchChannel, markWatched, markDownloaded, toggleCheck, submitAnswer, sendMessage, readNotifications, reset]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress musi być użyty wewnątrz ProgressProvider");
  return ctx;
}
