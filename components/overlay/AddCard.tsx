"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePlot } from "@/lib/store";
import { track } from "@/lib/analytics";
import { CardType } from "@/lib/types";

const TYPES: { type: CardType; color: string }[] = [
  { type: "stakeholder", color: "#6b7d4f" },
  { type: "constraint", color: "#5d6b75" },
  { type: "dependency", color: "#8a6a5c" },
  { type: "evidence", color: "#b3a06e" },
  { type: "option", color: "#c8bfa8" },
  { type: "risk", color: "#a85b3c" },
];

// The AI never knows everything — let the user deal their own card in.
export default function AddCard() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<CardType>("risk");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const place = () => {
    if (title.trim().length < 3) return;
    const s = usePlot.getState();
    const id = `u${(s.cards.length + 1).toString()}${Date.now() % 1000}`;
    s.addCard(
      {
        id,
        type,
        title: title.trim().slice(0, 60),
        body: body.trim().slice(0, 200) || "Added by hand.",
        userAdded: true,
      },
      // deal it onto the near edge, roughly in front of the user
      { x: (Math.random() - 0.5) * 4, z: 3.6 }
    );
    track("card_added", {
      cardType: type,
      titleLength: title.trim().slice(0, 60).length,
      hasBody: body.trim().length > 0,
      totalCardCount: s.cards.length + 1,
    });
    setTitle("");
    setBody("");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-8 right-8 z-30 border border-bone/25 px-5 py-2.5 font-mono smallcaps text-xs text-bone/80 transition-colors duration-300 hover:border-bone/60 hover:text-bone"
      >
        + add a card
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: "rgba(12,11,9,0.6)" }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-[480px] max-w-[90vw] border border-bone/15 bg-char px-8 py-7"
            >
              <p className="font-mono smallcaps text-[11px] tracking-[0.3em] text-bone/40">
                deal your own card
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => setType(t.type)}
                    className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-200 ${
                      type === t.type
                        ? "border-bone/60 text-bone"
                        : "border-bone/15 text-bone/45 hover:border-bone/35"
                    }`}
                  >
                    <span className="h-[3px] w-3.5" style={{ background: t.color }} />
                    {t.type}
                  </button>
                ))}
              </div>

              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && place()}
                placeholder="Title — a few words"
                maxLength={60}
                className="mt-6 w-full border-b border-bone/20 bg-transparent pb-2 font-serif text-2xl text-bone outline-none placeholder:text-bone/30 focus:border-bone/45 transition-colors"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="One line of detail (optional)"
                rows={2}
                maxLength={200}
                className="mt-4 w-full resize-none border-b border-bone/20 bg-transparent pb-2 font-mono text-sm text-bone/85 outline-none placeholder:text-bone/30 focus:border-bone/45 transition-colors"
              />

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setOpen(false)}
                  className="font-mono text-[11px] tracking-[0.2em] uppercase text-bone/40 transition-colors hover:text-bone/80"
                >
                  never mind
                </button>
                <button
                  onClick={place}
                  disabled={title.trim().length < 3}
                  className="border border-bone/30 px-6 py-2.5 font-mono smallcaps text-xs text-bone transition-colors duration-300 enabled:hover:border-bone/70 disabled:opacity-30"
                >
                  place it on the table
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
