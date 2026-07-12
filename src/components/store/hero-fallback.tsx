import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { Hero3D } from "@/components/three/hero-3d";

/**
 * The home hero. The visual slot renders a real 3D scene (rounded-box
 * workstation + floating hardware, see components/three) on desktop without
 * reduced motion, and the CSS "floating chamfered cards" analogue everywhere
 * else — including as the SSR-sent markup, so there is no layout jump on
 * hydration. `Hero3D` decides which one actually mounts; this component
 * always renders `FloatingRig` as that decision's fallback.
 */
export function HeroFallback({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="circuit-field absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 78% 20%, var(--glow), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">
              Est. 1998 · Thrissur, Kerala
            </p>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">{subtitle}</p>

            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/products">
                Shop products <ArrowRight size={16} aria-hidden />
              </ButtonLink>
              <ButtonLink href="/categories" variant="outline">
                Explore categories
              </ButtonLink>
              <ButtonLink href="/contact" variant="ghost">
                Contact store
              </ButtonLink>
            </div>
          </div>

          <div className="relative hidden min-h-[420px] lg:block" aria-hidden>
            <Hero3D fallback={<FloatingRig />} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Chamfered "floating hardware" cards — the CSS analogue of the drei Float scene. */
function FloatingRig() {
  return (
    <div className="relative h-[420px]">
      <RigCard className="left-4 top-6 w-48" label="RTX 3050 6GB" delay="0s" />
      <RigCard className="right-2 top-24 w-40" label="512GB NVMe" delay="0.6s" />
      <RigCard className="bottom-16 left-16 w-52" label="144Hz IPS" delay="1.1s" />
      <RigCard className="bottom-0 right-8 w-44" label="ISO 9001:2015" delay="1.7s" />
    </div>
  );
}

function RigCard({ className, label, delay }: { className: string; label: string; delay: string }) {
  return (
    <div
      className={`chamfer-frame chamfer glow-edge absolute animate-[float_6s_ease-in-out_infinite] motion-reduce:animate-none ${className}`}
      style={{ animationDelay: delay }}
    >
      <div className="chamfer glass px-4 py-3.5">
        <p className="font-mono text-[0.68rem] uppercase tracking-wider text-primary">{label}</p>
      </div>
    </div>
  );
}

export function HomeCta() {
  return (
    <div className="chamfer-frame chamfer">
      <div className="chamfer circuit-field bg-card px-8 py-16 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Need a quote?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Build a list, send it over, and we will price it for you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/products">Browse products</ButtonLink>
          <Link href="/contact" className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            Or talk to us
          </Link>
        </div>
      </div>
    </div>
  );
}
