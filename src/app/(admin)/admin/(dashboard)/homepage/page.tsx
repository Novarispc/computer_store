import { listHomepageSections } from "@/server/admin/homepage";
import { AdminHeader } from "@/components/admin/ui";
import { HomepageClient } from "./homepage-client";

export default async function AdminHomepagePage() {
  const sections = await listHomepageSections();

  return (
    <div>
      <AdminHeader
        title="Homepage content"
        description="Titles and visibility for each homepage section."
      />
      <HomepageClient sections={sections} />
    </div>
  );
}
