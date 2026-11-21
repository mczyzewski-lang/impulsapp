import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("min-w-0 rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgb(11_16_32/0.04)]", className)}
      {...props}
    />
  );
}
