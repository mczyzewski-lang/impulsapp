import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Briefcase, Building2, ChevronDown, Dumbbell, Gift, GraduationCap, Mic } from "lucide-react";
import { creator } from "@/data/mock";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Reveal, SectionHeading } from "./Reveal";

const useCases = [
  { icon: Briefcase, who: "Ekspert i konsultant", what: "Co tydzień jedno krótkie wideo i narzędzie. Najaktywniejsi odbiorcy stają się pierwszymi klientami nowej oferty." },
  { icon: GraduationCap, who: "Twórca kursów", what: "Kanał dla absolwentów: materiały uzupełniające, checklisty wdrożeniowe i pytania, z których powstaje kolejny kurs." },
  { icon: Building2, who: "Firma B2B i SaaS", what: "Prywatny kanał dla klientów i partnerów: instrukcje wideo, szablony, zapowiedzi zmian i zbieranie opinii." },
  { icon: Dumbbell, who: "Trener i coach", what: "Plan na tydzień, krótkie wideo i arkusz postępów. Czat tylko dla tych, którzy faktycznie ćwiczą." },
  { icon: Mic, who: "Podcast i media", what: "Materiały dodatkowe do odcinków i pytania do gości zbierane od najwierniejszych słuchaczy." },
  { icon: BookOpen, who: "Autor i wydawca", what: "Bonusy do książki, ćwiczenia do rozdziałów i stały kontakt z czytelnikami, którzy chcą więcej." },
];

export function UseCases() {
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Zastosowania"
          title="Jeden mechanizm, wiele sposobów użycia"
          lead="Wszędzie tam, gdzie masz listę emailową i grupę odbiorców, którzy chcą od Ciebie więcej."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map(({ icon: Icon, who, what }, i) => (
            <Reveal key={who} delay={(i % 3) * 0.08}>
              <div className="h-full rounded-3xl border border-line bg-white p-6">
                <Icon className="size-6 text-violet-600" />
                <h3 className="mt-4 text-lg font-bold">{who}</h3>
                <p className="mt-2 text-[15px] text-ink-500">{what}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const faq = [
  {
    q: "Czy Impuls zastępuje mój newsletter?",
    a: "Nie. Email pozostaje Twoim kanałem dystrybucji — nadal docierasz nim do całej listy. Impuls jest miejscem, do którego zapraszasz najbardziej zaangażowanych odbiorców, żeby dać im więcej niż mieści się w mailu.",
  },
  {
    q: "Czy odbiorcy mogą odkrywać w Impulsie innych twórców?",
    a: "Nie. W Impulsie nie ma publicznego feedu, wyszukiwarki twórców ani algorytmu poleceń. Odbiorca widzi wyłącznie kanały, do których został zaproszony linkiem.",
  },
  {
    q: "Jak odbiorca trafia do mojego kanału?",
    a: "Przez link, który generujesz w panelu i wklejasz w maila, np. „Odbierz moje prywatne wideo i checklistę w Impulsie”. Po kliknięciu odbiorca widzi zaproszenie do Twojego kanału i zakłada konto.",
  },
  {
    q: "Dlaczego czat jest na początku zablokowany?",
    a: "Żeby interakcja miała sens dla obu stron. Czat odblokowuje się po aktywności — domyślnie po obejrzeniu 3 wideo, pobraniu 1 narzędzia i odpowiedzi na 1 pytanie. Warunki ustawiasz samodzielnie.",
  },
  {
    q: "Jakie materiały mogę publikować?",
    a: "Wideo, narzędzia (checklisty, szablony, arkusze), pliki do pobrania oraz pytania do odbiorców. Każdy impuls może mieć własne CTA, na przykład link do oferty lub zapisu na konsultację.",
  },
  {
    q: "Co będę wiedzieć o swoich odbiorcach?",
    a: "Kto dołączył, co obejrzał, co pobrał, w co kliknął i kto odblokował czat. Na tej podstawie Impuls dzieli odbiorców na zimnych, ciepłych, aktywnych i ambasadorów.",
  },
  {
    q: "Czy odbiorca musi instalować aplikację?",
    a: "Kanał działa w przeglądarce, więc materiał można odebrać od razu po kliknięciu linku. Aplikacja na iOS i Androida daje wygodniejszy dostęp i powiadomienia o nowych impulsach.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow="FAQ" title="Najczęstsze pytania" />
        <div className="mt-12 divide-y divide-line rounded-3xl border border-line">
          {faq.map(({ q, a }, i) => (
            <div key={q}>
              <button
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-display text-lg font-bold"
              >
                {q}
                <ChevronDown className={cn("size-5 shrink-0 text-ink-400 transition-transform", open === i && "rotate-180")} />
              </button>
              {open === i && <p className="px-6 pb-6 text-ink-500">{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="bg-white px-5 pb-20">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-ink-900 px-6 py-16 text-center text-white sm:px-12 sm:py-24">
          <div className="bg-grid absolute inset-0" />
          <div className="absolute -bottom-32 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-violet-600/30 blur-[100px]" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-4xl leading-[1.05] font-extrabold text-balance sm:text-6xl">
              Daj odbiorcom powód, <span className="text-volt-400">żeby wracali.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-300">
              Stwórz prywatny kanał, wyślij jeden link do swojej listy i zobacz, kto jest gotowy na więcej.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/studio" className={buttonClass("primary", "lg")}>
                Stwórz kanał w Impulsie
                <ArrowRight className="size-5" />
              </Link>
              <Link to={`/k/${creator.slug}`} className={buttonClass("glass", "lg")}>
                <Gift className="size-5" />
                Odbierz prywatny materiał
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="pb-safe border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-ink-400 sm:flex-row">
        <Logo tone="dark" className="text-lg" />
        <p>Impulsy do działania od ludzi, którym ufasz.</p>
        <p>© 2026 Impuls</p>
      </div>
    </footer>
  );
}
