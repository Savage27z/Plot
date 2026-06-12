import { CardPosition, ClusterSummary } from "./types";

// Union-find over cards within a distance threshold on the table plane.
const CLUSTER_DIST = 2.6;

export function computeClusters(
  positions: Record<string, CardPosition>
): ClusterSummary {
  const ids = Object.keys(positions);
  const parent: Record<string, string> = {};
  ids.forEach((id) => (parent[id] = id));

  const find = (a: string): string =>
    parent[a] === a ? a : (parent[a] = find(parent[a]));
  const union = (a: string, b: string) => {
    parent[find(a)] = find(b);
  };

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const p = positions[ids[i]];
      const q = positions[ids[j]];
      if (Math.hypot(p.x - q.x, p.z - q.z) <= CLUSTER_DIST) union(ids[i], ids[j]);
    }
  }

  const groups: Record<string, string[]> = {};
  ids.forEach((id) => {
    const root = find(id);
    (groups[root] ||= []).push(id);
  });

  const clusters = Object.values(groups)
    .filter((g) => g.length > 1)
    .map((cardIds) => ({ cardIds }));
  const isolated = Object.values(groups)
    .filter((g) => g.length === 1)
    .map((g) => g[0]);

  let nearestCenter = ids[0] ?? "";
  let best = Infinity;
  ids.forEach((id) => {
    const p = positions[id];
    const d = Math.hypot(p.x, p.z);
    if (d < best) {
      best = d;
      nearestCenter = id;
    }
  });

  return { clusters, isolated, nearestCenter };
}
