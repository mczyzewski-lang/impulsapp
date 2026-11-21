import { ArrowDown, ArrowRight, Mail, Zap } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

const rows = [
  ["Dociera do całej listy", "Skupia najbardziej zaangażowanych"],
  ["Informuje i zapowiada", "Aktywuje: wideo, narzędzia, pliki"],
  ["Materiały giną w skrzynce", "Wszystko zostaje w prywatnym kanale"],
  ["Wiesz, kto otworzył i kliknął", "Wiesz, kto obejrzał, pobrał i wdrożył"],
  ["Odpowiedzi rozsypane po wątkach", "Kontrolowana interakcja po odblokowaniu"],
];

export function EmailVsImpuls() {
  return (
    <section className="relative overflow-hidden bg-ink-900 py-20 text-white sm:py-28">
      <div className="bg-grid absolute inset-0" />
      <div className="relative mx-auto max-w-5xl px-5">
        <SectionHeading
          tone="light"
          eyebrow="Email i Impuls"
          title={<>Email informuje. Impuls aktywuje.</>}
          lead="Nie rezygnujesz z emaila. Dajesz mu ciąg dalszy: miejsce, do którego warto kliknąć."
        />
        <Reveal className="mt-12">
          <div className="flex flex-col items-stretch md:flex-row md:items-center">
            <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 md:self-stretch">
              <p className="flex items-center gap-2.5 font-display text-xl font-bold text-ink-300">
                <Mail className="size-5" /> Email
              </p>
              <p className="mt-1 text-sm text-ink-400">Kanał dystrybucji</p>
              <ul className="mt-6 space-y-4">
                {rows.map(([email]) => (
                  <li key={email} className="flex gap-3 text-ink-300">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-500" />
                    {email}
                  </li>
                ))}
              </ul>
            </div>
            {/* Strzałka: awans z emaila do Impulsu */}
            <div aria-hidden className="relative z-10 -my-3 flex shrink-0 justify-center md:-mx-4 md:my-0">
              <span className="inline-flex size-14 items-center justify-center rounded-full border-4 border-ink-900 bg-white text-ink-900 shadow-lg">
                <ArrowDown className="size-6 md:hidden" strokeWidth={2.5} />
                <ArrowRight className="hidden size-6 md:block" strokeWidth={2.5} />
              </span>
            </div>
            <div className="flex-1 rounded-3xl bg-volt-400 p-6 text-ink-950 sm:p-8 md:self-stretch">
              <p className="flex items-center gap-2.5 font-display text-xl font-bold">
                <Zap className="size-5" fill="currentColor" /> Impuls
              </p>
              <p className="mt-1 text-sm font-medium text-ink-950/60">Prywatny kanał aktywacji</p>
              <ul className="mt-6 space-y-4 font-semibold">
                {rows.map(([, impuls]) => (
                  <li key={impuls} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-950" />
                    {impuls}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
