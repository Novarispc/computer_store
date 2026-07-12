import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getEnquiryByRef } from "@/server/enquiries";
import { formatMinor } from "@/lib/money";
import { PRICE_DISCLAIMER } from "@/lib/constants";
import { getStore } from "@/lib/settings";
import { ButtonLink, Panel } from "@/components/ui";

export const metadata: Metadata = { title: "Quote received" };

type Params = { params: Promise<{ ref: string }> };

export default async function QuoteConfirmationPage({ params }: Params) {
  const { ref } = await params;
  const [enquiry, store] = await Promise.all([getEnquiryByRef(ref), getStore()]);
  if (!enquiry || enquiry.kind !== "QUOTE") notFound();

  const total = enquiry.items.reduce((n, i) => n + i.unitPriceMinor * i.quantity, 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <CheckCircle2 size={40} className="mx-auto text-success" aria-hidden />
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Quote request received
      </h1>
      <p className="mt-3 text-muted-foreground">
        Reference <span className="font-mono text-foreground">{enquiry.ref}</span>. We will call or
        email you at <span className="text-foreground">{enquiry.phone}</span> within one business
        day with confirmed pricing.
      </p>

      <Panel className="mt-10 p-6 text-left">
        <ul className="space-y-2 text-sm">
          {enquiry.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="truncate text-muted-foreground">
                {item.quantity} × {item.name}
              </span>
              <span className="shrink-0 font-mono">
                {formatMinor(item.unitPriceMinor * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-border pt-4">
          <p className="font-mono text-xl font-bold">{formatMinor(total)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{PRICE_DISCLAIMER}.</p>
        </div>
      </Panel>

      <p className="mt-8 text-sm text-muted-foreground">
        Need this sooner? Call {store.primary.phone} and quote your reference.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/products">Continue browsing</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
