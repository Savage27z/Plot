"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePlot } from "@/lib/store";

const TYPE_COLOR: Record<string, string> = {
  stakeholder: "#6b7d4f",
  constraint: "#5d6b75",
  dependency: "#8a6a5c",
  evidence: "#b3a06e",
  option: "#c8bfa8",
  risk: "#a85b3c",
};

// Click a card on the table → it lifts to the screen to be read.
// Click again (anywhere) → it returns to the table.
export default function CardInspect() {
  const inspectedId = usePlot((s) => s.inspectedId);
  const card = usePlot((s) => s.cards.find((c) => c.id === s.inspectedId));
  const close = () => usePlot.getState().setInspected(null);

  return (
    <AnimatePresence>
      {inspectedId && card && (
        <motion.div
          key={inspectedId}
          className="absolute inset-0 z-40 flex cursor-pointer items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ background: "rgba(12,11,9,0.55)" }}
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.45, y: 120, rotate: -3, opacity: 0 }}
            animate={{ scale: 1, y: 0, rotate: -1.2, opacity: 1 }}
            exit={{ scale: 0.5, y: 110, rotate: -3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="w-[460px] max-w-[88vw] bg-[#ded5c2] px-9 py-8 shadow-[0_45px_90px_-25px_rgba(0,0,0,0.85)]"
          >
            <div
              className="mb-5 h-[5px] w-full"
              style={{ background: TYPE_COLOR[card.type] ?? "#8a8273" }}
            />
            <div className="flex items-baseline justify-between font-mono text-[11px] tracking-[0.25em] uppercase text-char/55">
              <span>{card.type}</span>
              <span>{card.id}</span>
            </div>
            <h3 className="mt-3 font-serif text-4xl leading-tight text-[#15130f]">
              {card.title}
            </h3>
            <p className="mt-4 font-mono text-[14px] leading-relaxed text-char/75">
              {card.body}
            </p>
            <p className="mt-7 text-center font-mono text-[9px] tracking-[0.3em] uppercase text-char/35">
              click to put it back
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
