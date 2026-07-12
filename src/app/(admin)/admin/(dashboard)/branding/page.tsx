import { requireAdmin } from "@/lib/auth";
import { getBrandAssets } from "@/lib/brand-assets";
import { getMedia } from "@/lib/settings";
import { AdminHeader } from "@/components/admin/ui";
import { BrandingClient } from "./branding-client";

export default async function AdminBrandingPage() {
  await requireAdmin();
  const [brand, media] = await Promise.all([getBrandAssets(), getMedia()]);

  return (
    <div>
      <AdminHeader
        title="Branding"
        description="Upload the real Esquire logo, intro mascot, and page imagery. Until you do, the site draws its own stand-ins."
      />
      <BrandingClient
        mascot={brand.mascot}
        logoFull={brand.logoFull}
        servicesHero={media.servicesHero ?? null}
      />
    </div>
  );
}
