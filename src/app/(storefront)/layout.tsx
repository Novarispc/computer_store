import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { MascotIntro } from "@/components/brand/mascot-intro";
import { getBrandAssets } from "@/lib/brand-assets";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  // Resolved on the server from a Setting row; the client only ever sees a URL or null.
  const brand = await getBrandAssets();

  return (
    <div className="flex min-h-dvh flex-col">
      <MascotIntro mascotSrc={brand.mascot} />
      <Header logoSrc={brand.logoFull} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
