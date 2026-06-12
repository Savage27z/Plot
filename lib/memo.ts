import { Analysis, PlotCard } from "./types";

const TYPE_ORDER = [
  "option",
  "stakeholder",
  "constraint",
  "dependency",
  "evidence",
  "risk",
] as const;

export function buildMemo(
  problem: string,
  cards: PlotCard[],
  analyses: Analysis[],
  answers: string[]
): string {
  const lines: string[] = [];
  lines.push("# Decision Memo — Plot");
  lines.push("");
  lines.push(`*Generated ${new Date().toUTCString()}*`);
  lines.push("");
  lines.push("## The decision");
  lines.push("");
  lines.push(problem.trim());
  lines.push("");
  lines.push("## The table");

  for (const type of TYPE_ORDER) {
    const group = cards.filter((c) => c.type === type);
    if (!group.length) continue;
    lines.push("");
    lines.push(`### ${type.charAt(0).toUpperCase() + type.slice(1)}s`);
    lines.push("");
    for (const c of group) {
      lines.push(`- **${c.title}** — ${c.body}`);
    }
  }

  analyses.forEach((a, i) => {
    lines.push("");
    lines.push(
      analyses.length > 1 ? `## Reading ${i + 1}` : "## The strategist's reading"
    );
    lines.push("");
    for (const o of a.observations) {
      const card = cards.find((c) => c.id === o.cardId);
      lines.push(`- *${card ? card.title : o.cardId}* — ${o.text}`);
    }
    lines.push("");
    lines.push(`**Verdict.** ${a.verdict}`);
    lines.push("");
    lines.push(`**Open question.** ${a.question}`);
    if (answers[i]) {
      lines.push("");
      lines.push(`**Answer.** ${answers[i]}`);
    }
  });

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(
    "*Plot — see your decision. Built for World Product Day 2026 · #EveryoneShipsNow*"
  );
  lines.push("");
  return lines.join("\n");
}
