import Link from "next/link";
import { cn } from "@/lib/utils";
import { PRICE_DISCLAIMER } from "@/lib/constants";
import { formatMinor } from "@/lib/money";

/* ---------------------------------------------------------------- Surfaces */

/**
 * The house surface: a chamfered panel inside a 1px chrome gradient edge.
 * Both layers are clipped, so the edge follows the cut corner. See globals.css.
 */
export function Panel({
  children,
  className,
  glow = false,
  glass = false,
  as: As = "div",
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  glass?: boolean;
  as?: "div" | "article" | "section" | "li";
}) {
  return (
    <div className={cn("chamfer-frame chamfer", glow && "glow-edge")}>
      <As className={cn("chamfer h-full", glass ? "glass" : "bg-card", className)}>{children}</As>
    </div>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-mono text-[0.68rem] uppercase tracking-[0.32em] text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        {subtitle ? <p className="mt-3 text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ----------------------------------------------------------------- Buttons */

type ButtonVariant = "primary" | "outline" | "ghost";

const BUTTON_BASE =
  "chamfer-sm inline-flex items-center justify-center gap-2 px-5 py-2.5 font-display text-sm font-semibold tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-50";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:brightness-110 [filter:drop-shadow(0_0_0_transparent)] hover:[filter:drop-shadow(0_0_16px_var(--glow))]",
  outline: "bg-transparent text-foreground ring-1 ring-inset ring-border hover:ring-primary",
  ghost: "bg-transparent text-muted-foreground hover:text-foreground",
};

export function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type={type}
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  href: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], className)}>
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------- Bits */

export function Chip({
  children,
  className,
  tone = "muted",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "muted" | "accent";
}) {
  return (
    <span
      className={cn(
        "chamfer-sm inline-flex items-center px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider",
        tone === "accent"
          ? "bg-primary/12 text-primary"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Prices are seeded from Esquire's own price lists, which themselves say the
 * figures must be checked before ordering. Never render a price without saying so.
 */
export function Price({
  minor,
  size = "md",
  showNote = true,
}: {
  minor: number;
  size?: "sm" | "md" | "lg";
  showNote?: boolean;
}) {
  const sizes = { sm: "text-base", md: "text-xl", lg: "text-3xl" };
  return (
    <div>
      <p className={cn("font-mono font-bold tracking-tight text-foreground", sizes[size])}>
        {formatMinor(minor)}
      </p>
      {showNote ? (
        <p className="mt-0.5 text-[0.66rem] text-muted-foreground">{PRICE_DISCLAIMER}</p>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- Feedback */

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <Panel className="px-8 py-16 text-center">
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Panel>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("chamfer-sm animate-pulse bg-muted", className)} />;
}
