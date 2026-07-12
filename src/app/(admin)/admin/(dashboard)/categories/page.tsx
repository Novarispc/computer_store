import { listAdminCategories } from "@/server/admin/taxonomy";
import { AdminHeader } from "@/components/admin/ui";
import { CategoriesClient } from "./categories-client";

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <div>
      <AdminHeader title="Categories" description={`${categories.length} categories`} />
      <CategoriesClient categories={categories} />
    </div>
  );
}
