import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "dark",
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: "dark" | "light";
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className={`text-sm font-semibold tracking-wide uppercase ${tone === "light" ? "text-volt-400" : "text-violet-600"}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-3 text-3xl leading-[1.1] font-bold text-balance sm:text-[2.6rem] ${tone === "light" ? "text-white" : "text-ink-900"}`}>
        {title}
      </h2>
      {lead && (
        <p className={`mt-4 text-lg text-pretty ${tone === "light" ? "text-ink-300" : "text-ink-500"}`}>{lead}</p>
      )}
    </Reveal>
  );
}
