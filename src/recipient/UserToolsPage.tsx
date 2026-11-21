import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, CheckSquare, Clock, Download, FileSpreadsheet, FileText } from "lucide-react";
import { tools, type ToolKind } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageTitle } from "./RecipientLayout";

const kindIcon: Record<ToolKind, typeof CheckSquare> = {
  Checklista: CheckSquare,
  Szablon: FileText,
  Arkusz: FileSpreadsheet,
};

/** Lista narzędzi w kanale. */
export default function UserToolsPage() {
  const { downloaded, checked } = useProgress();
  return (
    <div>
      <PageTitle title="Narzędzia" lead="Checklisty, szablony i arkusze. Nie do czytania — do użycia." />
      <ul className="space-y-3">
        {tools.map((tool) => {
          const Icon = kindIcon[tool.kind];
          const done = checked[tool.id]?.length ?? 0;
          return (
            <li key={tool.id}>
              <Link to={`/app/narzedzia/${tool.id}`} className="block rounded-2xl border border-line bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-volt-200 text-volt-700">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-ink-400">
                      <span className="font-semibold text-ink-600">{tool.kind}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" /> {tool.time}
                      </span>
                    </div>
                    <p className="mt-0.5 font-display text-[17px] leading-snug font-bold">{tool.title}</p>
                    <p className="mt-1 text-sm text-ink-500">{tool.description}</p>
                  </div>
                </div>
                <div className="mt-3.5 flex items-center gap-3">
                  <ProgressBar value={done} max={tool.items.length} barClassName="bg-ink-900" label="Postęp narzędzia" />
                  <span className="shrink-0 text-xs font-semibold text-ink-500 tabular-nums">
                    {done}/{tool.items.length}
                  </span>
                  {downloaded.includes(tool.id) && <Badge tone="volt">Pobrane</Badge>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Widok narzędzia / checklisty. */
export function UserToolPage() {
  const { id } = useParams();
  const { checked, toggleCheck, downloaded, markDownloaded } = useProgress();
  const tool = tools.find((t) => t.id === id);
  if (!tool) return <Navigate to="/app/narzedzia" replace />;

  const done = checked[tool.id] ?? [];
  const isDownloaded = downloaded.includes(tool.id);

  return (
    <div className="space-y-5">
      <Link to="/app/narzedzia" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500">
        <ArrowLeft className="size-4" /> Wszystkie narzędzia
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <Badge tone="volt">{tool.kind}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-ink-400">
            <Clock className="size-3" /> {tool.time}
          </span>
        </div>
        <h1 className="mt-2 text-[1.6rem] leading-tight font-bold">{tool.title}</h1>
        <p className="mt-2 text-ink-500">{tool.description}</p>
      </div>

      <div className="rounded-2xl border border-line bg-white">
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
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  onClick={() => toggleCheck(tool.id, i)}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition",
                      isChecked ? "border-ink-900 bg-ink-900 text-volt-400" : "border-ink-300",
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

      {done.length === tool.items.length && (
        <p className="rounded-2xl bg-volt-200 p-4 text-sm font-semibold text-volt-700">
          Komplet. To narzędzie jest gotowe do użycia przy następnej rozmowie.
        </p>
      )}

      <Button variant={isDownloaded ? "outline" : "dark"} size="lg" className="w-full" onClick={() => markDownloaded(tool.id)}>
        {isDownloaded ? <Check className="size-5" /> : <Download className="size-5" />}
        {isDownloaded ? "Pobrane — zapisano na urządzeniu" : "Pobierz narzędzie (PDF)"}
      </Button>
    </div>
  );
}
