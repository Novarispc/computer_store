"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import { AdminCard } from "@/components/admin/ui";
import { updateMedia, updateBrandAsset } from "@/server/admin/settings";

/**
 * Every slot stores its URL in a Setting row (the upload itself goes to Blob in
 * production, or public/ locally). A successful upload returns a URL; we persist
 * it, then refresh so the storefront re-reads it.
 */
export function BrandingClient({
  mascot,
  logoFull,
  servicesHero,
}: {
  mascot: string | null;
  logoFull: string | null;
  servicesHero: string | null;
}) {
  const router = useRouter();
  const [, startSave] = useTransition();

  function saveMedia(slot: string, url: string | null) {
    startSave(async () => {
      await updateMedia(slot, url);
      router.refresh();
    });
  }

  function saveBrand(slot: "mascot" | "logoFull", url: string | null) {
    startSave(async () => {
      await updateBrandAsset(slot, url);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminCard className="p-6">
        <h2 className="font-display text-sm font-semibold">Header logo</h2>
        <p className="mb-5 mt-1 text-xs text-muted-foreground">
          The mascot-and-wordmark lockup shown in the site header. Rendered about 28px tall, so
          keep it legible small. Transparent PNG works best.
        </p>
        <ImageUpload
          label="logo-full"
          value={logoFull}
          kind="brand"
          name="logo-full"
          hint="PNG, JPG or WebP, up to 5 MB. Replaces the drawn emblem."
          onChange={(url) => saveBrand("logoFull", url)}
        />
      </AdminCard>

      <AdminCard className="p-6">
        <h2 className="font-display text-sm font-semibold">Intro mascot</h2>
        <p className="mb-5 mt-1 text-xs text-muted-foreground">
          The figure that flies in and settles on first visit. Upload the mascot only — no wordmark,
          no plate — on a transparent background, tall crop.
        </p>
        <ImageUpload
          label="mascot"
          value={mascot}
          kind="brand"
          name="mascot"
          hint="Transparent PNG, up to 5 MB. Replaces the drawn mascot."
          previewClassName="size-28"
          onChange={(url) => saveBrand("mascot", url)}
        />
      </AdminCard>

      <AdminCard className="p-6 lg:col-span-2">
        <h2 className="font-display text-sm font-semibold">Services page banner</h2>
        <p className="mb-5 mt-1 text-xs text-muted-foreground">
          A wide image shown at the top of the Services page — for example the &ldquo;We Fix
          Laptops&rdquo; artwork. Leave empty to keep the plain heading.
        </p>
        <ImageUpload
          label="servicesHero"
          value={servicesHero}
          kind="media"
          name="servicesHero"
          hint="PNG, JPG or WebP, up to 5 MB. Wide crop reads best."
          previewClassName="h-24 w-40"
          onChange={(url) => saveMedia("servicesHero", url)}
        />
      </AdminCard>
    </div>
  );
}
