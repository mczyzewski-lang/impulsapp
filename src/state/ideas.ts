import { useSyncExternalStore } from "react";
import type { Script } from "./recordings";

/**
 * Baza treści twórcy: myśli wyciągnięte z jego rozmów z czatem AI.
 * Każda myśl jest od razu scenariuszem (hook / pytanie + treść) i szkicem maila.
 *
 * Kluczowy pomysł: porządkowanie wiedzy wykonuje czat użytkownika (zna jego rozmowy),
 * a Impuls wymusza format odpowiedzi i rozkłada ją na pola — bez własnego wywołania AI.
 */

export interface Idea {
  id: string;
  topic: string;
  hook: string;
  question: string;
  body: string;
  task: string;
  emailSubject: string;
  emailBody: string;
  /** Czy mail trafił do kolejki newslettera. */
  emailQueued: boolean;
  recorded: boolean;
}

/* ───────────── Prompt do wklejenia w czat ───────────── */

export interface PromptOptions {
  /** history — czat ma sięgnąć do wszystkiego, co wie o użytkowniku; thread — tylko bieżąca rozmowa. */
  source: "history" | "thread";
  count: number;
  audience: string;
}

export function buildPrompt({ source, count, audience }: PromptOptions) {
  const scope =
    source === "history"
      ? "Sięgnij do wszystkiego, co wiesz o mnie z naszych dotychczasowych rozmów i z pamięci: moich metod, przekonań, powtarzających się rad, historii z pracy z klientami i błędów, przed którymi przestrzegam."
      : "Oprzyj się wyłącznie na tej rozmowie: na tym, co w niej ustaliliśmy, moich wnioskach, przykładach i sformułowaniach.";

  return `Jesteś moim redaktorem. ${scope}

Wybierz ${count} najmocniejszych, konkretnych myśli, które przydadzą się tej grupie: ${audience || "moim odbiorcom"}.
Pisz moim językiem i moimi przykładami. Nie wymyślaj faktów, liczb ani historii, których nie podałem. Jeśli czegoś nie wiesz, pomiń to.

Każdą myśl zapisz DOKŁADNIE w tym formacie, bez dodatkowych komentarzy przed i po:

=== IMPULS 1 ===
TEMAT: krótka nazwa tematu
HOOK: jedno mocne zdanie do powiedzenia na początku wideo (do 12 słów)
PYTANIE: pytanie, które zadałby mi odbiorca, a na które ta myśl odpowiada
TREŚĆ: 60–90 słów do powiedzenia na głos, krótkie zdania, jedna myśl, na końcu konkretny wniosek
ZADANIE: jedno działanie, które odbiorca może wykonać jeszcze dziś
MAIL_TEMAT: temat maila (do 50 znaków)
MAIL: 80–120 słów maila na ten sam temat, w pierwszej osobie, bez powitania i podpisu

Kolejne myśli numeruj: === IMPULS 2 ===, === IMPULS 3 === i tak dalej.`;
}

/* ───────────── Rozkładanie odpowiedzi czatu ───────────── */

const FIELDS: [RegExp, keyof Pick<Idea, "topic" | "hook" | "question" | "body" | "task" | "emailSubject" | "emailBody">][] = [
  [/^mail[ _]temat$|^temat maila$/i, "emailSubject"],
  [/^mail$/i, "emailBody"],
  [/^temat$/i, "topic"],
  [/^hook$/i, "hook"],
  [/^pytanie$/i, "question"],
  [/^tre[śs][ćc]$/i, "body"],
  [/^zadanie$/i, "task"],
];

// Etykieta na początku linii; czaty lubią dodawać pogrubienie i punktory, więc je tolerujemy.
const LABEL = /^\s*(?:[-*•]\s*)?\**\s*(MAIL[ _]TEMAT|TEMAT MAILA|MAIL|TEMAT|HOOK|PYTANIE|TRE[ŚS][ĆC]|ZADANIE)\s*\**\s*:\s*\**\s*(.*)$/i;
const SEPARATOR = /^\s*(?:#+\s*)?(?:={2,}|\*{2,})?\s*IMPULS\s*\d+\s*(?:={2,}|\*{2,})?\s*:?\s*$/i;

const clean = (text: string) => text.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
const newId = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function blank(): Idea {
  return { id: newId(), topic: "", hook: "", question: "", body: "", task: "", emailSubject: "", emailBody: "", emailQueued: false, recorded: false };
}

function firstSentence(text: string) {
  return (text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text).trim();
}

/**
 * Zamienia wklejony tekst na listę myśli.
 * Najpierw próbuje formatu z promptu (=== IMPULS n === + etykiety). Jeśli go nie ma,
 * traktuje tekst jak zwykłe notatki: każdy akapit to osobna myśl.
 */
export function parseIdeas(text: string): { ideas: Idea[]; structured: boolean } {
  const lines = text.replace(/\r/g, "").split("\n");
  const ideas: Idea[] = [];
  let current: Idea | null = null;
  let field: keyof Idea | null = null;
  let sawLabel = false;

  const push = () => {
    if (current && (current.hook || current.body || current.question)) ideas.push(current);
  };

  for (const line of lines) {
    if (SEPARATOR.test(line)) {
      push();
      current = blank();
      field = null;
      continue;
    }
    const match = line.match(LABEL);
    if (match) {
      sawLabel = true;
      const key = FIELDS.find(([pattern]) => pattern.test(match[1].trim()))?.[1];
      // Powtórzona etykieta TEMAT bez separatora też zaczyna nową myśl.
      if (!current || (key === "topic" && current.topic)) {
        push();
        current = blank();
      }
      field = key ?? null;
      if (field && current) (current[field] as string) = clean(match[2]);
      continue;
    }
    if (current && field && line.trim()) (current[field] as string) = clean(`${current[field] as string} ${line}`);
  }
  push();

  if (sawLabel && ideas.length) {
    for (const idea of ideas) {
      idea.topic ||= firstSentence(idea.hook || idea.body).replace(/[.!?]+$/, "");
      idea.hook ||= firstSentence(idea.body);
      idea.emailSubject ||= idea.topic;
      idea.emailBody ||= idea.body;
    }
    return { ideas, structured: true };
  }

  // Zwykłe notatki: akapit = myśl, pierwsze zdanie = hook.
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => clean(p.replace(/^#+\s*/gm, "")))
    .filter((p) => p.split(" ").length >= 8);
  return {
    structured: false,
    ideas: paragraphs.map((p) => {
      const hook = firstSentence(p);
      const rest = p.slice(hook.length).trim() || p;
      return { ...blank(), topic: hook.replace(/[.!?]+$/, "").slice(0, 70), hook, body: rest, emailSubject: hook.replace(/[.!?]+$/, "").slice(0, 50), emailBody: p };
    }),
  };
}

export function toScript(idea: Idea, mode: Script["mode"]): Script {
  return { mode, opener: mode === "question" && idea.question ? idea.question : idea.hook, body: idea.task ? `${idea.body} ${idea.task}` : idea.body };
}

/** Przykładowa odpowiedź czatu — do szybkiego wypróbowania bez wklejania własnej. */
export const sampleResponse = `=== IMPULS 1 ===
TEMAT: Pytanie zamiast prezentacji
HOOK: Przestań zaczynać rozmowę od oferty.
PYTANIE: Jak zacząć rozmowę z klientem, żeby nie brzmieć jak sprzedawca?
TREŚĆ: Większość ekspertów zaczyna od tego, co umie. Klienta to nie obchodzi. Zapytaj, co zmieniło się u niego w ostatnich miesiącach. Potem słuchaj. Ludzie sami mówią, czego potrzebują, jeśli dasz im na to minutę. Dopiero wtedy zaproponuj kolejny krok. Oferta, która wynika z rozmowy, nie wymaga przekonywania.
ZADANIE: Zadaj to pytanie w najbliższej rozmowie i nie przerywaj przez minutę.
MAIL_TEMAT: Jedno pytanie zamiast prezentacji
MAIL: Przez lata zaczynałam spotkania od slajdów o sobie. Klienci kiwali głowami i nie kupowali. Zmieniło się to, kiedy zaczęłam od jednego pytania: co zmieniło się u Ciebie w ostatnich miesiącach? Odpowiedź zwykle trwa kilka minut i zawiera wszystko, czego potrzebuję, żeby zaproponować sensowny kolejny krok. Nie muszę zgadywać ani przekonywać. Spróbuj tego w najbliższej rozmowie. Nagrałam też krótkie wideo, w którym pokazuję, jak słuchać odpowiedzi, żeby nie wrócić odruchowo do prezentowania.

=== IMPULS 2 ===
TEMAT: Dwie opcje zamiast jednej ceny
HOOK: Jedna cena to zaproszenie do targowania.
PYTANIE: Co zrobić, kiedy klient od razu prosi o rabat?
TREŚĆ: Kiedy pokazujesz jedną cenę, klient ma dwie możliwości: tak albo nie. Albo trzecią: taniej. Pokaż dwie opcje z jasną różnicą w zakresie. Wtedy rozmowa przestaje dotyczyć tego, czy, a zaczyna dotyczyć tego, którą. Rabat bez zmiany zakresu uczy, że pierwsza cena była zawyżona. Zmieniaj zakres, nie cenę.
ZADANIE: Przepisz jedną ofertę tak, żeby miała dwie opcje.
MAIL_TEMAT: Rabat? Najpierw zmień zakres
MAIL: Prośba o rabat nie jest atakiem na Twoją cenę. To pytanie, czy da się taniej. Zwykle się da, tylko nie za to samo. Dlatego zawsze przygotowuję dwie opcje i jasno pokazuję, czym się różnią. Kiedy klient chce zejść z ceny, pytam, z czego chce zrezygnować. Najczęściej okazuje się, że z niczego, i wybiera pełną wersję. W kanale znajdziesz wzór oferty na jednej stronie, który możesz od razu wypełnić.

=== IMPULS 3 ===
TEMAT: Follow-up z nową wartością
HOOK: „Czy miał Pan czas zerknąć” to najgorszy follow-up.
PYTANIE: Jak wrócić do klienta po ciszy i nie wyjść na natręta?
TREŚĆ: Przypomnienie bez niczego nowego to prośba o uwagę. Wnieś coś: przykład klienta w podobnej sytuacji, jedną liczbę, krótką odpowiedź na wątpliwość z rozmowy. Trzymaj rytm trzy, siedem, czternaście dni. Trzy wiadomości z wartością to nie za dużo. Jedna bez wartości to o jedną za dużo.
ZADANIE: Wyślij dziś jeden zaległy follow-up z jedną nową myślą.
MAIL_TEMAT: Follow-up, który nie jest przypomnieniem
MAIL: Długo myślałam, że follow-up to przypominanie się. Dlatego go nie lubiłam i odkładałam tygodniami. Teraz traktuję go jak kolejną porcję pomocy: wysyłam przykład, liczbę albo odpowiedź na pytanie, które padło na spotkaniu. Klient dostaje powód, żeby odpisać, a ja nie czuję, że kogoś nagabuję. Trzymam prosty rytm: trzeci, siódmy i czternasty dzień. W kanale czekają trzy gotowe wiadomości, które możesz dopasować do siebie.`;

/* ───────────── Magazyn ───────────── */

const KEY = "impuls.ideas.v1";
let ideas: Idea[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Idea[];
  } catch {
    return [];
  }
})();
const listeners = new Set<() => void>();

function commit(next: Idea[]) {
  ideas = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* zostaje w pamięci karty */
  }
  listeners.forEach((l) => l());
}

export function useIdeas() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => ideas,
  );
}

export const addIdeas = (items: Idea[]) => commit([...items, ...ideas]);
export const updateIdea = (id: string, patch: Partial<Idea>) => commit(ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)));
export const removeIdea = (id: string) => commit(ideas.filter((i) => i.id !== id));
