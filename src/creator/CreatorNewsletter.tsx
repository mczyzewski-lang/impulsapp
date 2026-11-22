import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUp, ChevronDown, GitBranch, Lightbulb, Mail, UserPlus, X, Zap } from "lucide-react";
import { autoEmails, creator } from "@/data/mock";
import { channelPath } from "@/config";
import { moveQueued, updateIdea, useIdeas } from "@/state/ideas";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader, inputClass, labelClass } from "./CreatorLayout";

const SETTINGS_KEY = "impuls.newsletter.v1";
const intervals = [
  { days: 2, label: "co 2 dni" },
  { days: 3, label: "co 3 dni" },
  { days: 7, label: "co tydzień" },
];

interface Settings {
  intervalDays: number;
  hour: string;
}

function loadSettings(): Settings {
  try {
    return { intervalDays: 3, hour: "07:30", ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") };
  } catch {
    return { intervalDays: 3, hour: "07:30" };
  }
}

interface Step {
  id: string;
  day: number;
  kind: "welcome" | "reminder" | "idea";
  subject: string;
  body: string;
  cta: string;
  note?: string;
}

/** Data, w której dany mail dostanie osoba zapisana dziś. */
function dateFor(day: number) {
  const d = new Date();
  d.setDate(d.getDate() + day);
  return d.toLocaleDateString("pl-PL", { weekday: "short", day: "numeric", month: "short" });
}

/**
 * Newsletter jako ciąg: każda nowa osoba przechodzi tę samą sekwencję, licząc od dnia zapisu.
 * Maile powitalne są stałe, a kolejne pochodzą z kolejki z ekranu „Treści”.
 */
export default function CreatorNewsletter() {
  const queued = useIdeas().filter((i) => i.emailQueued);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ustawienia zostają na czas sesji */
    }
  }, [settings]);

  const [welcome, reminder] = autoEmails;
  const steps: Step[] = [
    { id: "welcome", day: 0, kind: "welcome", subject: welcome.subject, body: welcome.body, cta: welcome.cta, note: "od razu po zapisie" },
    { id: "reminder", day: 2, kind: "reminder", subject: reminder.subject, body: reminder.body, cta: reminder.cta, note: "tylko jeśli nie dołączył do kanału" },
    ...queued.map((idea, i) => ({
      id: idea.id,
      // Pierwszy mail z treścią wychodzi po przypomnieniu, kolejne w równych odstępach.
      day: 2 + settings.intervalDays * (i + 1),
      kind: "idea" as const,
      subject: idea.emailSubject,
      body: idea.emailBody,
      cta: "Tu jest więcej — wideo i narzędzie czekają w kanale",
    })),
  ];
  const lastDay = steps[steps.length - 1].day;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Newsletter"
        lead="Ciąg maili, który każda nowa osoba dostaje od dnia zapisu. Zapisany w marcu i zapisany w listopadzie przechodzą tę samą drogę — od pierwszego maila."
        action={
          <Link to="/studio/tresci" className={buttonClass("dark")}>
            <Lightbulb className="size-4.5" /> Dodaj maile z Treści
          </Link>
        }
      />

      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className={labelClass}>Odstęp między mailami z treścią</p>
            <div className="mt-1.5 inline-flex rounded-xl bg-ink-900/5 p-1" role="radiogroup" aria-label="Odstęp między mailami">
              {intervals.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  role="radio"
                  aria-checked={settings.intervalDays === option.days}
                  onClick={() => setSettings((s) => ({ ...s, intervalDays: option.days }))}
                  className={cn("rounded-lg px-3.5 py-2 text-sm font-semibold transition", settings.intervalDays === option.days ? "bg-white shadow-sm" : "text-ink-500")}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <label className={labelClass}>
            Godzina wysyłki
            <input type="time" className={inputClass} value={settings.hour} onChange={(e) => setSettings((s) => ({ ...s, hour: e.target.value }))} />
          </label>
        </div>
        <p className="mt-4 border-t border-line pt-3 text-sm text-ink-500">
          Ciąg ma <span className="font-semibold text-ink-900">{steps.length} maili</span> i trwa <span className="font-semibold text-ink-900">{lastDay} dni</span>. Daty obok pokazują, kiedy dostałaby je osoba zapisana dziś.
        </p>
      </Card>

      {/* ── Oś czasu ── */}
      <ol className="relative mt-6">
        <li className="relative flex gap-4 pb-5">
          <span className="absolute top-10 bottom-0 left-5 w-0.5 -translate-x-1/2 bg-line" aria-hidden />
          <span className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-volt-400 text-ink-950">
            <UserPlus className="size-5" />
          </span>
          <div className="pt-1.5">
            <p className="font-display text-lg font-bold">Zapis</p>
            <p className="text-sm text-ink-500">Przez stronę zapisu albo formularz na Twojej stronie.</p>
          </div>
        </li>

        {steps.map((step, index) => {
          const isOpen = open === step.id;
          const queueIndex = step.kind === "idea" ? index - 2 : -1;
          return (
            <li key={step.id} className="relative flex gap-4 pb-5">
              {index < steps.length - 1 && <span className="absolute top-10 bottom-0 left-5 w-0.5 -translate-x-1/2 bg-line" aria-hidden />}
              <span className={cn("relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full", step.kind === "idea" ? "bg-ink-900 text-white" : "bg-violet-100 text-violet-700")}>
                {step.kind === "reminder" ? <GitBranch className="size-4.5" /> : <Mail className="size-4.5" />}
              </span>

              <Card className="min-w-0 flex-1 p-4">
                <div className="flex items-start gap-3">
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : step.id)} className="min-w-0 flex-1 text-left">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-ink-400">
                      <span className="rounded-md bg-ink-900 px-2 py-0.5 text-white">Dzień {step.day}</span>
                      {dateFor(step.day)}, {settings.hour}
                      {step.note && <Badge tone={step.kind === "reminder" ? "amber" : "violet"}>{step.note}</Badge>}
                    </p>
                    <p className="mt-1.5 flex items-center gap-2 font-display text-[17px] leading-snug font-bold">
                      <span className="min-w-0 flex-1">{step.subject}</span>
                      <ChevronDown className={cn("size-4.5 shrink-0 text-ink-400 transition-transform", isOpen && "rotate-180")} />
                    </p>
                    {!isOpen && <p className="mt-1 line-clamp-1 text-sm text-ink-500">{step.body}</p>}
                  </button>

                  {step.kind === "idea" && (
                    <div className="flex shrink-0 flex-col gap-1">
                      <button type="button" aria-label={`Wyślij wcześniej: ${step.subject}`} disabled={queueIndex === 0} onClick={() => moveQueued(step.id, -1)} className="inline-flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-900/5 disabled:opacity-25">
                        <ArrowUp className="size-4" />
                      </button>
                      <button type="button" aria-label={`Wyślij później: ${step.subject}`} disabled={queueIndex === queued.length - 1} onClick={() => moveQueued(step.id, 1)} className="inline-flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-900/5 disabled:opacity-25">
                        <ArrowDown className="size-4" />
                      </button>
                    </div>
                  )}
                </div>

                {isOpen && (
                  <div className="mt-3 rounded-xl bg-paper p-4">
                    <p className="text-[15px] whitespace-pre-line text-ink-600">{step.body}</p>
                    <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-semibold text-white">
                      {step.cta} <ArrowRight className="size-4" />
                    </span>
                    <p className="mt-2 text-xs text-ink-400">Link prowadzi do {channelPath(creator.slug)}</p>
                    {step.kind === "idea" && (
                      <button type="button" onClick={() => updateIdea(step.id, { emailQueued: false })} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700">
                        <X className="size-4" /> Usuń z ciągu
                      </button>
                    )}
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ol>

      {queued.length === 0 && (
        <Card className="ml-14 border-dashed p-5">
          <p className="font-semibold">Po powitaniu ciąg się urywa.</p>
          <p className="mt-1 text-sm text-ink-500">Dodaj maile z ekranu „Treści” — każda Twoja myśl ma tam gotowy szkic. Pojawią się tutaj w kolejności, w jakiej je ułożysz.</p>
          <Link to="/studio/tresci" className={buttonClass("outline", "sm", "mt-3")}>
            Przejdź do Treści <ArrowRight className="size-4" />
          </Link>
        </Card>
      )}

      <Card className="mt-6 flex items-start gap-3 p-4">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-volt-200 text-volt-700">
          <Zap className="size-5" />
        </span>
        <div>
          <p className="font-semibold">Poza ciągiem: nowy impuls</p>
          <p className="mt-0.5 text-sm text-ink-500">
            Gdy publikujesz impuls, zapisani dostają krótką zapowiedź od razu — niezależnie od tego, na którym dniu ciągu są. Osoby, które dołączyły do kanału, dostają zamiast maila powiadomienie w aplikacji.
          </p>
        </div>
      </Card>
    </div>
  );
}
