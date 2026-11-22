import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, ChevronDown, ClipboardPaste, Mail, MessagesSquare, Mic, Sparkles, Trash2, Video, Volume2 } from "lucide-react";
import { creator } from "@/data/mock";
import { channelPath } from "@/config";
import { addIdeas, buildPrompt, parseIdeas, removeIdea, sampleResponse, toScript, updateIdea, useIdeas, type Idea, type PromptOptions } from "@/state/ideas";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { PageHeader, inputClass, labelClass } from "./CreatorLayout";

const sources: { id: PromptOptions["source"]; title: string; body: string }[] = [
  { id: "history", title: "Z całej historii", body: "Dla czatu z pamięcią: sięga do wszystkiego, co o Tobie wie." },
  { id: "thread", title: "Z jednej rozmowy", body: "Wklejasz na końcu wątku, w którym coś wypracowałeś." },
];

function IdeaCard({ idea }: { idea: Idea }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState<"script" | "mail" | null>(null);

  function record(mode: "hook" | "question") {
    updateIdea(idea.id, { recorded: true });
    navigate("/studio/nagraj", { state: { script: toScript(idea, mode) } });
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-violet-700">{idea.topic}</p>
          <p className="mt-0.5 font-display text-lg leading-snug font-bold">{idea.hook}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {idea.recorded && (
              <Badge tone="green">
                <Check className="size-3" strokeWidth={3} /> Nagrane
              </Badge>
            )}
            {idea.emailQueued && (
              <Badge tone="violet">
                <Mail className="size-3" /> Mail w ciągu
              </Badge>
            )}
          </div>
        </div>
        <button type="button" aria-label={`Usuń: ${idea.topic}`} onClick={() => removeIdea(idea.id)} className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-900/5">
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant={open === "script" ? "dark" : "outline"} size="sm" aria-expanded={open === "script"} onClick={() => setOpen(open === "script" ? null : "script")}>
          <Video className="size-4" /> Scenariusz <ChevronDown className={cn("size-4 transition-transform", open === "script" && "rotate-180")} />
        </Button>
        <Button variant={open === "mail" ? "dark" : "outline"} size="sm" aria-expanded={open === "mail"} onClick={() => setOpen(open === "mail" ? null : "mail")}>
          <Mail className="size-4" /> Mail <ChevronDown className={cn("size-4 transition-transform", open === "mail" && "rotate-180")} />
        </Button>
      </div>

      {open === "script" && (
        <div className="mt-3 space-y-3 rounded-xl bg-paper p-3.5">
          <label className={labelClass}>
            Hook — czytasz Ty
            <input className={inputClass} value={idea.hook} onChange={(e) => updateIdea(idea.id, { hook: e.target.value })} />
          </label>
          <label className={labelClass}>
            Pytanie — czyta lektor
            <input className={inputClass} value={idea.question} onChange={(e) => updateIdea(idea.id, { question: e.target.value })} placeholder="Opcjonalnie: pytanie od odbiorcy" />
          </label>
          <label className={labelClass}>
            Treść
            <textarea className={inputClass} rows={5} value={idea.body} onChange={(e) => updateIdea(idea.id, { body: e.target.value })} />
          </label>
          <label className={labelClass}>
            Zadanie dla odbiorcy
            <input className={inputClass} value={idea.task} onChange={(e) => updateIdea(idea.id, { task: e.target.value })} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => record("hook")}>
              <Mic className="size-4" /> Nagraj: hook + treść
            </Button>
            <Button variant="outline" size="sm" disabled={!idea.question.trim()} onClick={() => record("question")}>
              <Volume2 className="size-4" /> Nagraj: pytanie + treść
            </Button>
          </div>
        </div>
      )}

      {open === "mail" && (
        <div className="mt-3 space-y-3 rounded-xl bg-paper p-3.5">
          <label className={labelClass}>
            Temat
            <input className={inputClass} value={idea.emailSubject} onChange={(e) => updateIdea(idea.id, { emailSubject: e.target.value })} />
          </label>
          <label className={labelClass}>
            Treść
            <textarea className={inputClass} rows={7} value={idea.emailBody} onChange={(e) => updateIdea(idea.id, { emailBody: e.target.value })} />
          </label>
          <p className="rounded-lg border border-dashed border-ink-300 px-3 py-2 text-sm text-ink-600">
            Na końcu maila dodamy: <span className="font-semibold text-ink-900">Tu jest więcej — wideo i narzędzie czekają w kanale</span> → {channelPath(creator.slug)}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={idea.emailQueued ? "outline" : "dark"} size="sm" onClick={() => updateIdea(idea.id, { emailQueued: !idea.emailQueued })}>
              {idea.emailQueued ? <Check className="size-4" /> : <Mail className="size-4" />}
              {idea.emailQueued ? "W ciągu — kliknij, żeby zdjąć" : "Dodaj do ciągu newslettera"}
            </Button>
            <CopyButton text={`${idea.emailSubject}\n\n${idea.emailBody}`} label="Kopiuj mail" />
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Treści: twórca wyciąga swoją wiedzę z rozmów z czatem AI i wkleja ją do Impulsu.
 * Odpowiedź w wymuszonym formacie rozkładamy na scenariusze do promptera i szkice maili.
 */
export default function CreatorContent() {
  const ideas = useIdeas();
  const [options, setOptions] = useState<PromptOptions>({ source: "history", count: 5, audience: "eksperci i małe firmy, które sprzedają własne usługi" });
  const [pasted, setPasted] = useState("");
  const [result, setResult] = useState<{ added: number; structured: boolean } | null>(null);

  const prompt = buildPrompt(options);
  const queued = ideas.filter((i) => i.emailQueued).length;

  function importText(text: string) {
    const parsed = parseIdeas(text);
    if (parsed.ideas.length) addIdeas(parsed.ideas);
    setResult({ added: parsed.ideas.length, structured: parsed.structured });
    if (parsed.ideas.length) setPasted("");
  }

  return (
    <div>
      <PageHeader
        title="Treści"
        lead="Twoja wiedza już istnieje — w rozmowach z czatem AI. Wyciągnij ją jednym promptem, wklej tutaj, a ułoży się w scenariusze do nagrania i maile do newslettera."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── Krok 1: prompt ── */}
        <Card className="min-w-0 p-5">
          <h2 className="flex items-center gap-2.5 text-lg font-bold">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-ink-900 text-sm text-white">1</span> Skopiuj prompt do swojego czatu
          </h2>
          <p className="mt-1 text-sm text-ink-500">Działa w ChatGPT, Claude i każdym czacie, w którym pracujesz. To on zna Twoje rozmowy — Impuls ich nie czyta.</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Źródło wiedzy">
            {sources.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={options.source === s.id}
                onClick={() => setOptions((o) => ({ ...o, source: s.id }))}
                className={cn("rounded-xl border p-3 text-left transition", options.source === s.id ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white hover:border-ink-300")}
              >
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <MessagesSquare className="size-4" /> {s.title}
                </p>
                <p className={cn("mt-1 text-xs", options.source === s.id ? "text-ink-300" : "text-ink-500")}>{s.body}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className={labelClass}>
              Dla kogo są te treści
              <input className={inputClass} value={options.audience} onChange={(e) => setOptions((o) => ({ ...o, audience: e.target.value }))} />
            </label>
            <label className={labelClass}>
              Ile myśli
              <select className={inputClass} value={options.count} onChange={(e) => setOptions((o) => ({ ...o, count: +e.target.value }))}>
                {[3, 5, 10].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-xl bg-ink-900 p-4">
            <pre className="no-scrollbar max-h-52 overflow-y-auto font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-ink-300">{prompt}</pre>
            <div className="mt-3">
              <CopyButton text={prompt} label="Kopiuj prompt" />
            </div>
          </div>
        </Card>

        {/* ── Krok 2: wklejenie ── */}
        <Card className="min-w-0 p-5">
          <h2 className="flex items-center gap-2.5 text-lg font-bold">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-ink-900 text-sm text-white">2</span> Wklej odpowiedź
          </h2>
          <p className="mt-1 text-sm text-ink-500">Każda myśl stanie się scenariuszem (hook albo pytanie + treść) i szkicem maila. Możesz też wkleić zwykłe notatki — podzielimy je akapitami.</p>
          <textarea
            aria-label="Odpowiedź z czatu"
            className={cn(inputClass, "mt-4 font-mono text-[13px] sm:text-[13px]")}
            rows={11}
            value={pasted}
            onChange={(e) => {
              setPasted(e.target.value);
              setResult(null);
            }}
            placeholder={"=== IMPULS 1 ===\nTEMAT: …\nHOOK: …\nPYTANIE: …\nTREŚĆ: …"}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="dark" disabled={!pasted.trim()} onClick={() => importText(pasted)}>
              <ClipboardPaste className="size-4.5" /> Zamień na scenariusze i maile
            </Button>
            <Button variant="ghost" onClick={() => importText(sampleResponse)}>
              <Sparkles className="size-4" /> Wczytaj przykład
            </Button>
          </div>
          {result && (
            <p role="status" className={cn("mt-3 text-sm font-semibold", result.added ? "text-emerald-700" : "text-rose-700")}>
              {result.added === 0
                ? "Nie znalazłem tu żadnej myśli. Wklej całą odpowiedź czatu albo dłuższe notatki."
                : result.structured
                  ? `Dodano ${result.added} — każda ma scenariusz i mail.`
                  : `Dodano ${result.added} z notatek. Nie miały formatu z promptu, więc sprawdź hooki i treść maili.`}
            </p>
          )}
        </Card>
      </div>

      {/* ── Baza ── */}
      <div className="mt-9 mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-bold">Twoje myśli {ideas.length > 0 && <span className="text-ink-400">{ideas.length}</span>}</h2>
        {queued > 0 && (
          <Link to="/studio/newsletter" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700">
            Maili w ciągu newslettera: {queued} — zobacz ciąg <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      {ideas.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-semibold">Jeszcze nic tu nie ma.</p>
          <p className="mt-1 text-sm text-ink-500">Skopiuj prompt, wklej odpowiedź czatu albo wczytaj przykład, żeby zobaczyć, jak to działa.</p>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
