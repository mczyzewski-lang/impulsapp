import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, EyeOff, FolderHeart, Link2, MessageSquareLock, Timer, Users, Zap } from "lucide-react";
import { creator } from "@/data/mock";
import { buttonClass } from "@/components/ui/Button";
import { Reveal, SectionHeading } from "./Reveal";

const creatorFeatures = [
  {
    icon: Zap,
    title: "Impulsy zamiast kampanii",
    body: "Krótkie wideo, narzędzie, plik i jedno CTA. Publikujesz w kilka minut, a materiał zostaje w kanale na stałe.",
  },
  {
    icon: Users,
    title: "Widzisz, kto jest ambasadorem",
    body: "Prosty scoring dzieli odbiorców na zimnych, ciepłych, aktywnych i ambasadorów. Bez arkuszy i zgadywania.",
  },
  {
    icon: MessageSquareLock,
    title: "Interakcja pod kontrolą",
    body: "Czat odblokowuje się po aktywności. Ty zadajesz pytania, wybierasz najlepsze i zbierasz insighty do kolejnych materiałów.",
  },
  {
    icon: Link2,
    title: "Link do każdego materiału",
    body: "Generujesz link i gotowy tekst CTA do wklejenia w maila. Wiesz, która wiadomość przyprowadziła kogo.",
  },
];

export function ForCreators() {
  return (
    <section id="dla-tworcow" className="bg-paper py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <SectionHeading
            align="left"
            eyebrow="Dla twórców, ekspertów i firm"
            title="Twoi najlepsi odbiorcy zasługują na coś więcej niż kolejny mail."
            lead="Część Twojej listy czyta wszystko, klika wszystko i poleca Cię dalej. Daj im miejsce, w którym dostają więcej — i w którym widzisz, kim są."
          />
          <Reveal delay={0.1}>
            <Link to="/studio" className={buttonClass("dark", "lg", "mt-8")}>
              Stwórz kanał w Impulsie
              <ArrowRight className="size-5" />
            </Link>
            <Link to="/tworcy" className="mt-4 flex items-center gap-2 text-sm font-semibold text-violet-700">
              Zobacz studio wideo z prompterem <ArrowRight className="size-4" />
            </Link>
            <p className="mt-6 flex items-center gap-2.5 text-sm font-semibold text-ink-600">
              <BarChart3 className="size-4.5 text-violet-600" />
              Daj odbiorcom powód, żeby wracali.
            </p>
          </Reveal>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {creatorFeatures.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-line bg-white p-6">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-[15px] text-ink-500">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const recipientFeatures = [
  {
    icon: FolderHeart,
    title: "Wszystko w jednym miejscu",
    body: "Wideo, narzędzia i pliki od twórcy nie giną między mailami. Wracasz do nich, kiedy są potrzebne.",
  },
  {
    icon: Timer,
    title: "Krótko i do wdrożenia",
    body: "Impuls to kilka minut wideo i jedno konkretne zadanie. Oglądasz dziś, używasz jutro.",
  },
  {
    icon: EyeOff,
    title: "Bez feedu i algorytmu",
    body: "Widzisz tylko kanały, do których ktoś Cię zaprosił. Nic Ci się nie „poleca” i nic nie walczy o uwagę.",
  },
  {
    icon: MessageSquareLock,
    title: "Dostęp do twórcy za aktywność",
    body: "Oglądasz i wdrażasz — odblokowujesz czat. Twoje pytanie trafia do człowieka, a nie do skrzynki bez odpowiedzi.",
  },
];

export function ForRecipients() {
  return (
    <section id="dla-odbiorcow" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Dla odbiorców"
          title="Odbierz prywatny materiał od twórcy, któremu ufasz."
          lead="Impulsy do działania od ludzi, którym ufasz. Nie obserwuj biernie. Wdrażaj."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recipientFeatures.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="h-full rounded-3xl bg-paper p-6">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-volt-200 text-volt-700">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-[15px] text-ink-500">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link to={`/k/${creator.slug}`} className={buttonClass("outline", "lg", "h-auto min-h-13 py-3 text-center whitespace-normal")}>
            Zobacz, jak wygląda zaproszenie do kanału
            <ArrowRight className="size-5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
