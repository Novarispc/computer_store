import type { Metadata } from "next";
import Link from "next/link";
import * as Icons from "lucide-react";
import { listCategories } from "@/lib/queries";
import { Eyebrow, Panel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Categories",
  description: "Twenty-one categories of IT hardware, from laptops to CCTV to solar.",
};

/** Category icons are stored as lucide names; resolve defensively. */
function CategoryIcon({ name }: { name: string | null }) {
  const Icon = (name && (Icons as unknown as Record<string, Icons.LucideIcon>)[name]) || Icons.Box;
  return <Icon size={22} className="text-primary" aria-hidden />;
}

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-14 max-w-2xl">
        <Eyebrow>Browse</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Categories
        </h1>
        <p className="mt-3 text-muted-foreground">
          One supplier across the whole stack — from the laptop on the desk to the camera above the
          door and the UPS that keeps both running.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.id} href={`/category/${c.slug}`} className="group block">
            <Panel glow className="specular relative h-full overflow-hidden p-6">
              <div className="flex items-start justify-between gap-4">
                <CategoryIcon name={c.icon} />
                <span className="font-mono text-xs text-muted-foreground">
                  {c.productCount > 0 ? c.productCount : "—"}
                </span>
              </div>
              <h2 className="mt-5 font-display text-lg font-semibold group-hover:text-primary">
                {c.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
              {c.productCount === 0 ? (
                <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  Enquire for stock
                </p>
              ) : null}
            </Panel>
          </Link>
        ))}
      </div>
    </div>
  );
}
