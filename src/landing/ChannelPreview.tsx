import { Link } from "react-router-dom";
import { ArrowRight, CheckSquare, FileText, MessageCircle, Play } from "lucide-react";
import { creator } from "@/data/mock";
import { buttonClass } from "@/components/ui/Button";
import { PhoneMock } from "./PhoneMock";
import { Reveal, SectionHeading } from "./Reveal";

const parts = [
  { icon: Play, title: "Wideo", body: "Powitalne na start, potem krótkie impulsy — każdy z jednym zadaniem do wykonania." },
  { icon: CheckSquare, title: "Narzędzia", body: "Checklisty, szablony i arkusze, które odbiorca odhacza i wykorzystuje u siebie." },
  { icon: FileText, title: "Pliki", body: "Materiały bonusowe, nagrania i dokumenty. Zawsze pod ręką, bez szukania w skrzynce." },
  { icon: MessageCircle, title: "Czat", body: "Pytania od twórcy i wiadomości od odbiorców, którzy na to zapracowali." },
];

export function ChannelPreview() {
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
        <Reveal className="relative mx-auto">
          <div className="absolute inset-6 rounded-full bg-violet-400/30 blur-[80px]" />
          <PhoneMock className="relative" />
        </Reveal>
        <div>
          <SectionHeading
            align="left"
            eyebrow="Przykładowy kanał"
            title="Wideo, narzędzia, pliki i kontrolowana interakcja w jednym miejscu."
            lead={`Tak wygląda prywatny kanał „${creator.channelName}”. Odbiorca nie przegląda katalogu twórców — wchodzi z linku prosto do tego jednego kanału.`}
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {parts.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <li className="h-full rounded-2xl border border-line bg-white p-5">
                  <p className="flex items-center gap-2.5 font-display text-lg font-bold">
                    <Icon className="size-4.5 text-violet-600" />
                    {title}
                  </p>
                  <p className="mt-1.5 text-sm text-ink-500">{body}</p>
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.1}>
            <Link to={`/k/${creator.slug}`} className={buttonClass("dark", "lg", "mt-8")}>
              Wejdź do przykładowego kanału
              <ArrowRight className="size-5" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
