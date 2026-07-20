import { headers } from "next/headers";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { MascotIntro } from "@/components/brand/mascot-intro";
import { getBrandAssets } from "@/lib/brand-assets";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [brand, requestHeaders] = await Promise.all([getBrandAssets(), headers()]);
  const nonce = requestHeaders.get("x-nonce") ?? undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <MascotIntro mascotSrc={brand.mascot} nonce={nonce} />
      <Header logoSrc={brand.logoFull} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
