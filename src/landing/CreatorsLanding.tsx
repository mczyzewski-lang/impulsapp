import { Link } from "react-router-dom";
import { ArrowRight, Captions, Check, Clapperboard, ImagePlus, Mic, PanelTop, Scissors, Smartphone, Users, Volume2 } from "lucide-react";
import { creator, videos } from "@/data/mock";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Footer } from "./Closing";
import { Reveal, SectionHeading } from "./Reveal";

const clip = videos[1];

/** Makieta nagrywania z prompterem. */
function PrompterMock({ mode }: { mode: "hook" | "question" }) {
  return (
    <div className="relative w-[280px] shrink-0 rounded-[2.4rem] border border-white/10 bg-ink-800 p-2.5 shadow-2xl shadow-black/60" aria-hidden>
      <div className="relative h-[540px] overflow-hidden rounded-[1.9rem] bg-black text-white">
        <video src={clip.src} poster={clip.image} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-x-0 top-0 h-[58%] bg-linear-to-b from-black/85 via-black/55 to-transparent px-4 pt-5">
          <p className="text-[9px] font-bold tracking-wide text-volt-400 uppercase">{mode === "hook" ? "Hook — czytasz Ty" : "Pytanie — czyta lektor"}</p>
          <p className={`mt-0.5 text-[19px] leading-snug font-bold ${mode === "question" ? "text-volt-300" : ""}`}>
            {mode === "hook" ? "Przestań zaczynać rozmowę od oferty." : "Jak rozmawiać o cenie, kiedy klient prosi o rabat?"}
          </p>
          <p className="mt-3 text-[9px] font-bold tracking-wide text-white/60 uppercase">Treść — czytasz Ty</p>
          <p className="mt-0.5 text-[17px] leading-snug font-semibold text-white/90">
            {mode === "hook" ? "Zamiast tego zadaj jedno pytanie: co zmieniło się u Ciebie w ostatnich miesiącach?" : "Nie broń ceny. Zapytaj, z czego klient chce zrezygnować, żeby zmieścić się w budżecie."}
          </p>
        </div>
        {mode === "question" && (
          <p className="absolute inset-x-4 bottom-24 flex items-center justify-center gap-2 rounded-full bg-volt-400 px-3 py-1.5 text-[11px] font-bold text-ink-950">
            <Volume2 className="size-3.5" /> Lektor czyta pytanie…
          </p>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/80 to-transparent px-5 pt-10 pb-5">
          <span className="flex items-center gap-1.5 text-xs font-semibold tabular-nums">
            <span className="size-2 rounded-full bg-rose-500" /> 0:07
          </span>
          <span className="inline-flex size-14 items-center justify-center rounded-full border-4 border-white">
            <span className="size-5 rounded-sm bg-rose-500" />
          </span>
          <span className="text-[10px] font-semibold text-white/60">9:16</span>
        </div>
      </div>
    </div>
  );
}

/** Makieta studia montażu: podgląd z napisem i planszą, oś czasu i narzędzia. */
function EditorMock() {
  return (
    <div className="rounded-3xl border border-line bg-white p-4 shadow-xl sm:p-5" aria-hidden>
      <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-2xl bg-black text-white">
          <img src={clip.image} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-x-[8%] top-[12%] rounded-xl bg-ink-900 p-3 shadow-2xl">
            <span className="block h-1 w-7 rounded-full bg-volt-400" />
            <p className="mt-2 font-display text-[12px] leading-tight font-bold">Rozmowa bez presji</p>
            <ol className="mt-2 space-y-1.5 text-[9px] font-medium">
              {["Zapytaj, co się zmieniło", "Słuchaj do końca", "Zaproponuj kolejny krok"].map((p, i) => (
                <li key={p} className="flex items-center gap-1.5">
                  <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-volt-400 text-[8px] font-bold text-ink-950">{i + 1}</span>
                  {p}
                </li>
              ))}
            </ol>
            <p className="mt-2 text-[7px] font-semibold tracking-wide uppercase opacity-60">{creator.channelName}</p>
          </div>
          <p className="absolute inset-x-3 bottom-[12%] flex justify-center">
            <span className="rounded-md bg-volt-400 px-2 py-1 text-[11px] font-extrabold text-ink-950 uppercase">co zmieniło się u Ciebie</span>
          </p>
        </div>

        <div className="min-w-0">
          <div className="inline-flex rounded-xl bg-ink-900/5 p-1 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-ink-500"><Scissors className="size-3.5" /> Przycinanie</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-ink-500"><Captions className="size-3.5" /> Napisy</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 shadow-sm"><ImagePlus className="size-3.5" /> Infografiki</span>
          </div>
          <p className="mt-4 font-display text-lg font-bold">Infografiki w stylu marki</p>
          <p className="mt-1 text-sm text-ink-500">Plansze powstają z Twojej treści, w Twoich kolorach.</p>
          <div className="mt-3 flex gap-2">
            {["#c8f542", "#8b5cf6", "#38bdf8", "#f59e0b"].map((c, i) => (
              <span key={c} className={`size-7 rounded-full border-2 ${i === 0 ? "border-ink-900" : "border-white"}`} style={{ background: c }} />
            ))}
          </div>
          <div className="relative mt-5 h-14 rounded-xl bg-ink-900/5">
            <div className="absolute inset-y-0 right-[8%] left-[6%] rounded-xl border-2 border-ink-900 bg-white" />
            <span className="absolute top-2 left-[28%] h-4 w-[22%] rounded-md bg-violet-500" />
            <span className="absolute top-2 left-[66%] h-4 w-[18%] rounded-md bg-violet-500" />
            {[8, 21, 34, 47, 60, 73].map((l) => (
              <span key={l} className="absolute bottom-2 h-2.5 w-[11%] rounded-sm bg-volt-500" style={{ left: `${l}%` }} />
            ))}
            <span className="absolute inset-y-0 left-[38%] w-0.5 bg-rose-500" />
          </div>
          <p className="mt-2 flex flex-wrap gap-x-4 text-[11px] text-ink-400">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-violet-500" /> infografiki</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-volt-500" /> napisy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const flow = [
  { icon: Mic, title: "Wklejasz treść", body: "Notatki, fragment artykułu albo gotowy tekst. Wybierasz układ: hook + treść albo pytanie + treść." },
  { icon: Smartphone, title: "Nagrywasz z ręki", body: "Prompter przewija tekst przy obiektywie. Pytanie czyta lektor, hook i odpowiedź — Ty." },
  { icon: Clapperboard, title: "Montujesz w studiu", body: "Przycinasz początek i koniec, dodajesz napisy i plansze w kolorach swojej marki." },
  { icon: ArrowRight, title: "Publikujesz impuls", body: "Wideo trafia do kanału razem z narzędziem i CTA. Odbiorcy dostają powiadomienie." },
];

const rest = [
  { icon: PanelTop, title: "Strona zapisu i formularz do osadzenia", body: "Własny landing albo sam kontener z zapisem na Twojej stronie. Zapisani dostają maile z linkiem do kanału." },
  { icon: Users, title: "Widzisz, kto jest ambasadorem", body: "Scoring dzieli odbiorców na zimnych, ciepłych, aktywnych i ambasadorów — na podstawie tego, co obejrzeli i wdrożyli." },
];

/** Podstrona dla twórców: studio wideo z prompterem i reszta panelu. */
export default function CreatorsLanding() {
  return (
    <div className="bg-white">
      <header className="pt-safe absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link to="/" aria-label="Impuls — strona główna">
            <Logo />
          </Link>
          <Link to="/studio/nagraj" className={buttonClass("glass", "sm")}>
            Otwórz studio
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-ink-900 text-white">
          <div className="bg-grid absolute inset-0" />
          <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[120px]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-32 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:pt-40 lg:pb-28">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-ink-300">
                <Clapperboard className="size-4 text-volt-400" /> Studio twórcy w Impulsie
              </p>
              <h1 className="mt-6 text-[2.6rem] leading-[1.02] font-extrabold text-balance sm:text-6xl">
                Nagraj impuls z ręki. <span className="text-volt-400">Zmontuj w kilka minut.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-pretty text-ink-300">
                Prompter, który prowadzi Cię przez nagranie. Napisy i plansze w stylu Twojej marki. Wszystko w tym samym miejscu, w którym
                publikujesz dla swoich najbardziej zaangażowanych odbiorców.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/studio/nagraj" className={buttonClass("primary", "lg")}>
                  Wypróbuj prompter <ArrowRight className="size-5" />
                </Link>
                <Link to="/studio" className={buttonClass("glass", "lg")}>
                  Zobacz panel twórcy
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <PrompterMock mode="hook" />
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <SectionHeading eyebrow="Od notatki do impulsu" title="Cztery kroki, jedno miejsce" lead="Bez przerzucania plików między aplikacjami i bez uczenia się programu do montażu." />
            <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {flow.map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 0.08}>
                  <li className="relative h-full rounded-3xl border border-line bg-paper p-6">
                    <span className="absolute top-5 right-6 font-display text-4xl font-extrabold text-ink-900/8">0{i + 1}</span>
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-ink-900 text-volt-400">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-[15px] text-ink-500">{body}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-paper py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
            <Reveal className="flex justify-center">
              <PrompterMock mode="question" />
            </Reveal>
            <div>
              <SectionHeading
                align="left"
                eyebrow="Prompter"
                title="Hook czytasz Ty. Pytanie czyta lektor."
                lead="Dwa układy, które działają w krótkim wideo. Wklejasz swoją treść, a prompter dzieli ją na otwarcie i rozwinięcie."
              />
              <ul className="mt-7 space-y-3 text-ink-600">
                {[
                  "Hook + treść: mocne pierwsze zdanie, potem rozwinięcie.",
                  "Pytanie + treść: pytanie od odbiorcy czyta lektor ElevenLabs, Ty odpowiadasz.",
                  "Tekst przewija się przy obiektywie, więc patrzysz w kamerę, a nie w bok.",
                  "Tempo i wielkość tekstu ustawiasz pod siebie.",
                  "Nagrywasz w pionie, kwadracie albo poziomie.",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-violet-600" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <SectionHeading
              eyebrow="Studio wideo"
              title="Napisy i infografiki w stylu Twojej marki"
              lead="Każde nagranie zrobione w aplikacji ma przycisk „Studio wideo”. Otwierasz, poprawiasz, zapisujesz."
            />
            <Reveal className="mx-auto mt-12 max-w-3xl">
              <EditorMock />
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Scissors, title: "Przycinanie", body: "Usuwasz sięganie po telefon na starcie i ciszę na końcu." },
                { icon: Captions, title: "Napisy", body: "ElevenLabs rozpoznaje mowę i dzieli ją na krótkie linie. Poprawiasz jednym kliknięciem." },
                { icon: ImagePlus, title: "Infografiki", body: "Plansze z najważniejszymi punktami, generowane z Twojej treści w kolorach marki." },
              ].map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 0.08}>
                  <div className="h-full rounded-3xl bg-paper p-6">
                    <Icon className="size-6 text-violet-600" />
                    <h3 className="mt-4 text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-[15px] text-ink-500">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-paper py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <SectionHeading eyebrow="Reszta panelu" title="Od pierwszego zapisu do ambasadora" />
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {rest.map(({ icon: Icon, title, body }, i) => (
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
            <Reveal className="mt-12 text-center">
              <Link to="/studio/nagraj" className={buttonClass("dark", "lg")}>
                Nagraj pierwszy impuls <ArrowRight className="size-5" />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
