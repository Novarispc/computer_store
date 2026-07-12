"use client";

import { useState, useTransition } from "react";
import { updateHomepageSection } from "@/server/admin/homepage";
import { AdminCard, Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui";

type Section = { id: string; type: string; title: string | null; subtitle: string | null; active: boolean };

function SectionRow({ section }: { section: Section }) {
  const [title, setTitle] = useState(section.title ?? "");
  const [subtitle, setSubtitle] = useState(section.subtitle ?? "");
  const [active, setActive] = useState(section.active);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateHomepageSection(section.id, { title, subtitle, active });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    });
  }

  return (
    <AdminCard className="p-5">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
            {section.type}
          </span>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Visible
          </label>
        </div>
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass()} />
        </Field>
        <Field label="Subtitle">
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass()} />
        </Field>
        <Button type="submit" variant="outline" disabled={pending}>
          {saved ? "Saved" : pending ? "Saving…" : "Save"}
        </Button>
      </form>
    </AdminCard>
  );
}

export function HomepageClient({ sections }: { sections: Section[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {sections.map((s) => (
        <SectionRow key={s.id} section={s} />
      ))}
    </div>
  );
}
