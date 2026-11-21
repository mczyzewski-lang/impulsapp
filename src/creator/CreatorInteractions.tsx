import { useState } from "react";
import { Check, Lightbulb, Megaphone, Send, Star } from "lucide-react";
import { answers as initialAnswers, inboxMessages, insights, members, weeklyQuestion } from "@/data/mock";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader, inputClass } from "./CreatorLayout";
import { SegmentBadge } from "./SegmentBadge";

const tabs = ["Odpowiedzi na pytanie", "Wiadomości od odbiorców"] as const;
type Tab = (typeof tabs)[number];

const memberOf = (id: string) => members.find((m) => m.id === id)!;

/** Czat i interakcje: pytania twórcy, odpowiedzi, wiadomości i insighty. */
export default function CreatorInteractions() {
  const [tab, setTab] = useState<Tab>("Odpowiedzi na pytanie");
  const [starred, setStarred] = useState<string[]>(initialAnswers.filter((a) => a.starred).map((a) => a.id));
  const [replied, setReplied] = useState<string[]>([]);
  const [published, setPublished] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState(false);

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((i) => i !== id) : [...list, id]);

  function sendReply(id: string, publish: boolean) {
    setReplied((r) => [...r, id]);
    if (publish) setPublished((p) => [...p, id]);
    setReplyTo(null);
    setDraft("");
  }

  return (
    <div>
      <PageHeader
        title="Czat i interakcje"
        lead="Kontrolowana interakcja zamiast skrzynki bez dna: Ty zadajesz pytania, odbiorcy odpowiadają, a najlepsze pytania wracają do kanału."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <Card className="border-ink-900 bg-ink-900 p-5 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="volt">Aktualne pytanie</Badge>
              <span className="text-xs text-ink-300">187 odpowiedzi · 22% aktywnych odbiorców</span>
            </div>
            <p className="mt-3 font-display text-xl leading-snug font-bold">{weeklyQuestion.text}</p>
          </Card>

          <div className="mt-5 mb-3 inline-flex max-w-full overflow-x-auto rounded-xl bg-ink-900/5 p-1" role="tablist">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn("rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition", tab === t ? "bg-white text-ink-900 shadow-sm" : "text-ink-500")}
              >
                {t}
                {t === "Wiadomości od odbiorców" && inboxMessages.length - replied.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-violet-600 px-1.5 text-[11px] text-white">{inboxMessages.length - replied.length}</span>
                )}
              </button>
            ))}
          </div>

          {tab === "Odpowiedzi na pytanie" && (
            <Card className="divide-y divide-line">
              {initialAnswers.map((a) => {
                const m = memberOf(a.memberId);
                const isStarred = starred.includes(a.id);
                return (
                  <div key={a.id} className="flex gap-3 p-4">
                    <Avatar name={m.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{m.name}</span>
                        <SegmentBadge segment={m.segment} />
                        <span className="text-xs text-ink-400">{a.time}</span>
                      </div>
                      <p className="mt-1.5 text-[15px] text-ink-600">{a.text}</p>
                    </div>
                    <button
                      type="button"
                      aria-pressed={isStarred}
                      aria-label={isStarred ? "Usuń wyróżnienie" : "Wyróżnij odpowiedź"}
                      onClick={() => setStarred((s) => toggle(s, a.id))}
                      className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition", isStarred ? "bg-amber-100 text-amber-500" : "text-ink-300 hover:bg-ink-900/5")}
                    >
                      <Star className="size-4.5" fill={isStarred ? "currentColor" : "none"} />
                    </button>
                  </div>
                );
              })}
            </Card>
          )}

          {tab === "Wiadomości od odbiorców" && (
            <div className="space-y-3">
              {inboxMessages.map((msg) => {
                const m = memberOf(msg.memberId);
                const isReplied = replied.includes(msg.id);
                return (
                  <Card key={msg.id} className="p-4">
                    <div className="flex gap-3">
                      <Avatar name={m.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{m.name}</span>
                          <SegmentBadge segment={m.segment} />
                          <span className="text-xs text-ink-400">{msg.time}</span>
                        </div>
                        <p className="mt-1.5 text-[15px] text-ink-600">{msg.text}</p>
                      </div>
                    </div>

                    {isReplied ? (
                      <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-volt-700">
                        <Check className="size-4" strokeWidth={3} />
                        {published.includes(msg.id) ? "Odpowiedziano i opublikowano w kanale" : "Odpowiedziano prywatnie"}
                      </p>
                    ) : replyTo === msg.id ? (
                      <div className="mt-3">
                        <textarea
                          autoFocus
                          aria-label={`Odpowiedź dla ${m.name}`}
                          className={cn(inputClass, "mt-0")}
                          rows={3}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="Twoja odpowiedź…"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button variant="dark" size="sm" disabled={!draft.trim()} onClick={() => sendReply(msg.id, false)}>
                            <Send className="size-4" /> Odpowiedz prywatnie
                          </Button>
                          <Button variant="outline" size="sm" disabled={!draft.trim()} onClick={() => sendReply(msg.id, true)}>
                            <Megaphone className="size-4" /> Odpowiedz i opublikuj w kanale
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => { setReplyTo(msg.id); setDraft(""); }}>
                        Odpowiedz
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <h2 className="text-base font-bold">Zadaj nowe pytanie</h2>
            <p className="mt-1 text-sm text-ink-500">Zastąpi aktualne. Odpowiedź liczy się do odblokowania czatu.</p>
            <textarea
              aria-label="Nowe pytanie"
              className={inputClass}
              rows={3}
              value={question}
              onChange={(e) => { setQuestion(e.target.value); setAsked(false); }}
              placeholder="np. Co powstrzymuje Cię przed podniesieniem cen?"
            />
            <Button variant="dark" className="mt-3 w-full" disabled={!question.trim() || asked} onClick={() => setAsked(true)}>
              {asked ? <Check className="size-4.5" /> : <Send className="size-4" />}
              {asked ? "Pytanie wysłane do kanału" : "Wyślij pytanie"}
            </Button>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Lightbulb className="size-4.5 text-amber-500" /> Insighty z odpowiedzi
            </h2>
            <p className="mt-1 text-sm text-ink-500">Najczęstsze wątki. Gotowe tematy na kolejne impulsy.</p>
            <ul className="mt-4 space-y-3.5">
              {insights.map((i) => (
                <li key={i.theme}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{i.theme}</span>
                    <span className="font-semibold tabular-nums">{i.share}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-ink-900/5">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${i.share}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-400">Wyróżnione odpowiedzi: {starred.length}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
