import { getStore } from "@/lib/settings";
import { AdminHeader } from "@/components/admin/ui";
import { SettingsClient } from "./settings-client";

export default async function AdminSettingsPage() {
  const store = await getStore();

  return (
    <div>
      <AdminHeader title="Settings" description="Store information and public contact details." />
      <SettingsClient initial={store} />
    </div>
  );
}
