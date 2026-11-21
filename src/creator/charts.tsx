import { nf } from "@/data/mock";
import { cn } from "@/lib/cn";

/** Prosty wykres obszarowy w SVG — bez zewnętrznej biblioteki. */
export function AreaChart({ data, labels, className }: { data: number[]; labels?: string[]; className?: string }) {
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.8;
  const points = data.map((v, i) => [(i / (data.length - 1)) * 100, 100 - ((v - min) / (max - min)) * 100] as const);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const [lastX, lastY] = points[points.length - 1];

  return (
    <div className={className}>
      <div className="relative h-44">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" role="img" aria-label="Wykres aktywnych odbiorców">
          <defs>
            <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#e4e7f0" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={`${line} L100,100 L0,100 Z`} fill="url(#area-fill)" />
          <path d={line} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <span
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-violet-600 shadow"
          style={{ left: `${lastX}%`, top: `${lastY}%` }}
        />
      </div>
      {labels && (
        <div className="mt-2 flex justify-between text-xs text-ink-400">
          {labels.filter(Boolean).map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Lejek „awansu z listy emailowej”. */
export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const top = steps[0].value;
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => {
        const pct = (step.value / top) * 100;
        const prev = i > 0 ? steps[i - 1].value : null;
        return (
          <li key={step.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-ink-600">{step.label}</span>
              <span className="shrink-0 font-semibold tabular-nums">
                {nf.format(step.value)}
                {prev && <span className="ml-2 text-xs font-medium text-ink-400">{Math.round((step.value / prev) * 100)}%</span>}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-ink-900/5">
              <div
                className={cn("h-full rounded-full", i === steps.length - 1 ? "bg-volt-500" : "bg-ink-900")}
                style={{ width: `${Math.max(pct, 2)}%`, opacity: i === steps.length - 1 ? 1 : 1 - i * 0.17 }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Bars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[11px] font-semibold text-ink-600 tabular-nums">{d.value}</span>
          <div className="w-full rounded-t-lg bg-violet-500" style={{ height: `${(d.value / max) * 78}%` }} />
          <span className="text-[11px] text-ink-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
