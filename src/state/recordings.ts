import { useSyncExternalStore } from "react";
import { videos, type VideoFormat } from "@/data/mock";

/** Scenariusz do promptera: otwarcie (hook albo pytanie) i treść. */
export interface Script {
  /** hook — otwarcie czyta twórca; question — pytanie czyta lektor. */
  mode: "hook" | "question";
  opener: string;
  body: string;
}

export interface Recording {
  id: string;
  title: string;
  src: string;
  image?: string;
  /** Oryginalny plik — potrzebny do transkrypcji. Brak przy nagraniach demo. */
  blob?: Blob;
  format: VideoFormat;
  duration: number;
  script: Script;
  createdAt: string;
}

export const sampleScript: Script = {
  mode: "hook",
  opener: "Przestań zaczynać rozmowę od oferty.",
  body: "Zamiast tego zadaj jedno pytanie: co zmieniło się u Ciebie w ostatnich miesiącach? Potem słuchaj. Klient sam powie, czego potrzebuje. Dopiero wtedy zaproponuj kolejny krok.",
};

/** Materiały z kanału, które powstały w aplikacji — mają dostęp do Studia wideo. */
function fromChannel(): Recording[] {
  return videos
    .filter((v) => v.src)
    .map((v) => ({
      id: v.id,
      title: v.title,
      src: v.src!,
      image: v.image,
      format: v.format,
      duration: 6.1,
      script: { mode: "hook" as const, opener: v.title + ".", body: v.takeaways.join(" ") },
      createdAt: v.date,
    }));
}

// Nagrania żyją w pamięci karty — bez backendu nie ma gdzie ich trwale zapisać.
let recordings: Recording[] = fromChannel();
const listeners = new Set<() => void>();

export function addRecording(recording: Recording) {
  recordings = [recording, ...recordings];
  listeners.forEach((l) => l());
}

export function useRecordings() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => recordings,
  );
}

export function scriptText(script: Script) {
  return `${script.opener} ${script.body}`.trim();
}
