import { CardPosition, PlotCard } from "./types";

// Shareable table: problem + cards + positions packed into the URL hash.
// No backend, no storage — the link IS the table.

interface TableState {
  p: string;
  c: PlotCard[];
  x: Record<string, [number, number]>;
}

function toBase64Url(s: string): string {
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(b64)));
}

export function encodeTable(
  problem: string,
  cards: PlotCard[],
  positions: Record<string, CardPosition>
): string {
  const state: TableState = {
    p: problem,
    c: cards,
    x: Object.fromEntries(
      Object.entries(positions).map(([id, p]) => [
        id,
        [Math.round(p.x * 10) / 10, Math.round(p.z * 10) / 10] as [number, number],
      ])
    ),
  };
  return toBase64Url(JSON.stringify(state));
}

export function decodeTable(hash: string): {
  problem: string;
  cards: PlotCard[];
  positions: Record<string, CardPosition>;
} | null {
  try {
    const state = JSON.parse(fromBase64Url(hash)) as TableState;
    if (!state.p || !Array.isArray(state.c) || !state.x) return null;
    const cards = state.c.filter(
      (c) => c && typeof c.id === "string" && typeof c.title === "string"
    );
    if (!cards.length) return null;
    const positions: Record<string, CardPosition> = {};
    for (const card of cards) {
      const p = state.x[card.id];
      positions[card.id] = Array.isArray(p)
        ? { x: Number(p[0]) || 0, z: Number(p[1]) || 0 }
        : { x: 0, z: 0 };
    }
    return { problem: String(state.p).slice(0, 600), cards, positions };
  } catch {
    return null;
  }
}
