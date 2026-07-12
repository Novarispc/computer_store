import type { Metadata } from "next";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { getStore } from "@/lib/settings";
import { ContactForm } from "@/components/store/contact-form";
import { Eyebrow, Panel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach Esquire Computers in Thrissur — sales, service, or a quote request.",
};

export default async function ContactPage() {
  const store = await getStore();
  const waLink = `https://wa.me/${store.primary.whatsapp.replace(/[^\d]/g, "")}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <Eyebrow>Get in touch</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Talk to a real engineer, not a queue
        </h1>
        <p className="mt-4 text-muted-foreground">
          For a quote, add products to your quote list and check out — it comes straight here.
          For anything else, use the form or call us directly.
        </p>
      </header>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <Panel className="p-6">
            <a href={`tel:${store.primary.phone.replace(/\s/g, "")}`} className="flex items-start gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium">{store.primary.phone}</p>
                <p className="text-xs text-muted-foreground">Sales &amp; general enquiries</p>
              </div>
            </a>
          </Panel>

          <Panel className="p-6">
            <a href={waLink} target="_blank" rel="noreferrer" className="flex items-start gap-3">
              <MessageCircle size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Fastest for a quick question</p>
              </div>
            </a>
          </Panel>

          <Panel className="p-6">
            <a href={`mailto:${store.primary.email}`} className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium">{store.primary.email}</p>
                <p className="text-xs text-muted-foreground">Written enquiries and quotes</p>
              </div>
            </a>
          </Panel>

          <Panel className="p-6">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <address className="text-sm not-italic">
                {store.address.line1}, {store.address.line2}
                <br />
                {store.address.city}, {store.address.state}
                <br />
                {store.address.country}
              </address>
            </div>
          </Panel>

          <div className="pt-2">
            <Eyebrow className="mb-4">Direct lines</Eyebrow>
            <ul className="space-y-2.5">
              {store.serviceLines.map((line) => (
                <li key={line.label} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                  <span className="text-muted-foreground">{line.label}</span>
                  {line.numbers.map((n) => (
                    <a key={n} href={`tel:${n.replace(/[\s-]/g, "")}`} className="font-mono hover:text-primary">
                      {n}
                    </a>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <Panel glow className="p-7 sm:p-9">
            <ContactForm />
          </Panel>
        </div>
      </div>
    </div>
  );
}
