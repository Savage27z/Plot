export type CardType =
  | "stakeholder"
  | "constraint"
  | "dependency"
  | "evidence"
  | "option"
  | "risk";

export interface PlotCard {
  id: string;
  type: CardType;
  title: string;
  body: string;
  userAdded?: boolean;
}

export interface CardPosition {
  x: number;
  z: number;
}

export interface Observation {
  cardId: string;
  text: string;
}

export interface Analysis {
  observations: Observation[];
  verdict: string;
  question: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ClusterSummary {
  clusters: { cardIds: string[] }[];
  isolated: string[];
  nearestCenter: string;
}
