// Mutable per-frame card world positions, shared between the card meshes
// (writers) and the beam/spotlight (readers) without triggering React renders.
export const livePositions = new Map<string, [number, number, number]>();

export const ORB_POS: [number, number, number] = [-4.2, 1.5, -5.9];
