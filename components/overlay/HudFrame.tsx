"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlot } from "@/lib/store";
import { buildMemo } from "@/lib/memo";
import { track } from "@/lib/analytics";

const LEGEND: [string, string][] = [
  ["stakeholder", "#6b7d4f"],
  ["constraint", "#5d6b75"],
  ["dependency", "#8a6a5c"],
  ["evidence", "#b3a06e"],
  ["option", "#c8bfa8"],
  ["risk", "#a85b3c"],
];

// Persistent corners: wordmark top-left, legend bottom-left,
// export top-right once a reading exists.
export default function HudFrame() {
  const phase = usePlot((s) => s.phase);
  const hasAnalyses = usePlot((s) => s.analyses.length > 0);
  const [copied, setCopied] = useState(false);

  if (phase === "landing" || phase === "decomposing") return null;

  const exportMemo = async () => {
    const { problem, cards, analyses, answers } = usePlot.getState();
    const md = buildMemo(problem, cards, analyses, answers);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plot-memo.md";
    a.click();
    URL.revokeObjectURL(url);
    track("memo_exported");
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard can be denied; the download already happened
    }
  };

  return (
    <>
      <Link href="/" className="group absolute left-8 top-7 z-30">
        <span className="font-serif text-3xl text-bone/85 transition-colors group-hover:text-bone">
          Plot
        </span>
        <span className="ml-4 font-mono smallcaps text-xs tracking-widest text-bone/30">
          see your decision
        </span>
      </Link>

      {hasAnalyses && (
        <button
          onClick={exportMemo}
          className="absolute right-8 top-7 z-30 border border-bone/25 px-5 py-2.5 font-mono smallcaps text-xs text-bone/80 transition-colors duration-300 hover:border-bone/60 hover:text-bone"
        >
          {copied ? "copied to clipboard" : "export memo"}
        </button>
      )}

      {/* card-type legend */}
      <div className="pointer-events-none absolute bottom-8 left-8 z-30 hidden flex-col gap-1.5 lg:flex">
        {LEGEND.map(([label, color]) => (
          <div key={label} className="flex items-center gap-2.5">
            <span className="h-[3px] w-5" style={{ background: color }} />
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-bone/35">
              {label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
