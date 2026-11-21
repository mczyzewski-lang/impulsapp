import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "dark" | "outline" | "ghost" | "glass";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-volt-400 text-ink-950 hover:bg-volt-300 shadow-[0_8px_24px_-8px] shadow-volt-400/60",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
  outline: "border border-line bg-white text-ink-900 hover:border-ink-300 hover:bg-paper",
  ghost: "text-ink-600 hover:bg-ink-900/5 hover:text-ink-900",
  glass: "border border-white/15 bg-white/5 text-white backdrop-blur hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-13 px-6 text-base gap-2 rounded-2xl",
};

/** Klasy przycisku — do użycia także na <Link>. */
export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}
