import Link from "next/link";
import { listAdminEnquiries } from "@/server/admin/enquiries";
import { AdminHeader, AdminTable, Th, Td } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui";

export default async function AdminEnquiriesPage() {
  const enquiries = await listAdminEnquiries();

  return (
    <div>
      <AdminHeader title="Enquiries" description={`${enquiries.length} total`} />

      {enquiries.length === 0 ? (
        <EmptyState title="No enquiries yet" body="Quote requests and contact messages will appear here." />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <Th>Reference</Th>
              <Th>Name</Th>
              <Th>Kind</Th>
              <Th>Status</Th>
              <Th>Received</Th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((e) => (
              <tr key={e.id}>
                <Td>
                  <Link href={`/admin/enquiries/${e.id}`} className="font-mono text-primary hover:underline">
                    {e.ref}
                  </Link>
                </Td>
                <Td className="font-medium">{e.name}</Td>
                <Td className="text-muted-foreground">{e.kind}</Td>
                <Td>{e.status}</Td>
                <Td className="text-muted-foreground">
                  {e.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
