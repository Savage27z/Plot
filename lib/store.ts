import { create } from "zustand";
import { Analysis, CardPosition, ChatTurn, PlotCard } from "./types";

export type Phase =
  | "landing" // empty table, big input
  | "decomposing" // waiting on Claude call #1
  | "table" // cards on table, free drag
  | "reading" // waiting on analyze call
  | "speaking" // observations playing one at a time
  | "verdict" // verdict + question shown, respond input open
  ;

interface PlotState {
  phase: Phase;
  problem: string;
  cards: PlotCard[];
  positions: Record<string, CardPosition>;
  draggingId: string | null;
  hoveredId: string | null;
  analyses: Analysis[];
  answers: string[];
  history: ChatTurn[];
  obsIndex: number; // which observation is on screen during "speaking"
  activeCardId: string | null; // card the beam points at
  toast: string | null;
  readCount: number;
  inspectedId: string | null;

  setPhase: (p: Phase) => void;
  setProblem: (p: string) => void;
  setCards: (cards: PlotCard[], positions: Record<string, CardPosition>) => void;
  setPosition: (id: string, pos: CardPosition) => void;
  setDragging: (id: string | null) => void;
  setHovered: (id: string | null) => void;
  pushAnalysis: (a: Analysis) => void;
  pushAnswer: (a: string) => void;
  pushHistory: (t: ChatTurn) => void;
  setObsIndex: (i: number) => void;
  setActiveCard: (id: string | null) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  bumpReadCount: () => void;
  setInspected: (id: string | null) => void;
}

export const usePlot = create<PlotState>((set) => ({
  phase: "landing",
  problem: "",
  cards: [],
  positions: {},
  draggingId: null,
  hoveredId: null,
  analyses: [],
  answers: [],
  history: [],
  obsIndex: 0,
  activeCardId: null,
  toast: null,
  readCount: 0,
  inspectedId: null,

  setPhase: (phase) => set({ phase }),
  setProblem: (problem) => set({ problem }),
  setCards: (cards, positions) => set({ cards, positions }),
  setPosition: (id, pos) =>
    set((s) => ({ positions: { ...s.positions, [id]: pos } })),
  setDragging: (draggingId) => set({ draggingId }),
  setHovered: (hoveredId) => set({ hoveredId }),
  pushAnalysis: (a) => set((s) => ({ analyses: [...s.analyses, a] })),
  pushAnswer: (a) => set((s) => ({ answers: [...s.answers, a] })),
  pushHistory: (t) => set((s) => ({ history: [...s.history, t] })),
  setObsIndex: (obsIndex) => set({ obsIndex }),
  setActiveCard: (activeCardId) => set({ activeCardId }),
  showToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
  bumpReadCount: () => set((s) => ({ readCount: s.readCount + 1 })),
  setInspected: (inspectedId) => set({ inspectedId }),
}));
