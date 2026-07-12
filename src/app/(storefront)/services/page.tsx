import type { Metadata } from "next";
import * as Icons from "lucide-react";
import { getServices, getStore, getMedia } from "@/lib/settings";
import { ButtonLink, Eyebrow, Panel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Onsite support, after-sales care, free user training, standby systems, preventive maintenance and AMC-backed extended support.",
};

function ServiceIcon({ name }: { name: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Wrench;
  return <Icon size={24} className="text-primary" aria-hidden />;
}

export default async function ServicesPage() {
  const [services, store, media] = await Promise.all([getServices(), getStore(), getMedia()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div className="max-w-3xl">
          <Eyebrow>Service</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            The part that happens after the invoice
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Esquire was set up as a service organisation that happens to sell hardware, rather
            than the other way round. {store.engineers}+ engineers, {store.hours.toLowerCase()}.
          </p>
        </div>

        {media.servicesHero ? (
          <div className="chamfer-frame chamfer glow-edge">
            {/*
              object-contain, not object-cover: the uploaded banner can be any
              aspect ratio (square, portrait, ultra-wide). Forcing a fixed box
              with object-cover crops or over-zooms whatever doesn't already
              match that shape. A capped height + contain always shows the
              whole image, letterboxed on mismatched ratios instead of cut.
            */}
            <div className="chamfer flex justify-center bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media.servicesHero}
                alt="Esquire technical service"
                className="max-h-[360px] w-auto object-contain"
              />
            </div>
          </div>
        ) : null}
      </header>

      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Panel key={s.slug} glow className="specular relative h-full overflow-hidden p-7">
            <ServiceIcon name={s.icon} />
            <h2 className="mt-5 font-display text-lg font-semibold">{s.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </Panel>
        ))}
      </div>

      <section className="mt-24 grid gap-5 md:grid-cols-3">
        {store.serviceLines.map((line) => (
          <Panel key={line.label} className="p-7">
            <Eyebrow className="mb-4">{line.label}</Eyebrow>
            <ul className="space-y-2">
              {line.numbers.map((n) => (
                <li key={n}>
                  <a
                    href={`tel:${n.replace(/[\s-]/g, "")}`}
                    className="font-mono text-sm hover:text-primary"
                  >
                    {n}
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </section>

      <section className="mt-24">
        <div className="chamfer-frame chamfer">
          <div className="chamfer bg-card px-8 py-14 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Under warranty, or under an AMC?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Quarterly preventive maintenance is free for the whole of both. Book a visit and we
              will schedule an engineer.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/contact">Book a service visit</ButtonLink>
              <ButtonLink href="/products" variant="outline">
                Browse hardware
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
