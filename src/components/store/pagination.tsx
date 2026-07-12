import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildQuery, type RawSearchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  searchParams,
  basePath = "/products",
}: {
  page: number;
  pageCount: number;
  searchParams: RawSearchParams;
  basePath?: string;
}) {
  if (pageCount <= 1) return null;

  const pages = pageWindow(page, pageCount);

  return (
    <nav className="mt-14 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <PageLink
        href={`${basePath}${buildQuery(searchParams, { page: page - 1 })}`}
        disabled={page <= 1}
        label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden />
      </PageLink>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <PageLink
            key={p}
            href={`${basePath}${buildQuery(searchParams, { page: p })}`}
            current={p === page}
            label={`Page ${p}`}
          >
            <span className="font-mono text-sm">{p}</span>
          </PageLink>
        )
      )}

      <PageLink
        href={`${basePath}${buildQuery(searchParams, { page: page + 1 })}`}
        disabled={page >= pageCount}
        label="Next page"
      >
        <ChevronRight size={16} aria-hidden />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  current,
  disabled,
  label,
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
  label: string;
}) {
  const className = cn(
    "chamfer-sm inline-flex size-9 items-center justify-center text-sm transition-colors",
    current
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground ring-1 ring-inset ring-border hover:text-foreground",
    disabled && "pointer-events-none opacity-40"
  );

  if (disabled) {
    return (
      <span className={className} aria-disabled="true" aria-label={label}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className} aria-label={label} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}

/** 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page: number, pageCount: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const push = (n: number) => out.push(n);

  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  push(1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) push(i);
  if (end < pageCount - 1) out.push("…");
  if (pageCount > 1) push(pageCount);

  return out;
}
