"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory, deleteCategory } from "@/server/admin/taxonomy";
import { Button, Panel } from "@/components/ui";
import { Field, inputClass } from "@/components/admin/ui";

type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  featured: boolean;
};

export function CategoryForm({ category, onDone }: { category?: Category; onDone: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "");
  const [featured, setFeatured] = useState(category?.featured ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const input = { name, description, icon, featured };
      const result = category
        ? await updateCategory(category.id, input)
        : await createCategory(input);
      if (!result.ok) return setError(result.error);
      router.refresh();
      onDone();
    });
  }

  function onDelete() {
    if (!category) return;
    if (!confirm(`Delete "${category.name}"? Products stay, but lose this category.`)) return;
    startTransition(async () => {
      await deleteCategory(category.id);
      router.refresh();
      onDone();
    });
  }

  return (
    <Panel glow className="p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass()} />
        </Field>
        <Field label="Description" hint="Shown on the category card and page header.">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClass("resize-none")}
          />
        </Field>
        <Field label="Icon" hint="A lucide-react icon name, e.g. Laptop, Printer, Cctv.">
          <input value={icon} onChange={(e) => setIcon(e.target.value)} className={inputClass()} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured on homepage
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {category ? "Save changes" : "Create category"}
            </Button>
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
          </div>
          {category ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="text-sm text-danger hover:underline"
            >
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </Panel>
  );
}
