import { prisma } from "@/lib/prisma";
import { safeJson } from "@/lib/utils";
import type { ThemePalette } from "@data/themes";

/**
 * A theme replaces the ENTIRE palette, unlike an accent overlay. Every key of
 * ThemePalette maps 1:1 to a custom property already declared in globals.css.
 * Nothing new is introduced at runtime — that is what keeps Tailwind v4's
 * `@theme inline` statically analyzable.
 */
export type { ThemePalette };

export type ActiveTheme = {
  slug: string;
  name: string;
  light: Partial<ThemePalette>;
  dark: Partial<ThemePalette>;
};

/** camelCase palette key -> kebab-case CSS custom property. */
const CSS_VAR: Record<keyof ThemePalette, string> = {
  background: "--background",
  surface: "--surface",
  card: "--card",
  cardForeground: "--card-foreground",
  foreground: "--foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  border: "--border",
  hairline: "--hairline",
  input: "--input",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  ring: "--ring",
  glow: "--glow",
  bevel: "--bevel",
  success: "--success",
  danger: "--danger",
  warning: "--warning",
};

const cache = { value: undefined as ActiveTheme | null | undefined, at: 0 };
const TTL = 15_000;

export async function getActiveTheme(): Promise<ActiveTheme | null> {
  const now = Date.now();
  if (cache.value !== undefined && now - cache.at < TTL) return cache.value;

  let resolved: ActiveTheme | null = null;
  try {
    const theme = await prisma.theme.findFirst({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
    });
    if (theme) {
      resolved = {
        slug: theme.slug,
        name: theme.name,
        light: safeJson<Partial<ThemePalette>>(theme.lightJson, {}),
        dark: safeJson<Partial<ThemePalette>>(theme.darkJson, {}),
      };
    }
  } catch {
    // Pre-seed / migration window: fall back to the globals.css defaults.
    resolved = null;
  }

  cache.value = resolved;
  cache.at = now;
  return resolved;
}

export function clearThemeCache() {
  cache.value = undefined;
  cache.at = 0;
}

/** Values come from admin input, so refuse anything that could break out of a CSS declaration. */
function sanitize(value: string): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v || v.length > 80) return null;
  if (/[;{}<>@]/.test(v)) return null;
  return v;
}

function paletteBlock(selector: string, palette: Partial<ThemePalette>): string {
  const decls: string[] = [];
  for (const [key, raw] of Object.entries(palette)) {
    const cssVar = CSS_VAR[key as keyof ThemePalette];
    if (!cssVar || typeof raw !== "string") continue;
    const value = sanitize(raw);
    if (!value) continue;
    decls.push(`${cssVar}:${value}`);
  }
  if (!decls.length) return "";
  return `${selector}{${decls.join(";")}}`;
}

/**
 * Emits both scopes in one block so theme and dark/light mode stay orthogonal:
 * the theme's light palette lands on :root, its dark palette on .dark.
 */
export function themeCss(theme: ActiveTheme | null): string {
  if (!theme) return "";
  return [paletteBlock(":root", theme.light), paletteBlock("html.dark", theme.dark)]
    .filter(Boolean)
    .join("");
}
