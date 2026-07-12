"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { PRODUCT_SORTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SORT_LABELS: Record<(typeof PRODUCT_SORTS)[number], string> = {
  relevance: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "name-asc": "Name: A to Z",
  newest: "Newest",
};

type Facet = { slug: string; name: string; count: number };

export function CatalogFilters({
  categories,
  brands,
  basePath = "/products",
  lockedCategory,
  lockedBrand,
}: {
  categories: { slug: string; name: string; productCount: number }[];
  brands: Facet[];
  basePath?: string;
  lockedCategory?: string;
  lockedBrand?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  useEffect(() => setQ(params.get("q") ?? ""), [params]);

  function push(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in patch)) next.delete("page"); // any filter change resets paging
    const qs = next.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  const activeCount = ["q", "category", "brand", "condition", "min", "max"].filter((k) =>
    params.get(k)
  ).length;

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push({ q: q.trim() || null });
        }}
        role="search"
      >
        <label htmlFor="catalog-search" className="sr-only">
          Search products
        </label>
        <div className="chamfer-frame chamfer-sm">
          <div className="chamfer-sm flex items-center gap-2 bg-card px-3">
            <Search size={16} className="shrink-0 text-muted-foreground" aria-hidden />
            <input
              id="catalog-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by model, brand, spec…"
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            {q ? (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  push({ q: null });
                }}
                aria-label="Clear search"
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={15} aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      </form>

      <div>
        <label htmlFor="sort" className="mb-2 block font-mono text-[0.66rem] uppercase tracking-[0.28em] text-muted-foreground">
          Sort
        </label>
        <select
          id="sort"
          value={params.get("sort") ?? "relevance"}
          onChange={(e) => push({ sort: e.target.value === "relevance" ? null : e.target.value })}
          className="chamfer-sm w-full bg-card px-3 py-2.5 text-sm outline-none ring-1 ring-inset ring-border focus:ring-primary"
        >
          {PRODUCT_SORTS.map((s) => (
            <option key={s} value={s}>
              {SORT_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {!lockedCategory ? (
        <FacetGroup
          title="Category"
          items={categories.map((c) => ({ slug: c.slug, name: c.name, count: c.productCount }))}
          selected={params.get("category")}
          onSelect={(slug) => push({ category: slug })}
        />
      ) : null}

      {!lockedBrand ? (
        <FacetGroup
          title="Brand"
          items={brands}
          selected={params.get("brand")}
          onSelect={(slug) => push({ brand: slug })}
        />
      ) : null}

      <div>
        <p className="mb-3 font-mono text-[0.66rem] uppercase tracking-[0.28em] text-muted-foreground">
          Condition
        </p>
        <div className="flex gap-2">
          {(["NEW", "REFURBISHED"] as const).map((c) => {
            const active = params.get("condition") === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => push({ condition: active ? null : c })}
                aria-pressed={active}
                className={cn(
                  "chamfer-sm px-3 py-2 text-xs font-medium ring-1 ring-inset transition-colors",
                  active
                    ? "bg-primary/10 text-primary ring-primary/40"
                    : "text-muted-foreground ring-border hover:text-foreground"
                )}
              >
                {c === "NEW" ? "New" : "Refurbished"}
              </button>
            );
          })}
        </div>
      </div>

      <PriceRange
        min={params.get("min") ?? ""}
        max={params.get("max") ?? ""}
        onApply={(min, max) => push({ min: min || null, max: max || null })}
      />

      {activeCount > 0 ? (
        <Link
          href={basePath}
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <X size={13} aria-hidden />
          Clear all filters ({activeCount})
        </Link>
      ) : null}
    </div>
  );
}

function FacetGroup({
  title,
  items,
  selected,
  onSelect,
}: {
  title: string;
  items: Facet[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!items.length) return null;

  const visible = expanded ? items : items.slice(0, 8);

  return (
    <div>
      <p className="mb-3 font-mono text-[0.66rem] uppercase tracking-[0.28em] text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-1">
        {visible.map((item) => {
          const active = selected === item.slug;
          return (
            <li key={item.slug}>
              <button
                type="button"
                onClick={() => onSelect(active ? null : item.slug)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-sm transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="truncate">{item.name}</span>
                <span className="font-mono text-[0.68rem] text-muted-foreground">{item.count}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {items.length > 8 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 px-2 text-xs text-primary hover:underline"
        >
          {expanded ? "Show fewer" : `Show all ${items.length}`}
        </button>
      ) : null}
    </div>
  );
}

function PriceRange({
  min,
  max,
  onApply,
}: {
  min: string;
  max: string;
  onApply: (min: string, max: string) => void;
}) {
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);

  useEffect(() => {
    setLo(min);
    setHi(max);
  }, [min, max]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply(lo, hi);
      }}
    >
      <p className="mb-3 font-mono text-[0.66rem] uppercase tracking-[0.28em] text-muted-foreground">
        Price (₹)
      </p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={lo}
          onChange={(e) => setLo(e.target.value)}
          placeholder="Min"
          aria-label="Minimum price in rupees"
          className="chamfer-sm w-full bg-card px-2.5 py-2 font-mono text-xs outline-none ring-1 ring-inset ring-border focus:ring-primary"
        />
        <span className="text-muted-foreground">–</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={hi}
          onChange={(e) => setHi(e.target.value)}
          placeholder="Max"
          aria-label="Maximum price in rupees"
          className="chamfer-sm w-full bg-card px-2.5 py-2 font-mono text-xs outline-none ring-1 ring-inset ring-border focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        className="chamfer-sm mt-3 w-full bg-muted py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground"
      >
        Apply
      </button>
    </form>
  );
}
