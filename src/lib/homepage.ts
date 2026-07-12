import { prisma } from "@/lib/prisma";
import { safeJson } from "@/lib/utils";
import { HIGHLIGHTS_SECTION_TYPE } from "@/lib/constants";

export type HighlightsData = { slugs: string[] };

export type HighlightsSection = {
  id: string;
  title: string;
  subtitle: string | null;
  active: boolean;
  slugs: string[];
};

/**
 * Read-only accessor used by the storefront. Lives outside server/admin so the
 * public homepage does not import a module guarded by requireAdmin().
 */
export async function getHighlightsSection(): Promise<HighlightsSection | null> {
  try {
    const row = await prisma.homepageSection.findFirst({
      where: { type: HIGHLIGHTS_SECTION_TYPE },
    });
    if (!row) return null;
    const data = safeJson<HighlightsData>(row.dataJson, { slugs: [] });
    return {
      id: row.id,
      title: row.title ?? "Highlights",
      subtitle: row.subtitle,
      active: row.active,
      slugs: Array.isArray(data.slugs) ? data.slugs : [],
    };
  } catch {
    return null;
  }
}
