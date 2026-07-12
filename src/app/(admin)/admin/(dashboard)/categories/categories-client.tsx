"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AdminTable, Th, Td } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/category-form";
import { Button } from "@/components/ui";

type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  featured: boolean;
  _count: { products: number };
};

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | "new" | null>(null);

  if (editing) {
    return (
      <CategoryForm
        category={editing === "new" ? undefined : editing}
        onDone={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus size={15} aria-hidden /> Add category
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
          {categories.map((c) => (
            <tr key={c.id}>
              <Td className="font-medium">{c.name}</Td>
              <Td className="font-mono text-muted-foreground">{c._count.products}</Td>
              <Td>{c.featured ? "Yes" : "—"}</Td>
              <Td className="text-right">
                <button onClick={() => setEditing(c)} className="text-sm text-primary hover:underline">
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
