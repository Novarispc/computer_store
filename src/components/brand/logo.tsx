import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Drawn stand-ins for the Esquire identity: a chrome hex medallion carrying the
 * "E", a bevelled neon wordmark, and the armoured mascot.
 *
 * These are SVG rather than raster on purpose — they recolour with the active
 * theme, stay sharp at any size, and the mascot's limbs can be animated for the
 * fly-in intro. When the real artwork is dropped into public/brand/ the
 * components that take a `src` prop switch to it automatically
 * (see lib/brand-assets.ts).
 */

/* -------------------------------------------------------------- Emblem */

export function Emblem({ className, size = 32 }: { className?: string; size?: number }) {
  const uid = "emb";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Esquire"
    >
      <defs>
        <linearGradient id={`${uid}-chrome`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* hex medallion ring */}
      <path
        d="M32 3l21 12v34L32 61 11 49V15z"
        fill="none"
        stroke={`url(#${uid}-chrome)`}
        strokeWidth="3"
      />
      {/* inner plate */}
      <path d="M32 11l14.5 8.4v23.2L32 51l-14.5-8.4V19.4z" fill="currentColor" opacity="0.12" />

      {/* the E, cut as three bars with a chamfered spine */}
      <path d="M23 21h20v6H29v3h12v6H29v3h14v6H23z" fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------ Wordmark */

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-lg font-extrabold tracking-[0.16em] text-foreground",
        className
      )}
    >
      ESQUIRE
      <span className="text-primary">.</span>
    </span>
  );
}

/** The full plate-and-neon wordmark, used large on the intro overlay. */
export function WordmarkPlate({ className }: { className?: string }) {
  return (
    <div className={cn("chamfer-frame chamfer inline-block", className)}>
      <div className="chamfer bg-card px-8 py-4">
        <span
          className="font-display text-4xl font-extrabold tracking-[0.2em] text-primary sm:text-6xl"
          style={{ textShadow: "0 0 24px var(--glow), 0 0 48px var(--glow)" }}
        >
          ESQUIRE
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Mascot */

/**
 * Armoured techno-hero, arms crossed, chest emblem lit. Deliberately visored
 * rather than face-rendered: a stylised helmet reads as premium at any size,
 * where a drawn human face would not.
 */
export function Mascot({ className, size = 220 }: { className?: string; size?: number }) {
  const uid = "msc";
  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 200 250"
      className={className}
      role="img"
      aria-label="Esquire mascot"
    >
      <defs>
        <linearGradient id={`${uid}-armor`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ff4453" />
          <stop offset="0.55" stopColor="#d5001f" />
          <stop offset="1" stopColor="#8d0014" />
        </linearGradient>
        <linearGradient id={`${uid}-under`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2f36" />
          <stop offset="1" stopColor="#0d1014" />
        </linearGradient>
        <radialGradient id={`${uid}-core`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#ff5a68" />
          <stop offset="1" stopColor="#ff2b3d" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* cape / backplate */}
      <path d="M100 42l58 40-16 96H58L42 82z" fill={`url(#${uid}-under)`} opacity="0.55" />

      {/* shoulders */}
      <path d="M46 96c6-20 22-32 54-32s48 12 54 32l-8 28-30-12H84l-30 12z" fill={`url(#${uid}-armor)`} />
      <path d="M46 96c6-20 22-32 54-32" fill="none" stroke="#ff8b95" strokeWidth="2" opacity="0.8" />

      {/* torso */}
      <path d="M66 112h68l-8 74H74z" fill={`url(#${uid}-under)`} />
      <path d="M70 112h60l-6 40H76z" fill={`url(#${uid}-armor)`} />

      {/* chest core */}
      <circle cx="100" cy="130" r="20" fill="#12161c" stroke="#4b535e" strokeWidth="2" />
      <circle cx="100" cy="130" r="17" fill={`url(#${uid}-core)`} filter={`url(#${uid}-glow)`} />
      <path d="M92 122h16v4h-11v3h9v4h-9v3h11v4H92z" fill="#ffffff" />

      {/* crossed forearms */}
      <path
        d="M52 138l70 26-6 18-70-26z"
        fill={`url(#${uid}-armor)`}
        stroke="#5b0010"
        strokeWidth="1.5"
      />
      <path
        d="M148 138l-70 26 6 18 70-26z"
        fill={`url(#${uid}-armor)`}
        stroke="#5b0010"
        strokeWidth="1.5"
      />
      {/* gauntlets */}
      <path d="M44 134l16 6-6 18-16-6z" fill="#14181e" />
      <path d="M156 134l-16 6 6 18 16-6z" fill="#14181e" />
      <path d="M56 150l64 24" stroke="#ff2b3d" strokeWidth="1.6" opacity="0.75" />
      <path d="M144 150l-64 24" stroke="#7cd8ff" strokeWidth="1.6" opacity="0.6" />

      {/* neck */}
      <path d="M90 56h20v18H90z" fill="#1a1e24" />

      {/* helmet */}
      <path d="M100 8c18 0 28 12 28 28 0 14-10 26-28 26S72 50 72 36C72 20 82 8 100 8z" fill={`url(#${uid}-armor)`} />
      <path d="M100 8c18 0 28 12 28 28H72C72 20 82 8 100 8z" fill="#ffffff" opacity="0.08" />
      {/* visor */}
      <path d="M78 34h44v10a22 22 0 0 1-44 0z" fill="#0a0d11" />
      <path
        d="M84 38h12v5H84zM104 38h12v5h-12z"
        fill="#ff2b3d"
        filter={`url(#${uid}-glow)`}
      />
      {/* helmet crest */}
      <path d="M96 8h8l4 14h-16z" fill="#c8cdd6" opacity="0.85" />
    </svg>
  );
}

/* ------------------------------------------------------------- Lockup */

export function LogoLockup({
  href = "/",
  className,
  src,
}: {
  href?: string;
  className?: string;
  /** Real artwork, when it exists. Falls back to the drawn emblem. */
  src?: string | null;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5", className)}
      aria-label="Esquire Computers — home"
      id="brand-lockup"
    >
      {src ? (
        // The uploaded logo-full art already bakes in the mascot + wordmark
        // lockup, so we don't also render the drawn <Wordmark/> beside it.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Esquire Computers" className="h-14 w-auto sm:h-16" />
      ) : (
        <>
          <Emblem className="text-primary" size={26} />
          <Wordmark />
        </>
      )}
    </Link>
  );
}
