"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { createContactEnquiry, type ActionResult } from "@/server/enquiries";
import { Button, Panel } from "@/components/ui";

const initialState: ActionResult = { ok: false, error: "" };

export function ContactForm() {
  const [state, action, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => createContactEnquiry(formData),
    initialState
  );

  if (state.ok) {
    return (
      <Panel glow className="p-8 text-center">
        <CheckCircle2 size={32} className="mx-auto text-success" aria-hidden />
        <h3 className="mt-4 font-display text-xl font-semibold">Message sent</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Reference <span className="font-mono text-foreground">{state.ref}</span>. We reply within
          one business day — sooner for service calls.
        </p>
      </Panel>
    );
  }

  const errors = "fieldErrors" in state ? state.fieldErrors : undefined;

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Name" required error={errors?.name} />
        <Field name="phone" label="Phone" type="tel" required error={errors?.phone} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="email" label="Email" type="email" required error={errors?.email} />
        <Field name="company" label="Company (optional)" error={errors?.company} />
      </div>
      <Field name="city" label="City (optional)" error={errors?.city} />
      <Field
        name="message"
        label="Message"
        as="textarea"
        rows={5}
        required
        error={errors?.message}
      />

      {!state.ok && state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  as = "input",
  rows,
  required,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
  required?: boolean;
  error?: string[];
}) {
  const Tag = as;
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="chamfer-frame chamfer-sm">
        <Tag
          id={id}
          name={name}
          type={as === "input" ? type : undefined}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="chamfer-sm w-full resize-none bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger">
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}
