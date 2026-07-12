import { getServices } from "@/lib/settings";
import { AdminHeader } from "@/components/admin/ui";
import { ServicesClient } from "./services-client";

export default async function AdminServicesPage() {
  const services = await getServices();

  return (
    <div>
      <AdminHeader title="Services" description="Shown on the /services page and homepage." />
      <ServicesClient initial={services} />
    </div>
  );
}
