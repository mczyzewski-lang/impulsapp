import { useState } from "react";
import { Check, Download, FileAudio, FileSpreadsheet, FileText, Gift } from "lucide-react";
import type { FileItem } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { PageTitle } from "./RecipientLayout";

const formatStyle: Record<FileItem["format"], { icon: typeof FileText; className: string }> = {
  PDF: { icon: FileText, className: "bg-rose-100 text-rose-700" },
  XLSX: { icon: FileSpreadsheet, className: "bg-emerald-100 text-emerald-700" },
  DOCX: { icon: FileText, className: "bg-sky-100 text-sky-700" },
  MP3: { icon: FileAudio, className: "bg-amber-100 text-amber-800" },
};

export default function UserFilesPage() {
  const { channel } = useProgress();
  const { files } = channel;
  const [saved, setSaved] = useState<string[]>([]);

  return (
    <div>
      <PageTitle title="Pliki" lead="Materiały bonusowe i dokumenty z kanału. Zawsze tutaj, nie w skrzynce." />
      <ul className="space-y-2.5">
        {files.map((file) => {
          const { icon: Icon, className } = formatStyle[file.format];
          const isSaved = saved.includes(file.id);
          return (
            <li
              key={file.id}
              className={cn("flex items-center gap-3 rounded-2xl border bg-white p-3.5", file.isBonus ? "border-violet-300 ring-4 ring-violet-100" : "border-line")}
            >
              <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", className)}>
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                {file.isBonus && (
                  <Badge tone="violet" className="mb-1">
                    <Gift className="size-3" /> Twój prywatny materiał
                  </Badge>
                )}
                <p className="text-sm leading-snug font-semibold">{file.title}</p>
                <p className="mt-0.5 text-xs text-ink-400">
                  {file.format} · {file.size} · {file.date}
                </p>
              </div>
              <button
                type="button"
                aria-label={isSaved ? `Pobrano: ${file.title}` : `Pobierz: ${file.title}`}
                onClick={() => setSaved((s) => (s.includes(file.id) ? s : [...s, file.id]))}
                className={cn(
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-full transition",
                  isSaved ? "bg-volt-200 text-volt-700" : "bg-ink-900 text-white hover:bg-ink-700",
                )}
              >
                {isSaved ? <Check className="size-4.5" strokeWidth={3} /> : <Download className="size-4.5" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
