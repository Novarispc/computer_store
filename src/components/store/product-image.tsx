import { cn } from "@/lib/utils";

/**
 * Esquire's price lists ship no product photography, so a product without a
 * ProductImage row gets a drawn one.
 *
 * This is an inline <svg>, not an <img src="data:...">, on purpose: an <img>
 * cannot read CSS custom properties, so a data-URI placeholder has to hardcode
 * its colours and then clashes with every theme except the one it was tuned
 * for. Inline SVG inherits `var(--card)`, `var(--primary)` and friends, so the
 * illustration re-tints with the active theme and with dark/light mode for free.
 *
 * Uploaded images take precedence and render as a normal <img>.
 */

type ShapeKey = "laptop" | "monitor" | "desktop" | "printer" | "cctv" | "ups" | "chair" | "chip";

const CATEGORY_SHAPE: Record<string, ShapeKey> = {
  laptops: "laptop",
  "gaming-laptops": "laptop",
  "refurbished-laptops": "laptop",
  "laptop-accessories": "chip",
  "branded-desktops": "desktop",
  "all-in-one-desktops": "monitor",
  "custom-desktops": "desktop",
  "desktop-accessories": "chip",
  "pc-security": "chip",
  servers: "desktop",
  monitors: "monitor",
  "designed-monitors": "monitor",
  printers: "printer",
  "pos-machines": "printer",
  "power-backup": "ups",
  networking: "chip",
  cctv: "cctv",
  "security-products": "cctv",
  "computer-furniture": "chair",
  "air-conditioners": "ups",
  "solar-panels": "chip",
};

/** Stable per-slug hash so a product's illustration never changes between renders. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Shapes are drawn filled and shaded on a 320x240 canvas.
 *  body   -> the chassis fill (a metal gradient)
 *  screen -> the emissive area (brand accent)
 *  edge   -> hairline detail
 */
function Shape({ kind, ids }: { kind: ShapeKey; ids: { body: string; screen: string } }) {
  const body = `url(#${ids.body})`;
  const screen = `url(#${ids.screen})`;
  const edge = "color-mix(in srgb, var(--foreground) 30%, transparent)";

  switch (kind) {
    case "laptop":
      return (
        <g>
          {/* lid */}
          <path d="M84 62h152a6 6 0 0 1 6 6v88H78V68a6 6 0 0 1 6-6z" fill={body} stroke={edge} />
          <rect x="92" y="70" width="136" height="78" rx="2" fill={screen} />
          {/* base */}
          <path d="M60 156h200l14 20a6 6 0 0 1-5 9H51a6 6 0 0 1-5-9z" fill={body} stroke={edge} />
          <rect x="132" y="168" width="56" height="4" rx="2" fill={edge} />
        </g>
      );
    case "monitor":
      return (
        <g>
          <rect x="54" y="48" width="212" height="130" rx="7" fill={body} stroke={edge} />
          <rect x="64" y="58" width="192" height="104" rx="3" fill={screen} />
          <path d="M146 178h28v22h-28z" fill={body} stroke={edge} />
          <rect x="110" y="198" width="100" height="9" rx="4" fill={body} stroke={edge} />
        </g>
      );
    case "desktop":
      return (
        <g>
          <rect x="106" y="34" width="108" height="176" rx="8" fill={body} stroke={edge} />
          <rect x="118" y="48" width="84" height="52" rx="3" fill={screen} opacity="0.85" />
          <rect x="200" y="46" width="4" height="150" rx="2" fill={screen} />
          <circle cx="130" cy="192" r="5" fill={edge} />
          <rect x="118" y="112" width="70" height="4" rx="2" fill={edge} />
          <rect x="118" y="126" width="70" height="4" rx="2" fill={edge} />
          <rect x="118" y="140" width="44" height="4" rx="2" fill={edge} />
        </g>
      );
    case "printer":
      return (
        <g>
          <rect x="96" y="44" width="128" height="34" rx="4" fill={body} stroke={edge} />
          <rect x="66" y="78" width="188" height="76" rx="7" fill={body} stroke={edge} />
          <rect x="150" y="94" width="88" height="26" rx="3" fill={screen} opacity="0.8" />
          <rect x="104" y="154" width="112" height="42" rx="4" fill={body} stroke={edge} />
          <rect x="118" y="166" width="84" height="4" rx="2" fill={edge} />
        </g>
      );
    case "cctv":
      return (
        <g>
          <path d="M78 96l128-32 16 50-128 32z" fill={body} stroke={edge} />
          <circle cx="209" cy="88" r="15" fill={screen} />
          <path d="M110 146l10 34" stroke={edge} strokeWidth="6" strokeLinecap="round" />
          <rect x="86" y="178" width="60" height="9" rx="4" fill={body} stroke={edge} />
          <rect x="92" y="76" width="26" height="10" rx="4" fill={edge} />
        </g>
      );
    case "ups":
      return (
        <g>
          <rect x="94" y="42" width="132" height="164" rx="8" fill={body} stroke={edge} />
          <rect x="110" y="58" width="100" height="34" rx="3" fill={screen} opacity="0.8" />
          <path d="M166 108l-28 44h22l-8 40 34-50h-22z" fill={screen} />
          <circle cx="120" cy="188" r="5" fill={edge} />
          <circle cx="138" cy="188" r="5" fill={edge} />
        </g>
      );
    case "chair":
      return (
        <g>
          <rect x="112" y="36" width="96" height="72" rx="12" fill={body} stroke={edge} />
          <rect x="104" y="116" width="112" height="24" rx="8" fill={body} stroke={edge} />
          <rect x="156" y="140" width="8" height="36" rx="4" fill={edge} />
          <path d="M118 200l42-24 42 24" stroke={edge} strokeWidth="7" fill="none" strokeLinecap="round" />
          <rect x="128" y="52" width="64" height="4" rx="2" fill={screen} opacity="0.7" />
        </g>
      );
    default:
      return (
        <g>
          <rect x="106" y="76" width="108" height="92" rx="6" fill={body} stroke={edge} />
          <rect x="124" y="94" width="72" height="56" rx="3" fill={screen} opacity="0.85" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="86" y={94 + i * 22} width="20" height="5" rx="2" fill={edge} />
              <rect x="214" y={94 + i * 22} width="20" height="5" rx="2" fill={edge} />
            </g>
          ))}
        </g>
      );
  }
}

export function ProductIllustration({
  slug,
  categorySlug,
  className,
}: {
  slug: string;
  categorySlug?: string | null;
  className?: string;
}) {
  const kind: ShapeKey = (categorySlug && CATEGORY_SHAPE[categorySlug]) || "chip";

  // Unique gradient ids — several illustrations share a page.
  const uid = `p${hash(slug).toString(36)}`;
  const ids = { body: `${uid}b`, screen: `${uid}s`, glow: `${uid}g` };

  // Slight, deterministic tilt so a grid of placeholders is not visually identical.
  const tilt = (hash(slug) % 5) - 2;

  return (
    <svg
      viewBox="0 0 320 240"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Product illustration"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Chassis is mixed from --foreground rather than --muted/--card: those
            two are near-white in the light themes and vanish against --surface,
            leaving only the screen visible. Mixing against the surface keeps the
            body legible in every one of the six presets, light and dark. */}
        <linearGradient id={ids.body} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--foreground) 20%, var(--surface))" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--foreground) 8%, var(--surface))" />
        </linearGradient>
        <linearGradient id={ids.screen} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.7" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0.22" />
        </linearGradient>
        <radialGradient id={ids.glow} cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.14" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="320" height="240" fill="var(--surface)" />
      <rect width="320" height="240" fill={`url(#${ids.glow})`} />

      <g transform={`rotate(${tilt} 160 120)`} strokeWidth="1.5">
        <Shape kind={kind} ids={ids} />
      </g>

      {/* contact shadow */}
      <ellipse cx="160" cy="214" rx="86" ry="7" fill="var(--foreground)" opacity="0.07" />
    </svg>
  );
}

type ImageInput = {
  slug: string;
  name: string;
  images?: { url: string; alt?: string | null }[];
  category?: { slug: string } | null;
};

/** Renders an uploaded photo when one exists, otherwise the drawn illustration. */
export function ProductImage({
  product,
  className,
}: {
  product: ImageInput;
  className?: string;
}) {
  const uploaded = product.images?.[0];

  if (uploaded?.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={uploaded.url}
        alt={uploaded.alt ?? product.name}
        loading="lazy"
        className={cn("h-full w-full object-contain", className)}
      />
    );
  }

  return (
    <ProductIllustration
      slug={product.slug}
      categorySlug={product.category?.slug}
      className={className}
    />
  );
}

export function hasUploadedImage(product: ImageInput): boolean {
  return Boolean(product.images?.[0]?.url);
}
