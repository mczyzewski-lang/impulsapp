import { Check, Clock, Download } from "lucide-react";
import { useProgress } from "@/state/progress";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Sheet } from "./Sheet";

/** Widok narzędzia / checklisty — otwierany jako arkusz z dowolnego miejsca w kanale. */
export function ToolSheet({ toolId, onClose }: { toolId: string | null; onClose: () => void }) {
  const { channel, checked, toggleCheck, downloaded, markDownloaded } = useProgress();
  const tool = channel.tools.find((t) => t.id === toolId);
  const done = tool ? (checked[tool.id] ?? []) : [];
  const isDownloaded = tool ? downloaded.includes(tool.id) : false;

  return (
    <Sheet open={Boolean(tool)} onClose={onClose} title="Narzędzie">
      {tool && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="volt">{tool.kind}</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                <Clock className="size-3" /> {tool.time}
              </span>
            </div>
            <h2 className="mt-2 text-2xl leading-tight font-bold">{tool.title}</h2>
            <p className="mt-1.5 text-[15px] text-ink-500">{tool.description}</p>
          </div>

          <div className="rounded-2xl border border-line">
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <ProgressBar value={done.length} max={tool.items.length} barClassName="bg-ink-900" label="Postęp checklisty" />
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {done.length}/{tool.items.length}
              </span>
            </div>
            <ul className="divide-y divide-line">
              {tool.items.map((item, i) => {
                const isChecked = done.includes(i);
                return (
                  <li key={item}>
                    <button type="button" role="checkbox" aria-checked={isChecked} onClick={() => toggleCheck(tool.id, i)} className="flex w-full items-start gap-3 px-4 py-3.5 text-left">
                      <span
                        className={cn(
                          "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                          isChecked ? "border-volt-400 bg-volt-400 text-ink-950" : "border-ink-300",
                        )}
                      >
                        {isChecked && <Check className="size-4" strokeWidth={3} />}
                      </span>
                      <span className={cn("text-[15px]", isChecked && "text-ink-400 line-through")}>{item}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <Button variant={isDownloaded ? "outline" : "dark"} size="lg" className="w-full" onClick={() => markDownloaded(tool.id)}>
            {isDownloaded ? <Check className="size-5" /> : <Download className="size-5" />}
            {isDownloaded ? "Pobrane — zapisano na urządzeniu" : "Pobierz narzędzie (PDF)"}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
