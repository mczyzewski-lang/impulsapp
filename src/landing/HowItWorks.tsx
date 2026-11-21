import { Mail, MousePointerClick, Unlock } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

const steps = [
  {
    icon: Mail,
    title: "Wysyłasz maila z jednym linkiem",
    body: "„Odbierz moje prywatne wideo i checklistę w Impulsie.” Email robi to, w czym jest najlepszy: dociera do całej listy.",
  },
  {
    icon: MousePointerClick,
    title: "Najbardziej zaangażowani awansują",
    body: "Kto kliknie, trafia do Twojego prywatnego kanału. Na start dostaje wideo powitalne, obiecany materiał i pierwsze narzędzie.",
  },
  {
    icon: Unlock,
    title: "Aktywność odblokowuje interakcję",
    body: "Odbiorcy oglądają, pobierają i wdrażają. Najaktywniejsi odblokowują czat, a Ty widzisz, kto naprawdę działa.",
  },
];

export function HowItWorks() {
  return (
    <section id="jak-to-dziala" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Jak to działa"
          title="Od maila do ambasadora w trzech krokach"
          lead="Nie budujesz nowej publiczności od zera. Wyłaniasz najlepszych odbiorców z listy, którą już masz."
        />
        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <li className="relative h-full rounded-3xl border border-line bg-paper p-7">
                <span className="absolute top-6 right-7 font-display text-5xl font-extrabold text-ink-900/8">0{i + 1}</span>
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-ink-900 text-volt-400">
                  <Icon className="size-5.5" />
                </span>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-2.5 text-ink-500">{body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
