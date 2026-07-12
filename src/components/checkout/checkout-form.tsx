"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart, cartTotalMinor } from "@/stores/cart";
import { createQuoteEnquiry } from "@/server/enquiries";
import { formatMinor } from "@/lib/money";
import { PRICE_DISCLAIMER } from "@/lib/constants";
import { Button, Eyebrow, Panel } from "@/components/ui";

export function CheckoutForm() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const clear = useCart((s) => s.clear);

  const [fields, setFields] = useState({ name: "", email: "", phone: "", company: "", city: "", message: "" });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  const total = cartTotalMinor(items);

  function update(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await createQuoteEnquiry({
        ...fields,
        items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
      });

      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      clear();
      router.push(`/quote/${result.ref}`);
    });
  }

  if (hydrated && items.length === 0) {
    return (
      <Panel className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Your quote list is empty. Add a product before checking out.
        </p>
      </Panel>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" value={fields.name} onChange={update("name")} required error={fieldErrors.name} />
          <Field label="Phone" type="tel" value={fields.phone} onChange={update("phone")} required error={fieldErrors.phone} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" type="email" value={fields.email} onChange={update("email")} required error={fieldErrors.email} />
          <Field label="Company (optional)" value={fields.company} onChange={update("company")} error={fieldErrors.company} />
        </div>
        <Field label="City (optional)" value={fields.city} onChange={update("city")} error={fieldErrors.city} />
        <Field
          label="Notes for the quote (optional)"
          as="textarea"
          rows={4}
          value={fields.message}
          onChange={update("message")}
          error={fieldErrors.message}
        />

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Sending…" : "Submit quote request"}
        </Button>
        <p className="text-xs text-muted-foreground">
          This sends your list to Esquire Computers. No payment is collected — you will be contacted
          to confirm pricing and availability.
        </p>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Panel className="p-6">
          <Eyebrow className="mb-4">
            {items.length} {items.length === 1 ? "item" : "items"}
          </Eyebrow>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.slug} className="flex justify-between gap-3">
                <span className="truncate text-muted-foreground">
                  {i.quantity} × {i.name}
                </span>
                <span className="shrink-0 font-mono">{formatMinor(i.priceMinor * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-border pt-4">
            <p className="font-mono text-xl font-bold">{formatMinor(total)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{PRICE_DISCLAIMER}.</p>
          </div>
        </Panel>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  as = "input",
  rows,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
  required?: boolean;
  error?: string[];
}) {
  const Tag = as;
  const id = `checkout-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="chamfer-frame chamfer-sm">
        <Tag
          id={id}
          value={value}
          onChange={onChange}
          type={as === "input" ? type : undefined}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          className="chamfer-sm w-full resize-none bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {error ? <p className="mt-1 text-xs text-danger">{error[0]}</p> : null}
    </div>
  );
}
