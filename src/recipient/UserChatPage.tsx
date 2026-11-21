import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCheck, Info, LockOpen, Send, Star } from "lucide-react";
import { creator, selectedQuestions, weeklyQuestion } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import UserChatUnlockPage from "./UserChatUnlockPage";

const MAX_LENGTH = 400;

/** /app/czat — ekran odblokowania albo właściwy czat, zależnie od aktywności. */
export function ChatRoute() {
  const { chatUnlocked } = useProgress();
  return chatUnlocked ? <UserChatPage /> : <UserChatUnlockPage />;
}

/**
 * Kontrolowana interakcja, nie messenger:
 * pytanie twórcy → odpowiedź odbiorcy → jedna wiadomość → wybrane pytania.
 */
export default function UserChatPage() {
  const { answer, message, sendMessage } = useProgress();
  const [draft, setDraft] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (draft.trim()) sendMessage(draft.trim());
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 rounded-2xl bg-volt-400 p-4 text-ink-950"
      >
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-volt-400">
          <LockOpen className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-lg leading-tight font-bold">Czat odblokowany</h1>
          <p className="text-sm font-medium text-ink-950/70">Twoja aktywność dała Ci bezpośredni kontakt z Martą.</p>
        </div>
      </motion.div>

      <section aria-label="Pytanie tygodnia" className="space-y-3">
        <div className="flex items-end gap-2.5">
          <Avatar name={creator.name} size="sm" />
          <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-white p-3.5">
            <p className="text-xs font-semibold text-violet-700">Pytanie od Marty</p>
            <p className="mt-1 text-[15px] font-semibold">{weeklyQuestion.text}</p>
          </div>
        </div>
        {answer && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-ink-900 p-3.5 text-white">
              <p className="text-[15px]">{answer}</p>
              <p className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-ink-300">
                <CheckCheck className="size-3.5 text-volt-400" /> Odpowiedź dotarła do Marty
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-4">
        <h2 className="text-base font-bold">Twoja wiadomość do Marty</h2>
        {message ? (
          <>
            <p className="mt-3 rounded-xl bg-paper p-3.5 text-[15px]">{message}</p>
            <p className="mt-3 flex items-start gap-2 text-sm text-ink-500">
              <CheckCheck className="mt-0.5 size-4 shrink-0 text-violet-600" />
              Wysłane. Marta czyta wszystkie wiadomości i odpowiada na wybrane. Kolejną wyślesz po następnym impulsie.
            </p>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <p className="mt-1 text-sm text-ink-500">Masz jedną wiadomość na ten impuls. Zadaj pytanie, na którym najbardziej Ci zależy.</p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
              rows={4}
              aria-label="Twoja wiadomość"
              placeholder="Np. Jak zastosować to pytanie, kiedy klient od razu prosi o wycenę?"
              className="mt-3 w-full resize-none rounded-xl border border-line bg-paper p-3 text-[15px] outline-none focus:border-ink-900 focus:bg-white"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-ink-400 tabular-nums">
                {draft.length}/{MAX_LENGTH}
              </span>
              <Button type="submit" variant="dark" disabled={!draft.trim()}>
                <Send className="size-4" /> Wyślij wiadomość
              </Button>
            </div>
          </form>
        )}
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Star className="size-4.5 text-amber-500" fill="currentColor" /> Pytania wybrane przez Martę
        </h2>
        <p className="mt-1 text-sm text-ink-500">Najlepsze pytania z kanału i odpowiedzi dla wszystkich.</p>
        <ul className="mt-3 space-y-3">
          {selectedQuestions.map((q) => (
            <li key={q.id} className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs font-semibold text-ink-400">{q.author} pyta</p>
              <p className="mt-1 text-[15px] font-semibold">{q.question}</p>
              <div className="mt-3 flex gap-2.5 border-t border-line pt-3">
                <Avatar name={creator.name} size="sm" />
                <p className="text-sm text-ink-600">{q.answer}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="flex items-start gap-2 rounded-2xl bg-ink-900/5 p-3.5 text-xs text-ink-500">
        <Info className="mt-0.5 size-4 shrink-0" />
        To nie jest otwarty komunikator. Jedna przemyślana wiadomość na impuls sprawia, że Marta może przeczytać każdą.
      </p>
    </div>
  );
}
