"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { usePlot } from "@/lib/store";
import { computeClusters } from "@/lib/clustering";
import { track } from "@/lib/analytics";
import { CardPosition, PlotCard } from "@/lib/types";
import Landing from "./overlay/Landing";
import Dialogue from "./overlay/Dialogue";
import ReadTableButton from "./overlay/ReadTableButton";
import Toast from "./overlay/Toast";
import CardInspect from "./overlay/CardInspect";
import MobileGate from "./overlay/MobileGate";
import HudFrame from "./overlay/HudFrame";

const Scene = dynamic(() => import("./scene/Scene"), { ssr: false });

// Tidy scatter: jittered grid inside the playable area, no overlaps.
function scatterPositions(cards: PlotCard[]): Record<string, CardPosition> {
  const positions: Record<string, CardPosition> = {};
  const n = cards.length;
  const cols = Math.ceil(Math.sqrt(n * 1.6));
  const rows = Math.ceil(n / cols);
  const cellW = 11.5 / cols;
  const cellH = 6.4 / rows;
  const indices = cards.map((_, i) => i).sort(() => Math.random() - 0.5);
  cards.forEach((card, i) => {
    const slot = indices[i];
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    positions[card.id] = {
      x: -5.75 + cellW * (col + 0.5) + (Math.random() - 0.5) * cellW * 0.35,
      z: -2.4 + cellH * (row + 0.5) + (Math.random() - 0.5) * cellH * 0.35,
    };
  });
  return positions;
}

function describeTable() {
  const { problem, cards, positions, readCount } = usePlot.getState();
  const clusters = computeClusters(positions);
  const named = (id: string) => {
    const c = cards.find((c) => c.id === id);
    return c ? `${id} ("${c.title}")` : id;
  };
  return [
    readCount === 0
      ? `THE DECISION: ${problem}`
      : `RE-READING the same table (reading #${readCount + 1}). The decision is unchanged.`,
    "",
    "CARDS:",
    ...cards.map((c) => `- ${c.id} [${c.type}] "${c.title}": ${c.body}`),
    "",
    "POSITIONS (x,z on the table, origin = table center):",
    ...cards.map((c) => {
      const p = positions[c.id];
      return `- ${c.id}: (${p ? p.x.toFixed(1) : "?"}, ${p ? p.z.toFixed(1) : "?"})`;
    }),
    "",
    "COMPUTED ARRANGEMENT:",
    `- clusters: ${
      clusters.clusters.length
        ? clusters.clusters.map((g) => `[${g.cardIds.map(named).join(", ")}]`).join(" ")
        : "none — every card stands alone"
    }`,
    `- isolated cards: ${clusters.isolated.length ? clusters.isolated.map(named).join(", ") : "none"}`,
    `- nearest the center of the table: ${named(clusters.nearestCenter)}`,
  ].join("\n");
}

export default function PlotApp() {
  const phase = usePlot((s) => s.phase);

  // dev-only handle for driving the store from the console / tests
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as Record<string, unknown>).__plot = usePlot;
    }
  }, []);
  const toast = usePlot((s) => s.toast);

  const fail = useCallback((msg?: string) => {
    const s = usePlot.getState();
    s.showToast(msg ?? "the strategist stepped out — try again.");
    setTimeout(() => usePlot.getState().clearToast(), 4200);
  }, []);

  const submitProblem = useCallback(
    async (problem: string) => {
      const s = usePlot.getState();
      s.setProblem(problem);
      s.setPhase("decomposing");
      track("problem_submitted");
      try {
        const res = await fetch("/api/strategist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mode: "decompose", problem }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        usePlot.getState().setCards(data.cards, scatterPositions(data.cards));
        usePlot.getState().setPhase("table");
      } catch {
        usePlot.getState().setPhase("landing");
        fail();
      }
    },
    [fail]
  );

  const readTable = useCallback(async () => {
    const s = usePlot.getState();
    s.setPhase("reading");
    track("table_read");
    const content = describeTable();
    try {
      const res = await fetch("/api/strategist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "analyze", content, history: s.history }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const st = usePlot.getState();
      st.pushHistory({ role: "user", content });
      st.pushHistory({ role: "assistant", content: JSON.stringify(data) });
      st.pushAnalysis(data);
      st.bumpReadCount();
      st.setObsIndex(0);
      st.setActiveCard(data.observations[0]?.cardId ?? null);
      st.setPhase("speaking");
    } catch {
      usePlot.getState().setPhase("table");
      fail();
    }
  }, [fail]);

  const respond = useCallback(
    async (answer: string) => {
      const s = usePlot.getState();
      s.setPhase("reading");
      track("response_sent");
      const content = `MY ANSWER to your question: ${answer}\n\nThe table as it stands now:\n${describeTable()}`;
      try {
        const res = await fetch("/api/strategist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mode: "respond", content, history: s.history }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        const st = usePlot.getState();
        st.pushAnswer(answer);
        st.pushHistory({ role: "user", content });
        st.pushHistory({ role: "assistant", content: JSON.stringify(data) });
        st.pushAnalysis(data);
        st.setObsIndex(0);
        st.setActiveCard(data.observations[0]?.cardId ?? null);
        st.setPhase("speaking");
      } catch {
        usePlot.getState().setPhase("verdict");
        fail();
      }
    },
    [fail]
  );

  // Keep the beam pointed at the card for the current observation.
  const obsIndex = usePlot((s) => s.obsIndex);
  useEffect(() => {
    const s = usePlot.getState();
    if (s.phase !== "speaking") return;
    const a = s.analyses[s.analyses.length - 1];
    s.setActiveCard(a?.observations[obsIndex]?.cardId ?? null);
  }, [obsIndex, phase]);

  return (
    <main className="fixed inset-0 grain vignette select-none">
      <Scene />
      <HudFrame />
      <AnimatePresence>
        {(phase === "landing" || phase === "decomposing") && (
          <Landing key="landing" onSubmit={submitProblem} />
        )}
      </AnimatePresence>
      {(phase === "table" || phase === "reading") && (
        <ReadTableButton onTrigger={readTable} busy={phase === "reading"} />
      )}
      {(phase === "speaking" || phase === "verdict") && (
        <Dialogue onRespond={respond} onReread={readTable} />
      )}
      <CardInspect />
      <AnimatePresence>{toast && <Toast key="toast" message={toast} />}</AnimatePresence>
      <MobileGate />
    </main>
  );
}
