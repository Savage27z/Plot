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
import AddCard from "./overlay/AddCard";
import { decodeTable } from "@/lib/share";
import { startHum, stopHum } from "@/lib/audio";
import MobileGate from "./overlay/MobileGate";
import HudFrame from "./overlay/HudFrame";

const Scene = dynamic(() => import("./scene/Scene"), { ssr: false });

const AGENT_ID = "Uogi4ZCWrTWJQTCx686Gy4pk_3c";
let _conversationId: string | null = null;
function getConversationId(): string {
  if (!_conversationId) _conversationId = crypto.randomUUID();
  return _conversationId;
}
let lastAgentMessageId: string | null = null;

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
  const { problem, cards, positions, readCount, lastReadPositions } =
    usePlot.getState();
  const clusters = computeClusters(positions);
  const named = (id: string) => {
    const c = cards.find((c) => c.id === id);
    return c ? `${id} ("${c.title}")` : id;
  };

  // what changed since the strategist last read the table
  const moves: string[] = [];
  if (lastReadPositions) {
    for (const c of cards) {
      const prev = lastReadPositions[c.id];
      const cur = positions[c.id];
      if (!cur) continue;
      if (!prev) {
        moves.push(`- ${named(c.id)} is NEW on the table${c.userAdded ? " (added by the user themselves)" : ""}`);
        continue;
      }
      const dist = Math.hypot(cur.x - prev.x, cur.z - prev.z);
      if (dist > 1.2) {
        const before = Math.hypot(prev.x, prev.z);
        const after = Math.hypot(cur.x, cur.z);
        const dir =
          after < before - 0.8
            ? "toward the center"
            : after > before + 0.8
              ? "out toward the edge"
              : "across the table";
        moves.push(
          `- ${named(c.id)} moved ${dir} (from ${prev.x.toFixed(1)},${prev.z.toFixed(1)} to ${cur.x.toFixed(1)},${cur.z.toFixed(1)})`
        );
      }
    }
  }

  return [
    readCount === 0
      ? `THE DECISION: ${problem}`
      : `RE-READING the same table (reading #${readCount + 1}). The decision is unchanged.`,
    "",
    "CARDS:",
    ...cards.map(
      (c) =>
        `- ${c.id} [${c.type}] "${c.title}": ${c.body}${c.userAdded ? " (added by the user themselves — they know something you don't)" : ""}`
    ),
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
    ...(moves.length
      ? ["", "MOVED SINCE YOUR LAST READING (react to these specifically):", ...moves]
      : lastReadPositions
        ? ["", "Nothing meaningfully moved since your last reading. Call that out."]
        : []),
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

  // hydrate a shared table from the URL hash (#t=...)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#t=")) return;
    const decoded = decodeTable(hash.slice(3));
    if (!decoded) return;
    const s = usePlot.getState();
    s.setProblem(decoded.problem);
    s.setCards(decoded.cards, decoded.positions);
    s.setPhase("table");
    track("shared_table_loaded", {
      cardCount: decoded.cards.length,
      problemLength: decoded.problem.length,
    });
  }, []);

  // the orb hums while it speaks (only when sound is on)
  const audioOn = usePlot((s) => s.audioOn);
  useEffect(() => {
    if (audioOn && (phase === "speaking" || phase === "verdict")) startHum();
    else stopHum();
  }, [phase, audioOn]);
  const toast = usePlot((s) => s.toast);

  const fail = useCallback((msg?: string) => {
    const s = usePlot.getState();
    s.showToast(msg ?? "the strategist stepped out — try again.");
    setTimeout(() => usePlot.getState().clearToast(), 4200);
  }, []);

  const submitProblem = useCallback(
    async (problem: string, isExample: boolean) => {
      const s = usePlot.getState();
      s.setProblem(problem);
      s.setPhase("decomposing");
      track("problem_submitted", {
        problemLength: problem.length,
        isExample,
      });
      const promptMessageId = crypto.randomUUID();
      try {
        window.pendo?.trackAgent?.("prompt", {
          agentId: AGENT_ID,
          conversationId: getConversationId(),
          messageId: promptMessageId,
          content: problem,
          suggestedPrompt: isExample,
        });
      } catch { /* analytics must never break the product */ }
      try {
        const res = await fetch("/api/strategist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mode: "decompose", problem }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        const cards = data.cards as PlotCard[];
        const responseMessageId = crypto.randomUUID();
        lastAgentMessageId = responseMessageId;
        try {
          window.pendo?.trackAgent?.("agent_response", {
            agentId: AGENT_ID,
            conversationId: getConversationId(),
            messageId: responseMessageId,
            content: JSON.stringify(cards),
          });
        } catch { /* analytics must never break the product */ }
        usePlot.getState().setCards(cards, scatterPositions(cards));
        usePlot.getState().setPhase("table");
        track("decision_decomposed", {
          cardCount: cards.length,
          stakeholderCount: cards.filter((c) => c.type === "stakeholder").length,
          constraintCount: cards.filter((c) => c.type === "constraint").length,
          dependencyCount: cards.filter((c) => c.type === "dependency").length,
          evidenceCount: cards.filter((c) => c.type === "evidence").length,
          optionCount: cards.filter((c) => c.type === "option").length,
          riskCount: cards.filter((c) => c.type === "risk").length,
          problemLength: problem.length,
        });
      } catch {
        usePlot.getState().setPhase("landing");
        fail();
      }
    },
    [fail]
  );

  const readTable = useCallback(async () => {
    const s = usePlot.getState();
    if (s.phase === "verdict" && lastAgentMessageId) {
      try {
        window.pendo?.trackAgent?.("user_reaction", {
          agentId: AGENT_ID,
          conversationId: getConversationId(),
          messageId: lastAgentMessageId,
          content: "retry",
        });
      } catch { /* analytics must never break the product */ }
    }
    s.setPhase("reading");
    const clusters = computeClusters(s.positions);
    track("table_read", {
      cardCount: s.cards.length,
      readCount: s.readCount,
      clusterCount: clusters.clusters.length,
      isolatedCount: clusters.isolated.length,
      userAddedCardCount: s.cards.filter((c) => c.userAdded).length,
    });
    const content = describeTable();
    const promptMessageId = crypto.randomUUID();
    try {
      window.pendo?.trackAgent?.("prompt", {
        agentId: AGENT_ID,
        conversationId: getConversationId(),
        messageId: promptMessageId,
        content: content,
      });
    } catch { /* analytics must never break the product */ }
    try {
      const res = await fetch("/api/strategist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "analyze", content, history: s.history, isFinal: s.analyses.length >= 2 }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const responseMessageId = crypto.randomUUID();
      lastAgentMessageId = responseMessageId;
      try {
        window.pendo?.trackAgent?.("agent_response", {
          agentId: AGENT_ID,
          conversationId: getConversationId(),
          messageId: responseMessageId,
          content: JSON.stringify(data),
        });
      } catch { /* analytics must never break the product */ }
      const st = usePlot.getState();
      st.pushHistory({ role: "user", content });
      st.pushHistory({ role: "assistant", content: JSON.stringify(data) });
      st.pushAnalysis(data);
      st.bumpReadCount();
      st.snapshotPositions();
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
      track("response_sent", {
        answerLength: answer.length,
        readCount: s.readCount,
        cardCount: s.cards.length,
      });
      const content = `MY ANSWER to your question: ${answer}\n\nThe table as it stands now:\n${describeTable()}`;
      const promptMessageId = crypto.randomUUID();
      try {
        window.pendo?.trackAgent?.("prompt", {
          agentId: AGENT_ID,
          conversationId: getConversationId(),
          messageId: promptMessageId,
          content: answer,
        });
      } catch { /* analytics must never break the product */ }
      try {
        const res = await fetch("/api/strategist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mode: "respond", content, history: s.history, isFinal: s.analyses.length >= 2 }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        const responseMessageId = crypto.randomUUID();
        lastAgentMessageId = responseMessageId;
        try {
          window.pendo?.trackAgent?.("agent_response", {
            agentId: AGENT_ID,
            conversationId: getConversationId(),
            messageId: responseMessageId,
            content: JSON.stringify(data),
          });
        } catch { /* analytics must never break the product */ }
        const st = usePlot.getState();
        st.pushAnswer(answer);
        st.pushHistory({ role: "user", content });
        st.pushHistory({ role: "assistant", content: JSON.stringify(data) });
        st.pushAnalysis(data);
        st.snapshotPositions();
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
      {phase === "table" && <AddCard />}
      {(phase === "speaking" || phase === "verdict") && (
        <Dialogue onRespond={respond} onReread={readTable} />
      )}
      <CardInspect />
      <AnimatePresence>{toast && <Toast key="toast" message={toast} />}</AnimatePresence>
      <MobileGate />
    </main>
  );
}
