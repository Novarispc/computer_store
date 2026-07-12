"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AdminTable, Th, Td } from "@/components/admin/ui";
import { BrandForm } from "@/components/admin/brand-form";
import { Button } from "@/components/ui";

type Brand = { id: string; name: string; featured: boolean; _count: { products: number } };

export function BrandsClient({ brands }: { brands: Brand[] }) {
  const [editing, setEditing] = useState<Brand | "new" | null>(null);

  if (editing) {
    return <BrandForm brand={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus size={15} aria-hidden /> Add brand
        </Button>
      </div>

      <AdminTable>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Products</Th>
            <Th>Featured</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {brands.map((b) => (
            <tr key={b.id}>
              <Td className="font-medium">{b.name}</Td>
              <Td className="font-mono text-muted-foreground">{b._count.products}</Td>
              <Td>{b.featured ? "Yes" : "—"}</Td>
              <Td className="text-right">
                <button onClick={() => setEditing(b)} className="text-sm text-primary hover:underline">
                  Edit
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
