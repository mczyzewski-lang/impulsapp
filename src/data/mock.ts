/**
 * Dane przykładowe. Brak backendu — wszystko poniżej to mock,
 * który docelowo zastąpi API.
 */

export interface Creator {
  slug: string;
  name: string;
  /** Imię w odmianie — potrzebne w tekstach typu „pytanie od Marty”, „czat z Martą”. */
  firstName: string;
  firstNameGen: string;
  firstNameIns: string;
  role: string;
  channelName: string;
  promise: string;
  bio: string;
  cadence: string;
}

export const creator: Creator = {
  slug: "marta-zielinska",
  name: "Marta Zielińska",
  firstName: "Marta",
  firstNameGen: "Marty",
  firstNameIns: "Martą",
  role: "Strategia sprzedaży dla ekspertów i małych firm",
  channelName: "Sprzedaż bez spiny",
  promise: "Krótkie impulsy, które zamieniasz w rozmowy z klientami — jeszcze w tym tygodniu.",
  bio: "Od 11 lat pomagam ekspertom sprzedawać bez presji i bez skryptów. Tutaj dostajesz to, czego nie mieszczę w mailach.",
  cadence: "Nowy impuls w każdy wtorek",
};

export type VideoFormat = "9:16" | "1:1" | "16:9";

export interface Video {
  id: string;
  /** Proporcje nagrania. Odtwarzacz dopasowuje się do każdej z nich. */
  format: VideoFormat;
  title: string;
  description: string;
  duration: string;
  date: string;
  tag: string;
  poster: string;
  isWelcome?: boolean;
  takeaways: string[];
  toolId?: string;
}

export const videos: Video[] = [
  {
    id: "start",
    format: "9:16",
    title: "Zacznij tutaj: jak wycisnąć najwięcej z tego kanału",
    description:
      "Dwie minuty o tym, co tu znajdziesz, jak często się odzywam i jak odblokować bezpośredni kontakt ze mną.",
    duration: "2:14",
    date: "Wideo powitalne",
    tag: "Start",
    poster: "from-violet-600 via-indigo-700 to-ink-900",
    isWelcome: true,
    takeaways: [
      "Co tydzień jeden impuls: krótkie wideo i narzędzie do wdrożenia.",
      "Wszystkie materiały zostają w kanale — wracasz, kiedy chcesz.",
      "Aktywność odblokowuje czat ze mną.",
    ],
  },
  {
    id: "pytanie-otwierajace",
    format: "9:16",
    title: "Jedno pytanie, które otwiera rozmowę sprzedażową",
    description:
      "Zamiast prezentować ofertę, zacznij od pytania, po którym klient sam opowiada, czego potrzebuje.",
    duration: "4:32",
    date: "18 listopada",
    tag: "Impuls #12",
    poster: "from-sky-500 via-blue-700 to-ink-900",
    takeaways: [
      "Pytanie o „co się zmieniło”, a nie o „czego szukasz”.",
      "Jak słuchać odpowiedzi, żeby nie przejść od razu do oferty.",
      "Zadanie: użyj pytania w jednej rozmowie do piątku.",
    ],
    toolId: "rozmowa-7-krokow",
  },
  {
    id: "wycena",
    format: "16:9",
    title: "Jak wycenić ofertę, żeby nie tłumaczyć się z ceny",
    description: "Trzy elementy wyceny, które sprawiają, że rozmowa o pieniądzach przestaje być niezręczna.",
    duration: "6:05",
    date: "11 listopada",
    tag: "Impuls #11",
    poster: "from-emerald-500 via-teal-700 to-ink-900",
    takeaways: [
      "Cena wynika z efektu, a nie z liczby godzin.",
      "Zawsze dwie opcje — nigdy jedna.",
      "Zadanie: przepisz jedną ofertę według schematu.",
    ],
    toolId: "audyt-oferty",
  },
  {
    id: "follow-up",
    format: "1:1",
    title: "Follow-up, który nie brzmi jak naganianie",
    description: "Jak wrócić do klienta po ciszy i dać mu powód, żeby odpisał.",
    duration: "3:48",
    date: "4 listopada",
    tag: "Impuls #10",
    poster: "from-fuchsia-500 via-purple-700 to-ink-900",
    takeaways: [
      "Wnieś coś nowego zamiast „czy miał Pan czas zerknąć”.",
      "Rytm 3–7–14 dni.",
      "Zadanie: wyślij dziś jeden zaległy follow-up.",
    ],
    toolId: "follow-up-szablony",
  },
  {
    id: "sygnaly-decyzji",
    format: "9:16",
    title: "3 sygnały, że klient jest gotowy na decyzję",
    description: "Po czym poznać, że czas przestać przekonywać i po prostu zaproponować kolejny krok.",
    duration: "5:20",
    date: "28 października",
    tag: "Impuls #9",
    poster: "from-amber-500 via-orange-700 to-ink-900",
    takeaways: [
      "Pytania o wdrożenie to sygnał zakupu.",
      "Klient zaczyna mówić „my”.",
      "Zadanie: zapisz sygnały z ostatnich trzech rozmów.",
    ],
  },
];

export type ToolKind = "Checklista" | "Szablon" | "Arkusz";

export interface Tool {
  id: string;
  title: string;
  description: string;
  kind: ToolKind;
  time: string;
  items: string[];
}

export const tools: Tool[] = [
  {
    id: "rozmowa-7-krokow",
    title: "Rozmowa sprzedażowa w 7 krokach",
    description: "Przejdź przez nią przed każdym spotkaniem z klientem. Zajmuje pięć minut.",
    kind: "Checklista",
    time: "5 min",
    items: [
      "Wiem, co zmieniło się u klienta w ostatnich miesiącach",
      "Mam przygotowane pytanie otwierające",
      "Znam jedną liczbę, na której klientowi zależy",
      "Mam dwie opcje współpracy, nie jedną",
      "Wiem, kto oprócz rozmówcy podejmuje decyzję",
      "Mam propozycję konkretnego kolejnego kroku",
      "Termin follow-upu jest w kalendarzu",
    ],
  },
  {
    id: "follow-up-szablony",
    title: "Follow-up po spotkaniu: 3 gotowe wiadomości",
    description: "Szablony na 3., 7. i 14. dzień po rozmowie. Skopiuj, dopasuj, wyślij.",
    kind: "Szablon",
    time: "10 min",
    items: [
      "Dzień 3: podsumowanie rozmowy i jedna nowa myśl",
      "Dzień 7: przykład klienta w podobnej sytuacji",
      "Dzień 14: proste pytanie zamykające temat",
    ],
  },
  {
    id: "audyt-oferty",
    title: "Audyt oferty: czy cena broni się sama",
    description: "Sprawdź swoją ofertę punkt po punkcie, zanim wyślesz ją klientowi.",
    kind: "Arkusz",
    time: "15 min",
    items: [
      "Oferta zaczyna się od sytuacji klienta, nie od mojej firmy",
      "Efekt jest opisany liczbą lub konkretną zmianą",
      "Są dwie opcje z jasną różnicą",
      "Cena pojawia się po efekcie, nie przed nim",
      "Kolejny krok ma datę",
    ],
  },
];

export interface FileItem {
  id: string;
  title: string;
  format: "PDF" | "XLSX" | "DOCX" | "MP3";
  size: string;
  date: string;
  isBonus?: boolean;
}

export const files: FileItem[] = [
  { id: "f1", title: "Mapa rozmowy sprzedażowej — wersja do druku", format: "PDF", size: "1,2 MB", date: "18 listopada", isBonus: true },
  { id: "f2", title: "Kalkulator minimalnej stawki projektu", format: "XLSX", size: "84 KB", date: "11 listopada" },
  { id: "f3", title: "Wzór oferty na jednej stronie", format: "DOCX", size: "112 KB", date: "11 listopada" },
  { id: "f4", title: "Nagranie Q&A — październik", format: "MP3", size: "38 MB", date: "30 października" },
  { id: "f5", title: "20 pytań pogłębiających", format: "PDF", size: "640 KB", date: "21 października" },
];

export const weeklyQuestion = {
  id: "q12",
  text: "Co najczęściej blokuje Cię przed wysłaniem follow-upu do klienta?",
  context: "Twoja odpowiedź trafia tylko do mnie. Z najczęstszych odpowiedzi przygotuję kolejny impuls.",
};

export const selectedQuestions = [
  {
    id: "s1",
    author: "Kasia",
    question: "Jak rozmawiać o cenie, kiedy klient od razu prosi o rabat?",
    answer:
      "Nie broń ceny — zapytaj, z czego klient chce zrezygnować, żeby zmieścić się w budżecie. Rabat bez zmiany zakresu uczy, że pierwsza cena była zawyżona.",
  },
  {
    id: "s2",
    author: "Tomek",
    question: "Ile follow-upów to już za dużo?",
    answer:
      "Trzy z nową wartością to nie za dużo. Jeden bez wartości to o jeden za dużo. Więcej w impulsie #10.",
  },
];

export interface Notification {
  id: string;
  channel: string;
  title: string;
  body: string;
  time: string;
  to: string;
  kind: "video" | "tool" | "chat" | "file";
}

export const notifications: Notification[] = [
  { id: "n1", channel: "marta-zielinska", kind: "video", title: "Nowy impuls od Marty", body: "Jedno pytanie, które otwiera rozmowę sprzedażową", time: "2 godz. temu", to: "/app/wideo/pytanie-otwierajace" },
  { id: "n2", channel: "marta-zielinska", kind: "tool", title: "Nowe narzędzie w kanale", body: "Rozmowa sprzedażowa w 7 krokach", time: "2 godz. temu", to: "/app/narzedzia/rozmowa-7-krokow" },
  { id: "n3", channel: "marta-zielinska", kind: "chat", title: "Marta zadała pytanie", body: "Co najczęściej blokuje Cię przed wysłaniem follow-upu?", time: "wczoraj", to: "/app/czat" },
  { id: "n5", channel: "piotr-malec", kind: "video", title: "Nowy impuls od Piotra", body: "Poduszka finansowa w firmie jednoosobowej", time: "wczoraj", to: "/app/wideo/poduszka" },
  { id: "n4", channel: "marta-zielinska", kind: "file", title: "Materiał bonusowy czeka", body: "Mapa rozmowy sprzedażowej — wersja do druku", time: "3 dni temu", to: "/app/pliki" },
];

/* ───────────── Kanały odbiorcy ───────────── */

export interface Channel {
  creator: Creator;
  videos: Video[];
  tools: Tool[];
  files: FileItem[];
  weeklyQuestion: { id: string; text: string; context: string };
  selectedQuestions: { id: string; author: string; question: string; answer: string }[];
}

/** Drugi kanał — w demo czeka jako zaproszenie w przełączniku kanałów. */
const piotr: Channel = {
  creator: {
    slug: "piotr-malec",
    name: "Piotr Malec",
    firstName: "Piotr",
    firstNameGen: "Piotra",
    firstNameIns: "Piotrem",
    role: "Finanse dla freelancerów i małych firm",
    channelName: "Finanse na spokojnie",
    promise: "Jedna decyzja finansowa tygodniowo. Bez Excela na trzy zakładki.",
    bio: "Doradzam jednoosobowym firmom, jak przestać żyć od faktury do faktury.",
    cadence: "Nowy impuls w każdy czwartek",
  },
  videos: [
    {
      id: "start",
      format: "9:16",
      title: "Zacznij tutaj: jak korzystać z tego kanału",
      description: "Półtorej minuty o tym, co i kiedy tu wysyłam.",
      duration: "1:40",
      date: "Wideo powitalne",
      tag: "Start",
      poster: "from-emerald-600 via-teal-800 to-ink-900",
      isWelcome: true,
      takeaways: ["Jeden impuls w tygodniu.", "Każdy kończy się jedną decyzją.", "Aktywność odblokowuje czat."],
    },
    {
      id: "poduszka",
      format: "1:1",
      title: "Poduszka finansowa w firmie jednoosobowej",
      description: "Ile to „wystarczająco” i jak ją zbudować bez zaciskania pasa.",
      duration: "3:55",
      date: "20 listopada",
      tag: "Impuls #6",
      poster: "from-sky-500 via-cyan-800 to-ink-900",
      takeaways: ["Policz koszty stałe, nie przychody.", "Cel: 3 miesiące kosztów.", "Zadanie: ustaw stały przelew po każdej fakturze."],
      toolId: "kalkulator-poduszki",
    },
    {
      id: "stawka",
      format: "16:9",
      title: "Stawka godzinowa, która pokrywa urlop i chorobę",
      description: "Dlaczego etatowa pensja podzielona przez 168 to za mało.",
      duration: "4:10",
      date: "13 listopada",
      tag: "Impuls #5",
      poster: "from-amber-500 via-orange-800 to-ink-900",
      takeaways: ["Licz 140, nie 168 godzin.", "Dolicz składki, sprzęt i przestoje.", "Zadanie: przelicz swoją stawkę jeszcze dziś."],
    },
  ],
  tools: [
    {
      id: "kalkulator-poduszki",
      title: "Poduszka finansowa krok po kroku",
      description: "Pięć punktów, po których wiesz, ile i gdzie odkładać.",
      kind: "Checklista",
      time: "10 min",
      items: [
        "Znam swoje miesięczne koszty stałe",
        "Mam osobne konto na poduszkę",
        "Stały przelew po każdej fakturze jest ustawiony",
        "Wiem, po ilu miesiącach osiągnę cel",
        "Mam zasadę, kiedy wolno sięgnąć po poduszkę",
      ],
    },
  ],
  files: [
    { id: "p1", title: "Arkusz kosztów stałych", format: "XLSX", size: "62 KB", date: "20 listopada", isBonus: true },
    { id: "p2", title: "Ściąga: stawka godzinowa", format: "PDF", size: "310 KB", date: "13 listopada" },
  ],
  weeklyQuestion: {
    id: "pq6",
    text: "Na ile miesięcy wystarczyłyby Ci dziś oszczędności firmy?",
    context: "Odpowiedź widzę tylko ja. Zbiorcze wyniki pokażę w kolejnym impulsie.",
  },
  selectedQuestions: [
    {
      id: "ps1",
      author: "Ola",
      question: "Czy poduszkę trzymać na koncie firmowym?",
      answer: "Na osobnym, najlepiej oszczędnościowym. Ma być widoczna, ale nie pod ręką.",
    },
  ],
};

/** Kolejność w kanale: najświeższe na górze, wideo powitalne na końcu. */
export function orderVideos(list: Video[]): Video[] {
  return [...list.filter((v) => !v.isWelcome), ...list.filter((v) => v.isWelcome)];
}

export const channels: Channel[] = [
  { creator, videos, tools, files, weeklyQuestion, selectedQuestions },
  piotr,
];

export const defaultChannel = channels[0];

export function channelBySlug(slug: string | undefined): Channel {
  return channels.find((c) => c.creator.slug === slug) ?? defaultChannel;
}

/* ───────────── Panel twórcy ───────────── */

export const kpis = {
  invited: 4280,
  installed: 1312,
  active: 846,
  videoViews: 5934,
  toolDownloads: 1127,
  ctaClicks: 412,
  chatUnlocked: 203,
};

export const funnel = [
  { label: "Zaproszeni z listy emailowej", value: 4280 },
  { label: "Dołączyli do kanału", value: 1312 },
  { label: "Aktywni w ostatnich 30 dniach", value: 846 },
  { label: "Odblokowali czat", value: 203 },
  { label: "Ambasadorzy", value: 64 },
];

export const activitySeries = [312, 340, 328, 395, 420, 410, 468, 502, 489, 560, 612, 640, 702, 846];
export const activityLabels = ["8 lis", "", "", "", "12 lis", "", "", "", "16 lis", "", "", "", "", "21 lis"];

export type Segment = "zimny" | "ciepły" | "aktywny" | "ambasador";

export interface Member {
  id: string;
  name: string;
  email: string;
  segment: Segment;
  score: number;
  videos: number;
  tools: number;
  answers: number;
  cta: number;
  chat: boolean;
  lastActive: string;
  source: string;
}

export const members: Member[] = [
  { id: "m1", name: "Katarzyna Wrona", email: "k.wrona@example.com", segment: "ambasador", score: 96, videos: 12, tools: 5, answers: 6, cta: 4, chat: true, lastActive: "dziś", source: "Mail powitalny" },
  { id: "m2", name: "Tomasz Lis", email: "tomasz.lis@example.com", segment: "ambasador", score: 91, videos: 11, tools: 4, answers: 5, cta: 3, chat: true, lastActive: "dziś", source: "Kampania: checklista" },
  { id: "m3", name: "Agnieszka Bąk", email: "a.bak@example.com", segment: "ambasador", score: 88, videos: 10, tools: 5, answers: 4, cta: 2, chat: true, lastActive: "wczoraj", source: "Mail powitalny" },
  { id: "m4", name: "Paweł Sowa", email: "pawel@example.com", segment: "aktywny", score: 74, videos: 8, tools: 3, answers: 2, cta: 1, chat: true, lastActive: "wczoraj", source: "Kampania: wycena" },
  { id: "m5", name: "Monika Dudek", email: "monika.d@example.com", segment: "aktywny", score: 69, videos: 7, tools: 2, answers: 2, cta: 1, chat: true, lastActive: "2 dni temu", source: "Stopka maila" },
  { id: "m6", name: "Jakub Kania", email: "j.kania@example.com", segment: "aktywny", score: 61, videos: 6, tools: 2, answers: 1, cta: 0, chat: true, lastActive: "2 dni temu", source: "Kampania: checklista" },
  { id: "m7", name: "Ewa Maj", email: "ewa.maj@example.com", segment: "ciepły", score: 44, videos: 3, tools: 1, answers: 0, cta: 1, chat: false, lastActive: "5 dni temu", source: "Mail powitalny" },
  { id: "m8", name: "Marcin Gil", email: "m.gil@example.com", segment: "ciepły", score: 38, videos: 2, tools: 1, answers: 0, cta: 0, chat: false, lastActive: "6 dni temu", source: "Kampania: wycena" },
  { id: "m9", name: "Natalia Okoń", email: "natalia@example.com", segment: "ciepły", score: 31, videos: 2, tools: 0, answers: 1, cta: 0, chat: false, lastActive: "tydzień temu", source: "Stopka maila" },
  { id: "m10", name: "Robert Czyż", email: "r.czyz@example.com", segment: "zimny", score: 12, videos: 1, tools: 0, answers: 0, cta: 0, chat: false, lastActive: "3 tyg. temu", source: "Mail powitalny" },
  { id: "m11", name: "Iwona Szpak", email: "iwona.s@example.com", segment: "zimny", score: 6, videos: 0, tools: 0, answers: 0, cta: 0, chat: false, lastActive: "miesiąc temu", source: "Kampania: checklista" },
];

export const segmentCounts: Record<Segment, number> = {
  zimny: 466,
  ciepły: 579,
  aktywny: 203,
  ambasador: 64,
};

export const segmentInfo: Record<Segment, { label: string; rule: string }> = {
  zimny: { label: "Zimny", rule: "Dołączył, ale nie obejrzał nic od 14 dni" },
  ciepły: { label: "Ciepły", rule: "Ogląda, jeszcze nie wdraża" },
  aktywny: { label: "Aktywny", rule: "Ogląda, pobiera narzędzia, odblokował czat" },
  ambasador: { label: "Ambasador", rule: "Wraca co tydzień, odpowiada i klika CTA" },
};

export interface Answer {
  id: string;
  memberId: string;
  text: string;
  time: string;
  starred?: boolean;
}

export const answers: Answer[] = [
  { id: "a1", memberId: "m1", text: "Boję się, że wyjdę na natręta. Jak klient milczy, zakładam, że nie jest zainteresowany.", time: "12 min temu", starred: true },
  { id: "a2", memberId: "m4", text: "Nie mam nic nowego do powiedzenia, a „przypominam się” brzmi słabo.", time: "40 min temu" },
  { id: "a3", memberId: "m2", text: "Brak systemu. Przypominam sobie o follow-upie po trzech tygodniach i wtedy jest mi już głupio.", time: "1 godz. temu", starred: true },
  { id: "a4", memberId: "m5", text: "Odkładam, bo nie wiem, czy pisać maila, czy dzwonić.", time: "3 godz. temu" },
  { id: "a5", memberId: "m3", text: "Zwykle czekam na „idealny moment”, który nie przychodzi.", time: "wczoraj" },
];

export const inboxMessages = [
  { id: "i1", memberId: "m2", text: "Czy przy ofercie abonamentowej też pokazywać dwie opcje, czy to już za dużo wyboru?", time: "dziś, 9:14" },
  { id: "i2", memberId: "m3", text: "Użyłam pytania otwierającego na wczorajszym spotkaniu — klient mówił 20 minut. Co dalej, żeby nie stracić tego tempa?", time: "wczoraj" },
  { id: "i3", memberId: "m6", text: "Jak wracać do klienta, który powiedział „odezwiemy się po nowym roku”?", time: "2 dni temu" },
];

export const insights = [
  { theme: "Obawa przed natręctwem", share: 41 },
  { theme: "Brak systemu i przypomnień", share: 27 },
  { theme: "Nie wiem, co napisać", share: 22 },
  { theme: "Wybór kanału kontaktu", share: 10 },
];

export const impulseStats = [
  { id: "pytanie-otwierajace", title: "Jedno pytanie, które otwiera rozmowę", sent: "18 lis", views: 702, completion: 81, downloads: 318, cta: 96 },
  { id: "wycena", title: "Jak wycenić ofertę", sent: "11 lis", views: 1184, completion: 74, downloads: 402, cta: 143 },
  { id: "follow-up", title: "Follow-up, który nie brzmi jak naganianie", sent: "4 lis", views: 1326, completion: 86, downloads: 289, cta: 101 },
  { id: "sygnaly-decyzji", title: "3 sygnały, że klient jest gotowy", sent: "28 paź", views: 1098, completion: 69, downloads: 0, cta: 72 },
];

export const campaigns = [
  { id: "c1", name: "Mail powitalny", material: "Wideo powitalne + mapa rozmowy", clicks: 1840, joined: 642, date: "stała" },
  { id: "c2", name: "Kampania: checklista", material: "Rozmowa sprzedażowa w 7 krokach", clicks: 1122, joined: 388, date: "18 lis" },
  { id: "c3", name: "Kampania: wycena", material: "Audyt oferty", clicks: 760, joined: 201, date: "11 lis" },
  { id: "c4", name: "Stopka maila", material: "Kanał Marty", clicks: 214, joined: 81, date: "stała" },
];

export const emailSnippets = [
  {
    id: "e1",
    label: "Proste",
    text: "Odbierz prywatne wideo i checklistę w Impulsie",
  },
  {
    id: "e2",
    label: "Osobiste",
    text: "Nagrałam dla Ciebie krótkie wideo i dołożyłam checklistę. Odbierz je w moim prywatnym kanale w Impulsie",
  },
  {
    id: "e3",
    label: "Z zaproszeniem do kanału",
    text: "Odbierz prywatny materiał i dołącz do kanału, w którym co tydzień wysyłam krótkie impulsy do działania",
  },
];

export const nf = new Intl.NumberFormat("pl-PL", { useGrouping: "always" });

/* ───────────── Strona zapisu twórcy ───────────── */

export interface SignupPage {
  headline: string;
  lead: string;
  bullets: string[];
  buttonLabel: string;
}

/** Domyślna treść strony zapisu — twórca może ją zmienić w panelu. */
export function defaultSignupPage(channel: Channel): SignupPage {
  const bonus = channel.files.find((f) => f.isBonus);
  return {
    headline: bonus ? `Odbierz: ${bonus.title}` : `Dołącz do kanału ${channel.creator.channelName}`,
    lead: channel.creator.promise,
    bullets: [
      "Prywatny materiał od razu po zapisie",
      `${channel.creator.cadence} — krótkie wideo i narzędzie`,
      "Dostęp do prywatnego kanału w Impulsie",
    ],
    buttonLabel: "Zapisz się i odbierz materiał",
  };
}

export interface AutoEmail {
  id: string;
  when: string;
  subject: string;
  body: string;
  cta: string;
}

/** Gotowe maile wysyłane przez Impuls do osób zapisanych przez stronę twórcy. */
export const autoEmails: AutoEmail[] = [
  {
    id: "welcome",
    when: "Od razu po zapisie",
    subject: "Twój materiał czeka w Impulsie",
    body: "Dzięki za zapis. Obiecany materiał i krótkie wideo powitalne są już w moim prywatnym kanale. Kliknij, żeby je odebrać.",
    cta: "Odbierz materiał w Impulsie",
  },
  {
    id: "reminder",
    when: "Po 2 dniach, jeśli ktoś nie dołączył",
    subject: "Materiał nadal na Ciebie czeka",
    body: "Zostawiam link jeszcze raz. W kanale znajdziesz też checklistę, którą wdrożysz w kilka minut.",
    cta: "Wejdź do kanału",
  },
  {
    id: "impulse",
    when: "Przy każdym nowym impulsie",
    subject: "Nowy impuls: {tytuł impulsu}",
    body: "Krótka zapowiedź tego, co jest w tym tygodniu w kanale. Tu jest więcej materiału: pełne wideo i narzędzie do wdrożenia.",
    cta: "Zobacz impuls w kanale",
  },
];
