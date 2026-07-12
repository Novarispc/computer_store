"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrand, updateBrand, deleteBrand } from "@/server/admin/taxonomy";
import { Button, Panel } from "@/components/ui";
import { Field, inputClass } from "@/components/admin/ui";

type Brand = { id: string; name: string; featured: boolean };

export function BrandForm({ brand, onDone }: { brand?: Brand; onDone: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(brand?.name ?? "");
  const [featured, setFeatured] = useState(brand?.featured ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const input = { name, featured };
      const result = brand ? await updateBrand(brand.id, input) : await createBrand(input);
      if (!result.ok) return setError(result.error);
      router.refresh();
      onDone();
    });
  }

  function onDelete() {
    if (!brand) return;
    if (!confirm(`Delete "${brand.name}"? Products stay, but lose this brand.`)) return;
    startTransition(async () => {
      await deleteBrand(brand.id);
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured on homepage
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {brand ? "Save changes" : "Create brand"}
            </Button>
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
          </div>
          {brand ? (
            <button type="button" onClick={onDelete} disabled={pending} className="text-sm text-danger hover:underline">
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </Panel>
  );
}
