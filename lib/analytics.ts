// Thin event wrapper. Safe no-op until the Novus/Pendo snippet is installed
// in app/layout.tsx — once window.pendo (or window.novus) exists, events flow.
type EventName =
  | "problem_submitted"
  | "card_dragged"
  | "table_read"
  | "memo_exported"
  | "response_sent"
  | "card_added"
  | "table_shared"
  | "shared_table_loaded"
  | "decision_decomposed"
  | "session_completed"
  | "session_reset";

declare global {
  interface Window {
    pendo?: {
      track?: (name: string, props?: Record<string, unknown>) => void;
      trackAgent?: (eventType: string, metadata: object) => void;
    };
    novus?: { track?: (name: string, props?: Record<string, unknown>) => void };
  }
}

let lastDrag = 0;

export function track(name: EventName, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // Debounce the high-frequency drag event.
  if (name === "card_dragged") {
    const now = Date.now();
    if (now - lastDrag < 2000) return;
    lastDrag = now;
  }
  try {
    window.pendo?.track?.(name, props);
    window.novus?.track?.(name, props);
  } catch {
    // analytics must never break the product
  }
}
