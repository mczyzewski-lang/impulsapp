import { cn } from "@/lib/cn";

const palette = [
  "from-violet-500 to-indigo-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-fuchsia-500 to-purple-600",
  "from-amber-500 to-orange-600",
];

/**
 * Ilustrowane portrety twórców (zastępują inicjały).
 * Docelowo w tym miejscu pojawi się zdjęcie wgrane przez twórcę.
 */
interface Portrait {
  bg: [string, string];
  skin: string;
  hair: string;
  shirt: string;
  style: "long" | "short";
}

const portraits: Record<string, Portrait> = {
  "Marta Zielińska": { bg: ["#8b5cf6", "#4f46e5"], skin: "#f2c9a5", hair: "#4a2c1a", shirt: "#c8f542", style: "long" },
  "Piotr Malec": { bg: ["#14b8a6", "#0369a1"], skin: "#e8b78e", hair: "#1f2430", shirt: "#f5f6fa", style: "short" },
};

/** Zdjęcia twórców (pliki w public/creators). Mają pierwszeństwo przed ilustracją. */
const photos: Record<string, string> = {
  "Marta Zielińska": "/creators/marta-zielinska.jpg",
};

function PortraitSvg({ portrait, id }: { portrait: Portrait; id: string }) {
  const { bg, skin, hair, shirt, style } = portrait;
  return (
    <svg viewBox="0 0 40 40" className="size-full" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg[0]} />
          <stop offset="1" stopColor={bg[1]} />
        </linearGradient>
      </defs>
      <rect width="40" height="40" fill={`url(#${id})`} />
      {style === "long" && <path d="M9.5 19c0-8 4.5-12.5 10.5-12.5S30.5 11 30.5 19v9.5c0 2-2 3.5-4 3.5h-13c-2 0-4-1.5-4-3.5z" fill={hair} />}
      <ellipse cx="20" cy="41" rx="14.5" ry="10.5" fill={shirt} />
      <path d="M16.8 24h6.400v5.2a3.2 3.2 0 0 1-6.400 0z" fill={skin} />
      <path d="M16.8 26.2c2 1.2 4.400 1.2 6.400 0V24h-6.400z" fill="#000" opacity="0.12" />
      <ellipse cx="20" cy="18" rx="6.8" ry="7.8" fill={skin} />
      {style === "long" ? (
        <path d="M12.8 18.5C12 11.5 16 8.8 20.5 8.8c4.5 0 7.5 3.2 6.8 9.700-1.2-3.300-3.300-5-6.300-5.2-3.2-.2-6 1.600-8.2 5.2z" fill={hair} />
      ) : (
        <path d="M13 17.5c-.8-6 2.5-9.2 7-9.2s7.8 3.2 7 9.2c-.6-2.400-1.8-3.8-3.400-4.300-2.400.9-4.8.9-7.2 0-1.600.5-2.8 1.900-3.400 4.300z" fill={hair} />
      )}
    </svg>
  );
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
};

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const portrait = portraits[name];
  const photo = photos[name];

  if (photo) {
    return <img src={photo} alt={name} className={cn("inline-block shrink-0 rounded-full object-cover", sizes[size], className)} />;
  }

  if (portrait) {
    return (
      <span role="img" aria-label={name} className={cn("inline-flex shrink-0 overflow-hidden rounded-full", sizes[size], className)}>
        <PortraitSvg portrait={portrait} id={`portrait-${hash}`} />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-linear-to-br font-display font-bold text-white",
        palette[hash % palette.length],
        sizes[size],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
