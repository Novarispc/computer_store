import Link from "next/link";
import { getCounts } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { AdminHeader, AdminCard, StatTile } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui";

export default async function AdminOverviewPage() {
  const [counts, recentEnquiries] = await Promise.all([
    getCounts(),
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div>
      <AdminHeader
        title="Overview"
        description="Esquire Computers admin"
        action={
          <ButtonLink href="/admin/products" variant="outline">
            Manage products
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Products" value={counts.products} href="/admin/products" />
        <StatTile label="Categories" value={counts.categories} href="/admin/categories" />
        <StatTile label="Brands" value={counts.brands} href="/admin/brands" />
        <StatTile label="New enquiries" value={counts.newEnquiries} href="/admin/enquiries" />
      </div>

      <div className="mt-10">
        <AdminCard>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-sm font-semibold">Recent enquiries</h2>
            <Link href="/admin/enquiries" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentEnquiries.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No enquiries yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentEnquiries.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/admin/enquiries/${e.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-muted"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {e.ref} · {e.kind}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                      {e.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
