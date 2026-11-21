import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckSquare, Clock, FileSpreadsheet, FileText } from "lucide-react";
import type { ToolKind } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageTitle, useAppUi } from "./RecipientLayout";

const kindIcon: Record<ToolKind, typeof CheckSquare> = {
  Checklista: CheckSquare,
  Szablon: FileText,
  Arkusz: FileSpreadsheet,
};

/**
 * Lista narzędzi w kanale. Samo narzędzie otwiera się w arkuszu (ToolSheet),
 * więc lista zostaje pod spodem. /app/narzedzia/:id otwiera arkusz od razu.
 */
export default function UserToolsPage() {
  const { id } = useParams();
  const { channel, downloaded, checked } = useProgress();
  const { openTool } = useAppUi();

  useEffect(() => {
    if (id) openTool(id);
  }, [id, openTool]);

  return (
    <div>
      <PageTitle title="Narzędzia" lead="Checklisty, szablony i arkusze. Nie do czytania — do użycia." />
      <ul className="space-y-3">
        {channel.tools.map((tool) => {
          const Icon = kindIcon[tool.kind];
          const done = checked[tool.id]?.length ?? 0;
          return (
            <li key={tool.id}>
              <button type="button" onClick={() => openTool(tool.id)} className="block w-full rounded-2xl border border-line bg-white p-4 text-left">
                <span className="flex items-start gap-3">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-volt-200 text-volt-700">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-xs text-ink-400">
                      <span className="font-semibold text-ink-600">{tool.kind}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" /> {tool.time}
                      </span>
                    </span>
                    <span className="mt-0.5 block font-display text-[17px] leading-snug font-bold">{tool.title}</span>
                    <span className="mt-1 block text-sm text-ink-500">{tool.description}</span>
                  </span>
                </span>
                <span className="mt-3.5 flex items-center gap-3">
                  <ProgressBar value={done} max={tool.items.length} barClassName="bg-ink-900" label="Postęp narzędzia" />
                  <span className="shrink-0 text-xs font-semibold text-ink-500 tabular-nums">
                    {done}/{tool.items.length}
                  </span>
                  {downloaded.includes(tool.id) && <Badge tone="volt">Pobrane</Badge>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
