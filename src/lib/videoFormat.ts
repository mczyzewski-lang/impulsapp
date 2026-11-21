import type { VideoFormat } from "@/data/mock";

/** Klasy proporcji dla każdego dopuszczalnego formatu wideo. */
export const formatAspect: Record<VideoFormat, string> = {
  "9:16": "aspect-[9/16]",
  "1:1": "aspect-square",
  "16:9": "aspect-video",
};

export const formatLabel: Record<VideoFormat, string> = {
  "9:16": "Pionowe",
  "1:1": "Kwadrat",
  "16:9": "Poziome",
};
