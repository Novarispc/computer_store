"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Search, X } from "lucide-react";
import {
  updateHighlights,
  searchProductsForHighlights,
} from "@/server/admin/homepage";
import { AdminCard, Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui";
import { formatMinor } from "@/lib/money";

type Selected = { slug: string; name: string; brand: string | null };
type Found = { slug: string; name: string; priceMinor: number; brand: { name: string } | null };

const MAX = 12;

export function HighlightsClient({
  initial,
}: {
  initial: { title: string; subtitle: string; active: boolean; selected: Selected[] };
}) {
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [active, setActive] = useState(initial.active);
  const [selected, setSelected] = useState<Selected[]>(initial.selected);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Found[]>([]);
  const [searching, startSearch] = useTransition();
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function runSearch(e: React.FormEvent) {
    e.preventDefault();
    startSearch(async () => {
      setResults(await searchProductsForHighlights(query.trim()));
    });
  }

  function add(p: Found) {
    if (selected.length >= MAX) {
      setError(`You can highlight at most ${MAX} products.`);
      return;
    }
    if (selected.some((s) => s.slug === p.slug)) return;
    setError(null);
    setSelected((s) => [...s, { slug: p.slug, name: p.name, brand: p.brand?.name ?? null }]);
  }

  function remove(slug: string) {
    setSelected((s) => s.filter((x) => x.slug !== slug));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= selected.length) return;
    setSelected((s) => {
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function save() {
    setError(null);
    setSaved(false);
    startSave(async () => {
      const result = await updateHighlights({
        title,
        subtitle,
        active,
        slugs: selected.map((s) => s.slug),
      });
      if (!result.ok) return setError(result.error);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    });
  }

  return (
    <div className="space-y-6">
      <AdminCard className="p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Section title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass()} />
          </Field>
          <Field label="Subtitle">
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className={inputClass()}
            />
          </Field>
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Show this section on the homepage
        </label>
      </AdminCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard className="p-6">
          <h2 className="font-display text-sm font-semibold">
            Highlighted products{" "}
            <span className="font-mono text-xs text-muted-foreground">
              {selected.length}/{MAX}
            </span>
          </h2>

          {selected.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Nothing highlighted yet. Search on the right and add a few products.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {selected.map((s, i) => (
                <li
                  key={s.slug}
                  className="chamfer-sm flex items-center gap-2 bg-muted px-3 py-2 text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {s.name}
                    {s.brand ? (
                      <span className="ml-2 text-xs text-muted-foreground">{s.brand}</span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`Move ${s.name} up`}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp size={14} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === selected.length - 1}
                    aria-label={`Move ${s.name} down`}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown size={14} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(s.slug)}
                    aria-label={`Remove ${s.name}`}
                    className="text-muted-foreground hover:text-danger"
                  >
                    <X size={15} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard className="p-6">
          <h2 className="mb-4 font-display text-sm font-semibold">Find products</h2>
          <form onSubmit={runSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or model…"
              className={inputClass("flex-1")}
            />
            <Button type="submit" variant="outline" disabled={searching}>
              <Search size={15} aria-hidden />
              {searching ? "…" : "Search"}
            </Button>
          </form>

          <ul className="mt-4 max-h-80 space-y-1 overflow-y-auto">
            {results.map((p) => {
              const chosen = selected.some((s) => s.slug === p.slug);
              return (
                <li key={p.slug} className="flex items-center gap-2 py-1.5 text-sm">
                  <span className="min-w-0 flex-1 truncate">
                    {p.name}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {formatMinor(p.priceMinor)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => add(p)}
                    disabled={chosen}
                    className="chamfer-sm inline-flex items-center gap-1 bg-muted px-2 py-1 text-xs hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:hover:bg-muted disabled:hover:text-foreground"
                  >
                    <Plus size={12} aria-hidden />
                    {chosen ? "Added" : "Add"}
                  </button>
                </li>
              );
            })}
            {!searching && results.length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Search to list products.
              </li>
            ) : null}
          </ul>
        </AdminCard>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Button onClick={save} disabled={saving}>
        {saved ? "Saved" : saving ? "Saving…" : "Save highlights"}
      </Button>
    </div>
  );
}
