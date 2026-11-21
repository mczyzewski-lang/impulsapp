import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { creator } from "@/data/mock";
import { API, getCapabilities } from "@/integrations/ai";
import type { Recording } from "./recordings";

/**
 * Publikacja i planowanie: kanał Impulsu + social media.
 * Social media obsługuje zewnętrzny dostawca (Upload-Post) przez serwer Impulsu;
 * bez niego konta i publikacje działają w trybie demo (tylko lokalnie).
 */

export const platforms = [
  { id: "tiktok", name: "TikTok", short: "TT", color: "#111827" },
  { id: "instagram", name: "Instagram Reels", short: "IG", color: "#db2777" },
  { id: "youtube", name: "YouTube Shorts", short: "YT", color: "#dc2626" },
  { id: "facebook", name: "Facebook", short: "FB", color: "#2563eb" },
  { id: "linkedin", name: "LinkedIn", short: "in", color: "#0369a1" },
  { id: "x", name: "X", short: "X", color: "#0f172a" },
] as const;

export type PlatformId = (typeof platforms)[number]["id"];
export type Destination = PlatformId | "impuls";

/** Profil twórcy u dostawcy — jeden na konto twórcy w Impulsie. */
const PROFILE = creator.slug;

/* ───────────── Podpięte konta ───────────── */

export interface SocialAccount {
  platform: string;
  handle: string;
}

const DEMO_ACCOUNTS_KEY = "impuls.social.demoAccounts";

function readDemoAccounts(): SocialAccount[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_ACCOUNTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useSocialAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [demo, setDemo] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { social } = await getCapabilities();
    setDemo(!social);
    if (!social) return setAccounts(readDemoAccounts());
    try {
      const res = await fetch(`${API}/api/social/accounts?profile=${PROFILE}`);
      if (res.ok) setAccounts(((await res.json()) as { accounts: SocialAccount[] }).accounts);
    } catch {
      /* zostaje poprzednia lista */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /**
   * Podpięcie konta. Z dostawcą: przekierowanie na jego stronę logowania do platformy
   * (Impuls nie widzi hasła ani tokenu). W demo: konto jest zaznaczane lokalnie.
   */
  const connect = useCallback(
    async (platform: PlatformId) => {
      setConnecting(platform);
      const { social } = await getCapabilities();
      if (social) {
        try {
          const res = await fetch(`${API}/api/social/connect`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ profile: PROFILE, returnUrl: window.location.href }),
          });
          const data = (await res.json()) as { url?: string };
          if (res.ok && data.url) {
            window.location.assign(data.url);
            return;
          }
        } catch {
          /* nic nie zmieniamy */
        }
        setConnecting(null);
        return;
      }
      const next = [...readDemoAccounts().filter((a) => a.platform !== platform), { platform, handle: "@marta.zielinska" }];
      try {
        localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(next));
      } catch {
        /* tylko do zamknięcia karty */
      }
      setAccounts(next);
      setConnecting(null);
    },
    [],
  );

  return { accounts, demo, connecting, connect, refresh };
}

/* ───────────── Zaplanowane publikacje ───────────── */

export interface ScheduledPost {
  id: string;
  title: string;
  image?: string;
  caption: string;
  destinations: Destination[];
  /** Termin publikacji (ISO). */
  at: string;
  status: "scheduled" | "published" | "failed";
}

function daysFromNow(days: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// Przykładowe wpisy, żeby kalendarz nie był pusty przy pierwszym wejściu.
let posts: ScheduledPost[] = [
  { id: "p-1", title: "Jak wycenić ofertę, żeby nie tłumaczyć się z ceny", image: "/videos/wycena.jpg", caption: "Trzy elementy wyceny, po których rozmowa o pieniądzach przestaje być niezręczna.", destinations: ["impuls", "instagram", "tiktok"], at: daysFromNow(-2, 18), status: "published" },
  { id: "p-2", title: "Follow-up, który nie brzmi jak naganianie", image: "/videos/follow-up.jpg", caption: "Wnieś coś nowego zamiast „czy miał Pan czas zerknąć”.", destinations: ["impuls", "linkedin"], at: daysFromNow(1, 7, 30), status: "scheduled" },
  { id: "p-3", title: "3 sygnały, że klient jest gotowy na decyzję", image: "/videos/sygnaly-decyzji.jpg", caption: "Po czym poznać, że czas przestać przekonywać.", destinations: ["instagram", "youtube", "tiktok"], at: daysFromNow(3, 18), status: "scheduled" },
];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useScheduledPosts() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => posts,
  );
}

export function cancelPost(id: string) {
  posts = posts.filter((p) => p.id !== id);
  emit();
}

export interface PublishRequest {
  recording: Recording;
  caption: string;
  destinations: Destination[];
  /** null = opublikuj teraz. */
  at: Date | null;
}

/**
 * Publikuje albo planuje wideo. Kanał Impulsu jest w tym prototypie zapisem lokalnym.
 * Social media idą do dostawcy, jeśli jest podłączony; w przeciwnym razie wpis trafia tylko do kalendarza.
 */
export async function publish({ recording, caption, destinations, at }: PublishRequest): Promise<{ demo: boolean; error?: string }> {
  const social = destinations.filter((d): d is PlatformId => d !== "impuls");
  const { social: connected } = await getCapabilities();
  let error: string | undefined;

  if (connected && social.length) {
    const form = new FormData();
    form.append("user", PROFILE);
    social.forEach((platform) => form.append("platform[]", platform));
    form.append("title", caption);
    // Nagranie z kamery wysyłamy jako plik; materiał z kanału — jako publiczny adres.
    if (recording.blob) form.append("video", recording.blob, "impuls.mp4");
    else form.append("video", new URL(recording.src, window.location.origin).toString());
    if (at) form.append("scheduled_date", at.toISOString());
    try {
      const res = await fetch(`${API}/api/social/publish`, { method: "POST", body: form });
      if (!res.ok) error = ((await res.json()) as { error?: string }).error ?? "Publikacja nie powiodła się";
    } catch {
      error = "Brak połączenia z serwerem";
    }
  }

  posts = [
    {
      id: `p-${Date.now()}`,
      title: recording.title,
      image: recording.image,
      caption,
      destinations,
      at: (at ?? new Date()).toISOString(),
      status: error ? "failed" : at ? "scheduled" : "published",
    },
    ...posts,
  ];
  emit();
  return { demo: !connected, error };
}
