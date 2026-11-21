import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, LogOut, RotateCcw, ShieldCheck } from "lucide-react";
import { creator, tools, videos } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { useState } from "react";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { name, watched, downloaded, answer, chatUnlocked, reset } = useProgress();
  const [push, setPush] = useState(true);
  const [digest, setDigest] = useState(false);

  const stats = [
    { label: "Obejrzane wideo", value: `${watched.length}/${videos.length}` },
    { label: "Pobrane narzędzia", value: `${downloaded.length}/${tools.length}` },
    { label: "Odpowiedzi", value: answer ? "1" : "0" },
  ];

  function resetDemo() {
    reset();
    navigate(`/k/${creator.slug}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar name={name || "Ty"} size="lg" className="from-ink-700 to-ink-900" />
        <div>
          <h1 className="text-2xl leading-tight font-bold">{name || "Twój profil"}</h1>
          <Badge tone={chatUnlocked ? "volt" : "neutral"} className="mt-1">
            {chatUnlocked ? "Aktywny odbiorca · czat odblokowany" : "Odbiorca kanału"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <Card key={s.label} className="p-3 text-center">
            <p className="font-display text-xl font-bold tabular-nums">{s.value}</p>
            <p className="mt-0.5 text-[11px] leading-tight text-ink-500">{s.label}</p>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-ink-500">Twoje kanały</h2>
        <Card className="flex items-center gap-3 p-3.5">
          <Avatar name={creator.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{creator.channelName}</p>
            <p className="truncate text-xs text-ink-400">{creator.name}</p>
          </div>
          <ChevronRight className="size-5 text-ink-300" />
        </Card>
        <p className="mt-2 flex items-start gap-2 text-xs text-ink-400">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          Nowe kanały pojawiają się tu tylko wtedy, gdy otworzysz zaproszenie od twórcy.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-ink-500">Powiadomienia</h2>
        <Card className="divide-y divide-line">
          <div className="flex items-center gap-3 p-3.5">
            <Bell className="size-5 text-ink-400" />
            <p className="flex-1 text-sm font-medium">Nowe impulsy i pytania od twórcy</p>
            <Toggle checked={push} onChange={setPush} label="Powiadomienia o nowych impulsach" />
          </div>
          <div className="flex items-center gap-3 p-3.5">
            <Bell className="size-5 text-ink-400" />
            <p className="flex-1 text-sm font-medium">Cotygodniowe podsumowanie mailem</p>
            <Toggle checked={digest} onChange={setDigest} label="Cotygodniowe podsumowanie" />
          </div>
        </Card>
      </section>

      <Card className="divide-y divide-line">
        <button type="button" onClick={resetDemo} className="flex w-full items-center gap-3 p-3.5 text-left text-sm font-medium">
          <RotateCcw className="size-5 text-ink-400" />
          Zresetuj demo i zacznij od zaproszenia
        </button>
        <button type="button" onClick={resetDemo} className="flex w-full items-center gap-3 p-3.5 text-left text-sm font-medium text-rose-600">
          <LogOut className="size-5" />
          Wyloguj się
        </button>
      </Card>
    </div>
  );
}
