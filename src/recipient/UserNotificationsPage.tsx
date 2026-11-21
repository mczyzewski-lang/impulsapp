import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, FileText, MessageCircleQuestion, Play } from "lucide-react";
import { notifications, type Notification } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { cn } from "@/lib/cn";
import { PageTitle } from "./RecipientLayout";

const kindStyle: Record<Notification["kind"], { icon: typeof Play; className: string }> = {
  video: { icon: Play, className: "bg-violet-100 text-violet-700" },
  tool: { icon: CheckSquare, className: "bg-volt-200 text-volt-700" },
  chat: { icon: MessageCircleQuestion, className: "bg-sky-100 text-sky-700" },
  file: { icon: FileText, className: "bg-amber-100 text-amber-800" },
};

export default function UserNotificationsPage() {
  const { notificationsRead: readNow, readNotifications } = useProgress();
  // Stan z chwili wejścia — nowe powiadomienia pozostają wyróżnione podczas tej wizyty.
  const [notificationsRead] = useState(readNow);

  useEffect(() => {
    readNotifications();
  }, [readNotifications]);

  return (
    <div>
      <PageTitle title="Powiadomienia" lead="Tylko z kanałów, do których należysz." />
      <ul className="space-y-2.5">
        {notifications.map((n, i) => {
          const { icon: Icon, className } = kindStyle[n.kind];
          const unread = !notificationsRead && i < 3;
          return (
            <li key={n.id}>
              <Link to={n.to} className={cn("flex items-start gap-3 rounded-2xl border p-3.5", unread ? "border-violet-200 bg-violet-50" : "border-line bg-white")}>
                <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-xl", className)}>
                  <Icon className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-sm text-ink-500">{n.body}</p>
                  <p className="mt-1 text-xs text-ink-400">{n.time}</p>
                </div>
                {unread && <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-violet-600" aria-label="Nowe" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
