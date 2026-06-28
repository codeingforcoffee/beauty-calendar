export type ColorScheme = "dark" | "light";

export interface ThemePreset {
  /** Stable key used in the API. */
  key: string;
  /** Human label (shown in the playground switcher). */
  name: string;
  /** Primary accent color. */
  accent: string;
  /** Secondary accent used for gradients / glows. */
  accent2: string;
}

/**
 * Built-in sci-fi accent presets. Switching a theme only swaps the two accent
 * colors; the surrounding neutral palette comes from the color scheme.
 */
export const themePresets: ThemePreset[] = [
  { key: "aurora", name: "Aurora", accent: "#22d3ee", accent2: "#6366f1" },
  { key: "neon", name: "Neon", accent: "#a855f7", accent2: "#ec4899" },
  { key: "matrix", name: "Matrix", accent: "#22c55e", accent2: "#14b8a6" },
  { key: "sunset", name: "Sunset", accent: "#fb923c", accent2: "#f43f5e" },
  { key: "ice", name: "Ice", accent: "#38bdf8", accent2: "#818cf8" },
  { key: "gold", name: "Gold", accent: "#eab308", accent2: "#f97316" },
];

export const DEFAULT_THEME = "aurora";

export function findTheme(key: string): ThemePreset {
  return themePresets.find((t) => t.key === key) ?? themePresets[0];
}

/**
 * Resolve the inline CSS variables for an accent.
 * Accepts a preset key OR an arbitrary `{ accent, accent2 }` pair so consumers
 * can drive theme color entirely from their own design system.
 */
export function themeVars(
  theme: string | { accent: string; accent2: string },
): Record<string, string> {
  const { accent, accent2 } = typeof theme === "string" ? findTheme(theme) : theme;
  return {
    "--bc-accent": accent,
    "--bc-accent-2": accent2,
  };
}
