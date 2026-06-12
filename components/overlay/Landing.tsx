"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePlot } from "@/lib/store";

const EXAMPLES = [
  "We need to ship in 6 weeks but the team is split on scope.",
  "Sunset our legacy product, or keep maintaining it for the 20% who still use it?",
  "Expand to enterprise now, or double down on self-serve growth for another year?",
];

export default function Landing({ onSubmit }: { onSubmit: (p: string, isExample: boolean) => void }) {
  const phase = usePlot((s) => s.phase);
  const [value, setValue] = useState("");
  const [nudge, setNudge] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = phase === "decomposing";

  const submit = (text?: string, suggested?: boolean) => {
    const trimmed = (text ?? value).trim();
    if (trimmed.length < 12) {
      setNudge(true);
      inputRef.current?.focus();
      return;
    }
    onSubmit(trimmed, text !== undefined);
  };

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.1, ease: "easeInOut" } }}
      style={{ background: "rgba(12,11,9,0.6)" }}
    >
      <Link
        href="/"
        className="absolute left-8 top-7 font-serif text-3xl text-bone/85 transition-colors hover:text-bone"
      >
        Plot
        <span className="ml-4 font-mono text-xs tracking-widest text-bone/30 smallcaps">
          the war room
        </span>
      </Link>

      {busy ? (
        <p className="font-serif italic text-bone/90 text-center text-2xl">
          the strategist is studying the table
          <span className="cursor-blink text-ember"> ▌</span>
        </p>
      ) : (
        <>
          <motion.p
            className="font-mono smallcaps text-sm tracking-[0.3em] text-ember"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2, duration: 1 } }}
          >
            one decision at a time
          </motion.p>
          <motion.h1
            className="mt-5 font-serif text-bone text-center"
            style={{ fontSize: "clamp(38px, 4.6vw, 64px)", lineHeight: 1.05 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } }}
          >
            What&apos;s on the table?
          </motion.h1>

          <motion.div
            className="relative mt-12 w-full max-w-3xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 1 } }}
          >
            <textarea
              ref={inputRef}
              autoFocus
              rows={2}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (nudge) setNudge(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Describe the decision you're facing…"
              className="w-full resize-none border-b border-bone/15 bg-transparent pb-4 text-center font-serif text-bone caret-transparent outline-none placeholder:text-bone/30 focus:border-bone/35 transition-colors"
              style={{ fontSize: "clamp(22px, 2.3vw, 30px)", lineHeight: 1.3 }}
              maxLength={600}
            />
            {value.length === 0 && (
              <span
                className="caret-breathe pointer-events-none absolute font-serif text-bone/70"
                style={{ left: "50%", transform: "translateX(-50%)", bottom: 18, fontSize: 26 }}
              >
                ▏
              </span>
            )}

            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={() => submit()}
                className="border border-bone/25 px-8 py-3 font-mono smallcaps text-sm text-bone/80 transition-colors duration-300 hover:border-bone/60 hover:text-bone"
              >
                lay it on the table
              </button>
              <motion.p
                className="h-4 font-mono text-xs text-bone-dim"
                animate={{ opacity: nudge ? 1 : 0 }}
              >
                give the strategist a little more than that — a sentence or two.
              </motion.p>
            </div>
          </motion.div>

          {/* one-click sample decisions */}
          <motion.div
            className="mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.8, duration: 1 } }}
          >
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-bone/30">
              or try one —
            </span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setValue(ex);
                  submit(ex, true);
                }}
                className="border border-bone/10 bg-bone/[0.03] px-4 py-2 font-serif text-sm italic text-bone/55 transition-colors duration-300 hover:border-bone/35 hover:text-bone"
              >
                {ex}
              </button>
            ))}
          </motion.div>
        </>
      )}

      <footer className="absolute bottom-5 font-mono text-[11px] tracking-widest text-bone/25 smallcaps">
        Plot — see your decision · Built for World Product Day 2026 · #EveryoneShipsNow
      </footer>
    </motion.div>
  );
}
