"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createProduct, updateProduct, deleteProduct } from "@/server/admin/products";
import { PRODUCT_CONDITIONS } from "@/lib/constants";
import { Button, Panel } from "@/components/ui";
import { Field, inputClass } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";

type Option = { id: string; name: string };
type Spec = { key: string; value: string };

/** Not a real brand id — selecting it reveals a free-text field instead. */
const NEW_BRAND_VALUE = "__new__";
type ProductDetail = {
  id: string;
  name: string;
  model: string | null;
  description: string;
  categoryId: string | null;
  brandId: string | null;
  priceMinor: number;
  compareAtMinor: number | null;
  condition: string;
  warranty: string | null;
  featured: boolean;
  active: boolean;
  specs: Spec[];
  images: { url: string; alt: string | null }[];
};

export function ProductForm({
  product,
  categories,
  brands,
  onDone,
}: {
  product?: ProductDetail;
  categories: Option[];
  brands: Option[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [model, setModel] = useState(product?.model ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? "");
  const [newBrandName, setNewBrandName] = useState("");
  const [priceRupees, setPriceRupees] = useState(
    product ? String(product.priceMinor / 100) : ""
  );
  const [condition, setCondition] = useState(product?.condition ?? "NEW");
  const [warranty, setWarranty] = useState(product?.warranty ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [specs, setSpecs] = useState<Spec[]>(product?.specs.map((s) => ({ key: s.key, value: s.value })) ?? []);
  const [imageUrl, setImageUrl] = useState<string | null>(product?.images[0]?.url ?? null);

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateSpec(i: number, patch: Partial<Spec>) {
    setSpecs((s) => s.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const price = Number(priceRupees);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price in rupees.");
      return;
    }

    if (brandId === NEW_BRAND_VALUE && !newBrandName.trim()) {
      setError("Enter a name for the new brand, or pick one from the list.");
      return;
    }

    startTransition(async () => {
      const input = {
        name,
        model,
        description,
        categoryId,
        brandId: brandId === NEW_BRAND_VALUE ? "" : brandId,
        brandName: brandId === NEW_BRAND_VALUE ? newBrandName.trim() : undefined,
        priceRupees: price,
        condition: condition as (typeof PRODUCT_CONDITIONS)[number],
        warranty,
        featured,
        active,
        specs: specs.filter((s) => s.key.trim() && s.value.trim()),
        imageUrl,
      };

      const result = product
        ? await updateProduct(product.id, input)
        : await createProduct(input);

      if (!result.ok) return setError(result.error);

      router.refresh();
      onDone();
    });
  }

  function onDelete() {
    if (!product) return;
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteProduct(product.id);
      router.refresh();
      onDone();
    });
  }

  return (
    <Panel glow className="p-6 sm:p-7">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass()} />
          </Field>
          <Field label="Model" hint="Optional part number.">
            <input value={model} onChange={(e) => setModel(e.target.value)} className={inputClass()} />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass("resize-none")}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Category">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass()}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Brand">
            <select
              value={brandId}
              onChange={(e) => {
                setBrandId(e.target.value);
                if (e.target.value !== NEW_BRAND_VALUE) setNewBrandName("");
              }}
              className={inputClass()}
            >
              <option value="">None</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
              <option value={NEW_BRAND_VALUE}>+ Add new brand…</option>
            </select>
            {brandId === NEW_BRAND_VALUE ? (
              <input
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="New brand name"
                autoFocus
                className={inputClass("mt-2")}
              />
            ) : null}
          </Field>
          <Field label="Condition">
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass()}>
              {PRODUCT_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c === "NEW" ? "New" : "Refurbished"}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Price (₹)">
            <input
              type="number"
              inputMode="decimal"
              min={1}
              value={priceRupees}
              onChange={(e) => setPriceRupees(e.target.value)}
              required
              className={inputClass()}
            />
          </Field>
          <Field label="Warranty" hint="e.g. 3 years">
            <input value={warranty} onChange={(e) => setWarranty(e.target.value)} className={inputClass()} />
          </Field>
        </div>

        <ImageUpload
          label="Product photo"
          value={imageUrl}
          onChange={setImageUrl}
          kind="product"
          hint="Replaces the generated illustration. PNG, JPG or WebP, up to 5 MB."
        />

        {/* Uploads land immediately; the row is only written when the form saves. */}
        {imageUrl && !product ? (
          <p className="-mt-2 text-xs text-muted-foreground">
            The photo is attached when you create the product.
          </p>
        ) : null}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Specifications</span>
            <button
              type="button"
              onClick={() => setSpecs((s) => [...s, { key: "", value: "" }])}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus size={13} aria-hidden /> Add row
            </button>
          </div>
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={s.key}
                  onChange={(e) => updateSpec(i, { key: e.target.value })}
                  placeholder="Key"
                  className={inputClass("w-1/3")}
                />
                <input
                  value={s.value}
                  onChange={(e) => updateSpec(i, { value: e.target.value })}
                  placeholder="Value"
                  className={inputClass("flex-1")}
                />
                <button
                  type="button"
                  onClick={() => setSpecs((rows) => rows.filter((_, j) => j !== i))}
                  aria-label="Remove spec"
                  className="text-muted-foreground hover:text-danger"
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active (visible on storefront)
          </label>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex items-center justify-between border-t border-border pt-5">
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {product ? "Save changes" : "Create product"}
            </Button>
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
          </div>
          {product ? (
            <button type="button" onClick={onDelete} disabled={pending} className="text-sm text-danger hover:underline">
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </Panel>
  );
}
