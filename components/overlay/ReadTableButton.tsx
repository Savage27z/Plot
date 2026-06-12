"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

const HOLD_MS = 850;

// Primary action: long-press to confirm — the fill completes, then fires.
export default function ReadTableButton({
  onTrigger,
  busy,
}: {
  onTrigger: () => void;
  busy: boolean;
}) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    if (busy) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onTrigger();
    }, HOLD_MS);
  };
  const cancel = () => {
    setHolding(false);
    if (timer.current) clearTimeout(timer.current);
  };

  return (
    <motion.div
      className="absolute bottom-10 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {busy ? (
        <p className="font-serif italic text-bone/90 text-xl">
          the strategist is studying the table
          <span className="cursor-blink text-ember">{" "}▌</span>
        </p>
      ) : (
        <>
          <button
            onPointerDown={start}
            onPointerUp={cancel}
            onPointerLeave={cancel}
            className="relative overflow-hidden border border-bone/30 px-10 py-4 font-mono smallcaps text-sm text-bone hover:border-bone/60 transition-colors duration-300"
          >
            <motion.span
              className="absolute inset-0 origin-left bg-bone/15"
              initial={false}
              animate={{ scaleX: holding ? 1 : 0 }}
              transition={
                holding
                  ? { duration: HOLD_MS / 1000, ease: "linear" }
                  : { duration: 0.18, ease: "easeOut" }
              }
            />
            <span className="relative">read the table</span>
          </button>
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-bone/30">
            hold to confirm · drag cards to arrange your thinking
          </p>
        </>
      )}
    </motion.div>
  );
}
