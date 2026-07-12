import { getHighlightsForAdmin } from "@/server/admin/homepage";
import { AdminHeader } from "@/components/admin/ui";
import { HighlightsClient } from "./highlights-client";

export default async function AdminHighlightsPage() {
  const section = await getHighlightsForAdmin();

  return (
    <div>
      <AdminHeader
        title="Highlights"
        description="A hand-picked product row on the homepage. Choose the products, set their order, and turn the section on or off."
      />
      <HighlightsClient
        initial={{
          title: section?.title ?? "This month's highlights",
          subtitle: section?.subtitle ?? "",
          active: section?.active ?? true,
          selected: section?.selected ?? [],
        }}
      />
    </div>
  );
}
