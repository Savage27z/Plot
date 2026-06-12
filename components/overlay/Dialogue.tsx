"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePlot } from "@/lib/store";
import Typewriter from "./Typewriter";

// The strategist speaks: observations one at a time (click / space to advance),
// then verdict, then the one hard question with a respond input.
export default function Dialogue({
  onRespond,
  onReread,
}: {
  onRespond: (answer: string) => void;
  onReread: () => void;
}) {
  const phase = usePlot((s) => s.phase);
  const analyses = usePlot((s) => s.analyses);
  const obsIndex = usePlot((s) => s.obsIndex);
  const cards = usePlot((s) => s.cards);
  const analysis = analyses[analyses.length - 1];
  const [typed, setTyped] = useState(false);
  const [answer, setAnswer] = useState("");

  const speaking = phase === "speaking";
  const obs = analysis?.observations[obsIndex];
  const card = obs ? cards.find((c) => c.id === obs.cardId) : undefined;

  const advance = useCallback(() => {
    const s = usePlot.getState();
    const a = s.analyses[s.analyses.length - 1];
    if (!a || s.phase !== "speaking") return;
    if (!typed) return; // let the line finish typing first
    setTyped(false);
    if (s.obsIndex < a.observations.length - 1) {
      s.setObsIndex(s.obsIndex + 1);
    } else {
      s.setActiveCard(null);
      s.setPhase("verdict");
    }
  }, [typed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && speaking) {
        const target = e.target as HTMLElement;
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, speaking]);

  useEffect(() => setTyped(false), [obsIndex, phase]);

  if (!analysis) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center pb-8 pointer-events-none">
      <div className="w-full max-w-3xl px-8 pointer-events-auto">
        <AnimatePresence mode="wait">
          {speaking && obs && (
            <motion.div
              key={`obs-${analyses.length}-${obsIndex}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={advance}
              className="cursor-pointer border-t border-bone/15 bg-char/85 px-8 py-6 backdrop-blur-sm"
            >
              <p className="font-mono smallcaps text-[11px] tracking-[0.25em] text-ember mb-3">
                the strategist · {obsIndex + 1} / {analysis.observations.length}
                {card ? ` · re: ${card.title}` : ""}
              </p>
              <p className="font-serif italic text-bone text-2xl leading-snug min-h-[4.5rem]">
                <Typewriter text={obs.text} onDone={() => setTyped(true)} />
              </p>
              <p
                className={`font-mono text-[10px] tracking-[0.25em] uppercase mt-4 transition-opacity duration-500 ${
                  typed ? "text-bone/35" : "text-bone/0"
                }`}
              >
                click or press space
              </p>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div
              key={`verdict-${analyses.length}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-ember/40 bg-char/90 px-8 py-7 backdrop-blur-sm"
            >
              <p className="font-mono smallcaps text-[11px] tracking-[0.25em] text-ember mb-3">
                the strategist · verdict
              </p>
              <p className="font-serif text-bone text-xl leading-snug">
                {analysis.verdict}
              </p>
              <p className="font-serif italic text-ember/90 text-2xl leading-snug mt-5">
                {analysis.question}
              </p>

              <div className="mt-6 flex items-end gap-3">
                <textarea
                  rows={2}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (answer.trim().length >= 3) {
                        onRespond(answer.trim());
                        setAnswer("");
                      }
                    }
                  }}
                  placeholder="answer the strategist…"
                  maxLength={500}
                  className="flex-1 bg-transparent border-b border-bone/20 font-serif text-bone text-lg placeholder:text-bone/30 outline-none resize-none pb-2 focus:border-bone/45 transition-colors"
                />
                <button
                  onClick={() => {
                    if (answer.trim().length >= 3) {
                      onRespond(answer.trim());
                      setAnswer("");
                    }
                  }}
                  className="font-mono smallcaps text-xs border border-bone/25 px-4 py-2 text-bone/80 hover:border-bone/60 hover:text-bone transition-colors duration-300"
                >
                  send
                </button>
              </div>

              <div className="mt-5 flex gap-6">
                <button
                  onClick={() => usePlot.getState().setPhase("table")}
                  className="font-mono text-[11px] tracking-[0.2em] uppercase text-bone/40 hover:text-bone/80 transition-colors"
                >
                  ← rearrange the table
                </button>
                <button
                  onClick={onReread}
                  className="font-mono text-[11px] tracking-[0.2em] uppercase text-bone/40 hover:text-bone/80 transition-colors"
                >
                  read it again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
