import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * Arkusz wysuwany od dołu. Renderowany wewnątrz ramki telefonu,
 * dzięki czemu szczegóły otwierają się „nad” bieżącym ekranem
 * i użytkownik nie traci miejsca, w którym był.
 */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
          <motion.button
            type="button"
            aria-label="Zamknij"
            className="absolute inset-0 cursor-default bg-ink-950/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="pb-safe relative flex max-h-[88%] flex-col rounded-t-[1.75rem] bg-white text-ink-900 shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-3 pb-2">
              <span className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-ink-900/15" />
              <p className="pt-3 text-sm font-semibold text-ink-400">{title}</p>
              <button type="button" aria-label="Zamknij" onClick={onClose} className="mt-2 -mr-2 inline-flex size-10 items-center justify-center rounded-full text-ink-500 hover:bg-ink-900/5">
                <X className="size-5" />
              </button>
            </div>
            <div className="no-scrollbar overflow-y-auto overscroll-contain px-5 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
