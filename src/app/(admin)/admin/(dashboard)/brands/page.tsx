import { listAdminBrands } from "@/server/admin/taxonomy";
import { AdminHeader } from "@/components/admin/ui";
import { BrandsClient } from "./brands-client";

export default async function AdminBrandsPage() {
  const brands = await listAdminBrands();

  return (
    <div>
      <AdminHeader title="Brands" description={`${brands.length} brands`} />
      <BrandsClient brands={brands} />
    </div>
  );
}
