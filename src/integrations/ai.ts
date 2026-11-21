/**
 * Integracje AI studia wideo: ElevenLabs (lektor, napisy) i OpenAI (infografiki).
 *
 * Klucze API nie mogą trafić do przeglądarki, dlatego frontend rozmawia wyłącznie
 * z własnym serwerem pośredniczącym (server/index.mjs, ścieżki /api/*).
 * Gdy serwer nie działa albo nie ma kluczy, każda funkcja ma tryb demo,
 * dzięki czemu studio da się przejść w całości bez backendu.
 */

const API = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export interface Capabilities {
  elevenlabs: boolean;
  openai: boolean;
}

let capabilities: Promise<Capabilities> | null = null;

/** Sprawdza, które integracje są podłączone na serwerze. */
export function getCapabilities(): Promise<Capabilities> {
  capabilities ??= (async () => {
    try {
      const res = await fetch(`${API}/api/health`);
      // Hosting statyczny zwraca tu index.html — liczy się tylko prawdziwy JSON z serwera.
      if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) throw new Error("brak API");
      const data = (await res.json()) as Partial<Capabilities>;
      return { elevenlabs: Boolean(data.elevenlabs), openai: Boolean(data.openai) };
    } catch {
      return { elevenlabs: false, openai: false };
    }
  })();
  return capabilities;
}

/* ───────────── Lektor (ElevenLabs Text to Speech) ───────────── */

let current: { stop: () => void } | null = null;

export function stopSpeaking() {
  current?.stop();
  current = null;
}

/** Czyta tekst głosem lektora. Zwraca Promise rozwiązywany po zakończeniu czytania. */
export async function speak(text: string): Promise<void> {
  stopSpeaking();
  const { elevenlabs } = await getCapabilities();

  if (elevenlabs) {
    try {
      const res = await fetch(`${API}/api/tts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const url = URL.createObjectURL(await res.blob());
        const audio = new Audio(url);
        await new Promise<void>((resolve) => {
          const done = () => {
            URL.revokeObjectURL(url);
            resolve();
          };
          current = { stop: () => { audio.pause(); done(); } };
          audio.onended = done;
          audio.onerror = done;
          void audio.play().catch(done);
        });
        return;
      }
    } catch {
      /* przechodzimy do trybu demo */
    }
  }

  // Tryb demo: głos systemowy przeglądarki. Limit czasu chroni przed zawieszeniem, gdy głos jest niedostępny.
  await new Promise<void>((resolve) => {
    const fallback = setTimeout(resolve, Math.min(12000, 1200 + text.length * 70));
    const done = () => {
      clearTimeout(fallback);
      resolve();
    };
    current = { stop: () => { window.speechSynthesis?.cancel(); done(); } };
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pl-PL";
    utterance.onend = done;
    utterance.onerror = done;
    window.speechSynthesis.speak(utterance);
  });
}

/* ───────────── Napisy (ElevenLabs Speech to Text) ───────────── */

export interface Caption {
  id: string;
  start: number;
  end: number;
  text: string;
}

const WORDS_PER_CAPTION = 5;

/** Tryb demo: napisy z tekstu promptera, rozłożone równomiernie na czas nagrania. */
export function captionsFromScript(script: string, duration: number): Caption[] {
  const words = script.split(/\s+/).filter(Boolean);
  if (words.length === 0 || duration <= 0) return [];
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += WORDS_PER_CAPTION) chunks.push(words.slice(i, i + WORDS_PER_CAPTION).join(" "));
  const per = duration / chunks.length;
  return chunks.map((text, i) => ({ id: `c${i}`, start: +(i * per).toFixed(2), end: +((i + 1) * per).toFixed(2), text }));
}

interface ScribeWord {
  text: string;
  start: number;
  end: number;
  type?: string;
}

/**
 * Generuje napisy. Z podłączonym ElevenLabs wysyła nagranie do transkrypcji
 * i grupuje słowa w krótkie linie; bez niego korzysta z tekstu promptera.
 */
export async function transcribe(source: { blob?: Blob; script: string; duration: number }): Promise<{ captions: Caption[]; demo: boolean }> {
  const { elevenlabs } = await getCapabilities();

  if (elevenlabs && source.blob) {
    try {
      const form = new FormData();
      form.append("file", source.blob, "nagranie");
      form.append("model_id", "scribe_v1");
      form.append("language_code", "pl");
      const res = await fetch(`${API}/api/transcribe`, { method: "POST", body: form });
      if (res.ok) {
        const data = (await res.json()) as { words?: ScribeWord[] };
        const words = (data.words ?? []).filter((w) => w.type !== "spacing" && w.text.trim());
        const captions: Caption[] = [];
        for (let i = 0; i < words.length; i += WORDS_PER_CAPTION) {
          const group = words.slice(i, i + WORDS_PER_CAPTION);
          captions.push({ id: `c${i}`, start: group[0].start, end: group[group.length - 1].end, text: group.map((w) => w.text).join(" ") });
        }
        if (captions.length) return { captions, demo: false };
      }
    } catch {
      /* przechodzimy do trybu demo */
    }
  }

  return { captions: captionsFromScript(source.script, source.duration), demo: true };
}

/* ───────────── Infografiki (OpenAI Images) ───────────── */

export interface InfographicRequest {
  title: string;
  points: string[];
  brandName: string;
  accentColor: string;
  dark: boolean;
}

/**
 * Generuje infografikę w stylu marki. Zwraca adres obrazu albo null,
 * gdy OpenAI nie jest podłączone — wtedy studio pokazuje kartę złożoną lokalnie.
 */
export async function generateInfographic(request: InfographicRequest): Promise<string | null> {
  const { openai } = await getCapabilities();
  if (!openai) return null;

  const prompt = [
    "Pionowa infografika do krótkiego wideo edukacyjnego, czysty nowoczesny styl, dużo powietrza, czytelna typografia bezszeryfowa.",
    `Tło: ${request.dark ? "ciemny granat" : "jasne, prawie białe"}. Kolor akcentu marki: ${request.accentColor}.`,
    `Tytuł (po polsku, dokładnie w tym brzmieniu): „${request.title}”.`,
    request.points.length ? `Punkty (po polsku, dokładnie w tym brzmieniu): ${request.points.map((p, i) => `${i + 1}. ${p}`).join(" ")}` : "",
    `W stopce mały podpis: ${request.brandName}. Bez zdjęć ludzi, bez logotypów innych marek.`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(`${API}/api/infographic`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { image?: string };
    return data.image ?? null;
  } catch {
    return null;
  }
}
