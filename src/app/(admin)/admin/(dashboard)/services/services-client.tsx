"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { updateServices } from "@/server/admin/settings";
import { AdminCard, Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui";
import type { Service } from "@data/services";

export function ServicesClient({ initial }: { initial: Service[] }) {
  const [services, setServices] = useState<Service[]>(initial);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function update(i: number, patch: Partial<Service>) {
    setServices((s) => s.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }

  function remove(i: number) {
    setServices((s) => s.filter((_, j) => j !== i));
  }

  function add() {
    setServices((s) => [
      ...s,
      { slug: `service-${s.length + 1}`, title: "", body: "", icon: "Wrench" },
    ]);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateServices(services);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {services.map((s, i) => (
        <AdminCard key={i} className="p-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <Field label="Title">
              <input value={s.title} onChange={(e) => update(i, { title: e.target.value })} className={inputClass()} />
            </Field>
            <Field label="Icon" hint="lucide-react name">
              <input value={s.icon} onChange={(e) => update(i, { icon: e.target.value })} className={inputClass()} />
            </Field>
            <div className="flex items-end pb-0.5">
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove service"
                className="text-muted-foreground hover:text-danger"
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <Field label="Description">
              <textarea
                value={s.body}
                onChange={(e) => update(i, { body: e.target.value })}
                rows={2}
                className={inputClass("resize-none")}
              />
            </Field>
          </div>
        </AdminCard>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <Plus size={14} aria-hidden /> Add service
      </button>

      <div>
        <Button type="submit" disabled={pending}>
          {saved ? "Saved" : pending ? "Saving…" : "Save all"}
        </Button>
      </div>
    </form>
  );
}
