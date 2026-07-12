import { notFound } from "next/navigation";
import { getAdminEnquiry } from "@/server/admin/enquiries";
import { formatMinor } from "@/lib/money";
import { AdminHeader, AdminCard } from "@/components/admin/ui";
import { EnquiryStatus } from "@/components/admin/enquiry-status";

type Params = { params: Promise<{ id: string }> };

export default async function AdminEnquiryDetailPage({ params }: Params) {
  const { id } = await params;
  const enquiry = await getAdminEnquiry(id);
  if (!enquiry) notFound();

  const total = enquiry.items.reduce((n, i) => n + i.unitPriceMinor * i.quantity, 0);

  return (
    <div>
      <AdminHeader
        title={enquiry.ref}
        description={`${enquiry.kind} · received ${enquiry.createdAt.toLocaleString("en-IN")}`}
        action={<EnquiryStatus id={enquiry.id} status={enquiry.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <AdminCard className="p-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">Name</dt>
              <dd className="mt-1 text-sm">{enquiry.name}</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">Phone</dt>
              <dd className="mt-1 text-sm">
                <a href={`tel:${enquiry.phone}`} className="hover:text-primary">
                  {enquiry.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">Email</dt>
              <dd className="mt-1 text-sm">
                <a href={`mailto:${enquiry.email}`} className="hover:text-primary">
                  {enquiry.email}
                </a>
              </dd>
            </div>
            {enquiry.company ? (
              <div>
                <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">Company</dt>
                <dd className="mt-1 text-sm">{enquiry.company}</dd>
              </div>
            ) : null}
            {enquiry.city ? (
              <div>
                <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">City</dt>
                <dd className="mt-1 text-sm">{enquiry.city}</dd>
              </div>
            ) : null}
          </dl>

          {enquiry.message ? (
            <div className="mt-6 border-t border-border pt-5">
              <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">Message</dt>
              <dd className="mt-2 whitespace-pre-wrap text-sm">{enquiry.message}</dd>
            </div>
          ) : null}
        </AdminCard>

        {enquiry.items.length > 0 ? (
          <AdminCard className="p-6">
            <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              Requested items
            </p>
            <ul className="space-y-2 text-sm">
              {enquiry.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="truncate text-muted-foreground">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="shrink-0 font-mono">
                    {formatMinor(item.unitPriceMinor * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-border pt-4">
              <p className="font-mono text-lg font-bold">{formatMinor(total)}</p>
            </div>
          </AdminCard>
        ) : null}
      </div>
    </div>
  );
}
