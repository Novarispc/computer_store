import type { Metadata } from "next";
import { getStore } from "@/lib/settings";
import { ButtonLink, Eyebrow, Panel, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Esquire Computers, established 7 October 1998 in Thrissur. ISO 9001:2015 certified, 20+ engineers, service across Kerala.",
};

export default async function AboutPage() {
  const store = await getStore();
  const founded = new Date(store.foundedOn);
  const years = new Date().getFullYear() - founded.getFullYear();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <Eyebrow>Since 1998</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-6xl">
          {store.tagline}
        </h1>
      </header>

      <div className="mt-16 grid gap-16 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {store.about.map((para) => (
            <p key={para.slice(0, 24)} className="text-lg leading-relaxed text-muted-foreground">
              {para}
            </p>
          ))}

          <blockquote className="chamfer-frame chamfer mt-10">
            <div className="chamfer bg-card p-8">
              <p className="font-display text-xl font-semibold leading-snug">
                &ldquo;{store.vision}&rdquo;
              </p>
              <footer className="mt-4 text-sm text-muted-foreground">
                {store.ceo} — Chief Executive
              </footer>
            </div>
          </blockquote>
        </div>

        <aside className="space-y-4">
          <Panel className="p-6">
            <Eyebrow className="mb-5">At a glance</Eyebrow>
            <dl className="space-y-4">
              {[
                ["Established", founded.toLocaleDateString("en-IN", { dateStyle: "long" })],
                ["Years trading", `${years}`],
                ["Certification", store.certification],
                ["Engineers", `${store.engineers}+`],
                ["Coverage", store.coverage],
                ["Hours", store.hours],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border pb-3 last:border-0">
                  <dt className="text-sm text-muted-foreground">{k}</dt>
                  <dd className="text-right text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </aside>
      </div>

      <section className="mt-28">
        <SectionHeading
          eyebrow="What we hold to"
          title="Built service-first, not sales-first"
          subtitle="The founding principle has not changed: lasting customer satisfaction, not transactions."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {store.values.map((v) => (
            <Panel key={v.title} glow className="p-7">
              <h3 className="font-display text-lg font-semibold">{v.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <div className="chamfer-frame chamfer">
          <div className="chamfer circuit-field bg-card px-8 py-16 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Need a system, or a whole office?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Send us a list. We will price it, install it, and support it — one contact from
              purchase order to preventive maintenance.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/products">Browse products</ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                Talk to us
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
