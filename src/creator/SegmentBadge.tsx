import { segmentInfo, type Segment } from "@/data/mock";
import { Badge } from "@/components/ui/Badge";

const tone = { zimny: "sky", ciepły: "amber", aktywny: "violet", ambasador: "volt" } as const;

export const segmentDot: Record<Segment, string> = {
  zimny: "bg-sky-400",
  ciepły: "bg-amber-400",
  aktywny: "bg-violet-500",
  ambasador: "bg-volt-500",
};

export function SegmentBadge({ segment }: { segment: Segment }) {
  return <Badge tone={tone[segment]}>{segmentInfo[segment].label}</Badge>;
}
