"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { BulkImport } from "@/components/admin/bulk-import";
import { getAdminProduct } from "@/server/admin/products";
import { AdminTable, Th, Td } from "@/components/admin/ui";
import { Button } from "@/components/ui";
import { formatMinor } from "@/lib/money";

type Row = {
  id: string;
  name: string;
  model: string | null;
  priceMinor: number;
  active: boolean;
  featured: boolean;
  category: { name: string } | null;
  brand: { name: string } | null;
};
type Option = { id: string; name: string };

export function ProductsClient({
  items,
  categories,
  brands,
}: {
  items: Row[];
  categories: Option[];
  brands: Option[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getAdminProduct>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  async function openEdit(id: string) {
    setEditingId(id);
    setLoading(true);
    const d = await getAdminProduct(id);
    setDetail(d);
    setLoading(false);
  }

  function close() {
    setEditingId(null);
    setDetail(null);
    router.refresh();
  }

  if (bulkOpen) {
    return (
      <BulkImport
        onDone={() => {
          setBulkOpen(false);
          router.refresh();
        }}
      />
    );
  }

  if (editingId === "new") {
    return <ProductForm categories={categories} brands={brands} onDone={close} />;
  }

  if (editingId) {
    if (loading || !detail) return <p className="text-sm text-muted-foreground">Loading…</p>;
    return (
      <ProductForm
        product={{
          id: detail.id,
          name: detail.name,
          model: detail.model,
          description: detail.description,
          categoryId: detail.categoryId,
          brandId: detail.brandId,
          priceMinor: detail.priceMinor,
          compareAtMinor: detail.compareAtMinor,
          condition: detail.condition,
          warranty: detail.warranty,
          featured: detail.featured,
          active: detail.active,
          specs: detail.specs,
          images: detail.images,
        }}
        categories={categories}
        brands={brands}
        onDone={close}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setBulkOpen(true)}>
          <Upload size={15} aria-hidden /> Bulk import
        </Button>
        <Button onClick={() => setEditingId("new")}>
          <Plus size={15} aria-hidden /> Add product
        </Button>
      </div>

      <AdminTable>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Category</Th>
            <Th>Brand</Th>
            <Th>Price</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <Td className="font-medium">{p.name}</Td>
              <Td className="text-muted-foreground">{p.category?.name ?? "—"}</Td>
              <Td className="text-muted-foreground">{p.brand?.name ?? "—"}</Td>
              <Td className="font-mono">{formatMinor(p.priceMinor)}</Td>
              <Td>
                {p.active ? (
                  <span className="text-success">Active</span>
                ) : (
                  <span className="text-muted-foreground">Hidden</span>
                )}
                {p.featured ? <span className="ml-2 text-primary">★</span> : null}
              </Td>
              <Td className="text-right">
                <button onClick={() => openEdit(p.id)} className="text-sm text-primary hover:underline">
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
