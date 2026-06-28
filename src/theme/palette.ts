/**
 * A curated neon palette used to auto-color events that don't specify their own
 * color. Colors are assigned deterministically from a seed (creator/id) so the
 * same person/event always keeps the same hue across re-renders.
 */
export const eventPalette: string[] = [
  "#22d3ee", // cyan
  "#a855f7", // violet
  "#34d399", // emerald
  "#f472b6", // pink
  "#facc15", // amber
  "#60a5fa", // blue
  "#fb7185", // rose
  "#4ade80", // green
  "#c084fc", // purple
  "#2dd4bf", // teal
  "#f59e0b", // orange
  "#818cf8", // indigo
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Deterministically pick a palette color for a seed string. */
export function colorFor(seed: string): string {
  if (!seed) return eventPalette[0];
  return eventPalette[hash(seed) % eventPalette.length];
}
