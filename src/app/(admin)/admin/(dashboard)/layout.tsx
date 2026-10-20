import { AdminSidebar } from "@/components/admin/sidebar";
import { getCounts } from "@/lib/queries";
import { getBrandAssets } from "@/lib/brand-assets";
import { requireAdmin } from "@/lib/auth";

// The admin is auth-gated and per-request — never prerender it. This also keeps
// the whole /admin section out of the build's static-generation DB reads.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Keep the final data boundary protected even if routing middleware changes.
  await requireAdmin();
  const [counts, brand] = await Promise.all([getCounts(), getBrandAssets()]);

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar newEnquiries={counts.newEnquiries} logoSrc={brand.logoFull} />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">{children}</div>
      </main>
    </div>
  );
}
