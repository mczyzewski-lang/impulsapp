import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Lokalny stan odbiorcy (mock zamiast backendu).
 * Trzyma aktywność, od której zależy odblokowanie czatu.
 */

export const UNLOCK_RULES = { videos: 3, tools: 1, answers: 1 } as const;

interface ProgressState {
  joined: boolean;
  name: string;
  watched: string[];
  downloaded: string[];
  checked: Record<string, number[]>;
  answer: string | null;
  message: string | null;
  notificationsRead: boolean;
}

const initial: ProgressState = {
  joined: false,
  name: "",
  watched: [],
  downloaded: [],
  checked: {},
  answer: null,
  message: null,
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

interface ProgressContextValue extends ProgressState {
  steps: UnlockStep[];
  stepsDone: number;
  chatUnlocked: boolean;
  join: (name: string) => void;
  markWatched: (id: string) => void;
  markDownloaded: (id: string) => void;
  toggleCheck: (toolId: string, index: number) => void;
  submitAnswer: (text: string) => void;
  sendMessage: (text: string) => void;
  readNotifications: () => void;
  reset: () => void;
}

const STORAGE_KEY = "impuls.progress.v1";
const ProgressContext = createContext<ProgressContextValue | null>(null);

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
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

  const join = useCallback((name: string) => setState((s) => ({ ...s, joined: true, name })), []);
  const markWatched = useCallback(
    (id: string) => setState((s) => (s.watched.includes(id) ? s : { ...s, watched: [...s.watched, id] })),
    [],
  );
  const markDownloaded = useCallback(
    (id: string) => setState((s) => (s.downloaded.includes(id) ? s : { ...s, downloaded: [...s.downloaded, id] })),
    [],
  );
  const toggleCheck = useCallback(
    (toolId: string, index: number) =>
      setState((s) => {
        const list = s.checked[toolId] ?? [];
        const next = list.includes(index) ? list.filter((i) => i !== index) : [...list, index];
        return { ...s, checked: { ...s.checked, [toolId]: next } };
      }),
    [],
  );
  const submitAnswer = useCallback((text: string) => setState((s) => ({ ...s, answer: text })), []);
  const sendMessage = useCallback((text: string) => setState((s) => ({ ...s, message: text })), []);
  const readNotifications = useCallback(() => setState((s) => ({ ...s, notificationsRead: true })), []);
  const reset = useCallback(() => setState(initial), []);

  const value = useMemo<ProgressContextValue>(() => {
    const steps: UnlockStep[] = [
      {
        id: "videos",
        label: `Obejrzyj ${UNLOCK_RULES.videos} materiały wideo`,
        hint: "Wideo powitalne też się liczy.",
        current: Math.min(state.watched.length, UNLOCK_RULES.videos),
        target: UNLOCK_RULES.videos,
        done: state.watched.length >= UNLOCK_RULES.videos,
        to: "/app/wideo",
      },
      {
        id: "tools",
        label: "Pobierz 1 narzędzie",
        hint: "Checklista, szablon albo arkusz.",
        current: Math.min(state.downloaded.length, UNLOCK_RULES.tools),
        target: UNLOCK_RULES.tools,
        done: state.downloaded.length >= UNLOCK_RULES.tools,
        to: "/app/narzedzia",
      },
      {
        id: "answers",
        label: "Odpowiedz na 1 pytanie od twórcy",
        hint: "Jedno zdanie wystarczy.",
        current: state.answer ? 1 : 0,
        target: UNLOCK_RULES.answers,
        done: Boolean(state.answer),
        to: "/app/czat",
      },
    ];
    const stepsDone = steps.filter((s) => s.done).length;
    return {
      ...state,
      steps,
      stepsDone,
      chatUnlocked: stepsDone === steps.length,
      join,
      markWatched,
      markDownloaded,
      toggleCheck,
      submitAnswer,
      sendMessage,
      readNotifications,
      reset,
    };
  }, [state, join, markWatched, markDownloaded, toggleCheck, submitAnswer, sendMessage, readNotifications, reset]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress musi być użyty wewnątrz ProgressProvider");
  return ctx;
}
