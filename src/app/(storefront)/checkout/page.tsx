import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "Request a quote" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-12">
        <Eyebrow>Last step</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Request a quote
        </h1>
        <p className="mt-3 text-muted-foreground">
          Tell us how to reach you. We confirm pricing and stock before anything is finalised —
          nothing is charged here.
        </p>
      </header>

      <CheckoutForm />
    </div>
  );
}
