/**
 * Six presets. Each carries a FULL palette for light and dark, so the theme
 * and the light/dark toggle stay orthogonal — twelve combinations, one
 * server-injected <style> block.
 *
 * `bevel` and `glow` are the two tokens that let a preset restyle the geometry
 * and the surface treatment rather than just the accent colour:
 *   Minimal Professional flattens the chamfer to 0px and kills the glow.
 *   Gaming RGB pushes both.
 */

/**
 * Declared here rather than in src/lib/theme.ts so the seed script (run through
 * tsx, without Next's path aliases) can import it without dragging in Prisma.
 * src/lib/theme.ts re-exports it.
 */
export type ThemePalette = {
  background: string;
  surface: string;
  card: string;
  cardForeground: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  hairline: string;
  input: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
  glow: string;
  /** e.g. "12px". "0px" flattens the chamfer entirely. */
  bevel: string;
  success: string;
  danger: string;
  warning: string;
};

export type ThemeSeed = {
  slug: string;
  name: string;
  description: string;
  active?: boolean;
  light: ThemePalette;
  dark: ThemePalette;
};

export const themes: ThemeSeed[] = [
  {
    slug: "premium-dark-tech",
    name: "Premium Dark Tech",
    description: "Matte graphite and neon red. The house style.",
    active: true,
    light: {
      background: "#f7f8fa",
      surface: "#ffffff",
      card: "#ffffff",
      cardForeground: "#14171c",
      foreground: "#14171c",
      muted: "#eef0f4",
      mutedForeground: "#5c6472",
      border: "#dfe3ea",
      hairline: "rgba(20, 23, 28, 0.1)",
      input: "#dfe3ea",
      primary: "#e01023",
      primaryForeground: "#ffffff",
      secondary: "#3d4655",
      secondaryForeground: "#ffffff",
      accent: "#e01023",
      accentForeground: "#ffffff",
      ring: "#e01023",
      glow: "rgba(224, 16, 35, 0.35)",
      bevel: "12px",
      success: "#0f9d58",
      danger: "#d93025",
      warning: "#f59e0b",
    },
    dark: {
      background: "#08090b",
      surface: "#0e1014",
      card: "#131720",
      cardForeground: "#e8eaed",
      foreground: "#e8eaed",
      muted: "#191d26",
      mutedForeground: "#8a929e",
      border: "#242a35",
      hairline: "rgba(255, 255, 255, 0.09)",
      input: "#242a35",
      primary: "#ff2b3d",
      primaryForeground: "#ffffff",
      secondary: "#c8cdd6",
      secondaryForeground: "#08090b",
      accent: "#ff2b3d",
      accentForeground: "#ffffff",
      ring: "#ff2b3d",
      glow: "rgba(255, 43, 61, 0.45)",
      bevel: "12px",
      success: "#34d399",
      danger: "#f87171",
      warning: "#fbbf24",
    },
  },

  {
    slug: "clean-light-tech",
    name: "Clean Light Tech",
    description: "Paper-white retail floor. Restrained chamfer, soft glow.",
    light: {
      background: "#ffffff",
      surface: "#fbfcfd",
      card: "#ffffff",
      cardForeground: "#1b1f24",
      foreground: "#1b1f24",
      muted: "#f2f4f7",
      mutedForeground: "#667085",
      border: "#e4e7ec",
      hairline: "rgba(27, 31, 36, 0.08)",
      input: "#e4e7ec",
      primary: "#c8102e",
      primaryForeground: "#ffffff",
      secondary: "#344054",
      secondaryForeground: "#ffffff",
      accent: "#c8102e",
      accentForeground: "#ffffff",
      ring: "#c8102e",
      glow: "rgba(200, 16, 46, 0.18)",
      bevel: "8px",
      success: "#12805c",
      danger: "#b42318",
      warning: "#b54708",
    },
    dark: {
      background: "#14181d",
      surface: "#1a1f26",
      card: "#1f242c",
      cardForeground: "#eceff3",
      foreground: "#eceff3",
      muted: "#252b34",
      mutedForeground: "#98a2b3",
      border: "#333a45",
      hairline: "rgba(255, 255, 255, 0.08)",
      input: "#333a45",
      primary: "#f0435c",
      primaryForeground: "#ffffff",
      secondary: "#cbd5e1",
      secondaryForeground: "#14181d",
      accent: "#f0435c",
      accentForeground: "#ffffff",
      ring: "#f0435c",
      glow: "rgba(240, 67, 92, 0.25)",
      bevel: "8px",
      success: "#32d583",
      danger: "#f97066",
      warning: "#fdb022",
    },
  },

  {
    slug: "gaming-rgb",
    name: "Gaming RGB",
    description: "Deep violet, magenta glow, aggressive chamfer.",
    light: {
      background: "#f6f4fb",
      surface: "#ffffff",
      card: "#ffffff",
      cardForeground: "#1d1630",
      foreground: "#1d1630",
      muted: "#efeaf9",
      mutedForeground: "#6b5f8a",
      border: "#ddd4f0",
      hairline: "rgba(29, 22, 48, 0.1)",
      input: "#ddd4f0",
      primary: "#c026d3",
      primaryForeground: "#ffffff",
      secondary: "#6d28d9",
      secondaryForeground: "#ffffff",
      accent: "#0891b2",
      accentForeground: "#ffffff",
      ring: "#c026d3",
      glow: "rgba(192, 38, 211, 0.4)",
      bevel: "18px",
      success: "#059669",
      danger: "#dc2626",
      warning: "#d97706",
    },
    dark: {
      background: "#0a0614",
      surface: "#120a22",
      card: "#180e2e",
      cardForeground: "#ede9fe",
      foreground: "#ede9fe",
      muted: "#20143a",
      mutedForeground: "#a78bfa",
      border: "#33215c",
      hairline: "rgba(217, 70, 239, 0.22)",
      input: "#33215c",
      primary: "#e879f9",
      primaryForeground: "#0a0614",
      secondary: "#8b5cf6",
      secondaryForeground: "#ffffff",
      accent: "#22d3ee",
      accentForeground: "#0a0614",
      ring: "#e879f9",
      glow: "rgba(232, 121, 249, 0.6)",
      bevel: "18px",
      success: "#4ade80",
      danger: "#fb7185",
      warning: "#facc15",
    },
  },

  {
    slug: "corporate-blue",
    name: "Corporate Blue",
    description: "Procurement-friendly navy. Tight bevel, minimal glow.",
    light: {
      background: "#f8fafc",
      surface: "#ffffff",
      card: "#ffffff",
      cardForeground: "#0f172a",
      foreground: "#0f172a",
      muted: "#eef2f6",
      mutedForeground: "#64748b",
      border: "#dbe3ec",
      hairline: "rgba(15, 23, 42, 0.08)",
      input: "#dbe3ec",
      primary: "#1d4ed8",
      primaryForeground: "#ffffff",
      secondary: "#0f172a",
      secondaryForeground: "#ffffff",
      accent: "#0284c7",
      accentForeground: "#ffffff",
      ring: "#1d4ed8",
      glow: "rgba(29, 78, 216, 0.16)",
      bevel: "6px",
      success: "#047857",
      danger: "#b91c1c",
      warning: "#a16207",
    },
    dark: {
      background: "#060b16",
      surface: "#0b1322",
      card: "#111b2e",
      cardForeground: "#e2e8f0",
      foreground: "#e2e8f0",
      muted: "#16223a",
      mutedForeground: "#94a3b8",
      border: "#1f2f4a",
      hairline: "rgba(255, 255, 255, 0.08)",
      input: "#1f2f4a",
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      secondary: "#cbd5e1",
      secondaryForeground: "#060b16",
      accent: "#38bdf8",
      accentForeground: "#060b16",
      ring: "#3b82f6",
      glow: "rgba(59, 130, 246, 0.3)",
      bevel: "6px",
      success: "#34d399",
      danger: "#f87171",
      warning: "#fbbf24",
    },
  },

  {
    slug: "futuristic-neon",
    name: "Futuristic Neon",
    description: "Near-black with cyan and electric lime. Maximum glow.",
    light: {
      background: "#f4fbfb",
      surface: "#ffffff",
      card: "#ffffff",
      cardForeground: "#08201f",
      foreground: "#08201f",
      muted: "#e4f5f4",
      mutedForeground: "#4b6b69",
      border: "#c9e8e6",
      hairline: "rgba(8, 32, 31, 0.1)",
      input: "#c9e8e6",
      primary: "#0d9488",
      primaryForeground: "#ffffff",
      secondary: "#065f5b",
      secondaryForeground: "#ffffff",
      accent: "#65a30d",
      accentForeground: "#ffffff",
      ring: "#0d9488",
      glow: "rgba(13, 148, 136, 0.3)",
      bevel: "16px",
      success: "#15803d",
      danger: "#be123c",
      warning: "#c2410c",
    },
    dark: {
      background: "#03070a",
      surface: "#061118",
      card: "#08181f",
      cardForeground: "#d7fdf6",
      foreground: "#d7fdf6",
      muted: "#0b2029",
      mutedForeground: "#5eead4",
      border: "#0f3841",
      hairline: "rgba(34, 211, 238, 0.24)",
      input: "#0f3841",
      primary: "#22d3ee",
      primaryForeground: "#03070a",
      secondary: "#a3e635",
      secondaryForeground: "#03070a",
      accent: "#a3e635",
      accentForeground: "#03070a",
      ring: "#22d3ee",
      glow: "rgba(34, 211, 238, 0.65)",
      bevel: "16px",
      success: "#4ade80",
      danger: "#fb7185",
      warning: "#fde047",
    },
  },

  {
    slug: "minimal-professional",
    name: "Minimal Professional",
    description: "No chamfer, no glow. Type, spacing and hairlines only.",
    light: {
      background: "#ffffff",
      surface: "#ffffff",
      card: "#ffffff",
      cardForeground: "#18181b",
      foreground: "#18181b",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      border: "#e4e4e7",
      hairline: "rgba(24, 24, 27, 0.1)",
      input: "#e4e4e7",
      primary: "#18181b",
      primaryForeground: "#ffffff",
      secondary: "#52525b",
      secondaryForeground: "#ffffff",
      accent: "#18181b",
      accentForeground: "#ffffff",
      ring: "#18181b",
      glow: "transparent",
      bevel: "0px",
      success: "#166534",
      danger: "#991b1b",
      warning: "#854d0e",
    },
    dark: {
      background: "#0c0c0d",
      surface: "#131314",
      card: "#161618",
      cardForeground: "#fafafa",
      foreground: "#fafafa",
      muted: "#1f1f22",
      mutedForeground: "#a1a1aa",
      border: "#2a2a2e",
      hairline: "rgba(255, 255, 255, 0.1)",
      input: "#2a2a2e",
      primary: "#fafafa",
      primaryForeground: "#0c0c0d",
      secondary: "#a1a1aa",
      secondaryForeground: "#0c0c0d",
      accent: "#fafafa",
      accentForeground: "#0c0c0d",
      ring: "#fafafa",
      glow: "transparent",
      bevel: "0px",
      success: "#4ade80",
      danger: "#f87171",
      warning: "#facc15",
    },
  },
];
