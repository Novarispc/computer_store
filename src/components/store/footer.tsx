import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { LogoLockup } from "@/components/brand/logo";
import { Eyebrow } from "@/components/ui";
import { getStore } from "@/lib/settings";
import { getBrandAssets } from "@/lib/brand-assets";

export async function Footer() {
  const [store, brand] = await Promise.all([getStore(), getBrandAssets()]);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <LogoLockup src={brand.logoFull} />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">{store.tagline}</p>
            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {store.certification}
            </p>
          </div>

          <div>
            <Eyebrow className="mb-4">Shop</Eyebrow>
            <ul className="space-y-2.5 text-sm">
              {[
                ["/products", "All products"],
                ["/categories", "Categories"],
                ["/brands", "Brands"],
                ["/cart", "Quote list"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-muted-foreground hover:text-primary">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Eyebrow className="mb-4">Company</Eyebrow>
            <ul className="space-y-2.5 text-sm">
              {[
                ["/about", "About us"],
                ["/services", "Services"],
                ["/contact", "Contact"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-muted-foreground hover:text-primary">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Eyebrow className="mb-4">Reach us</Eyebrow>
            <address className="space-y-3 text-sm not-italic text-muted-foreground">
              <p className="flex gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                <span>
                  {store.address.line1}, {store.address.line2}
                  <br />
                  {store.address.city}, {store.address.state}
                </span>
              </p>
              <p className="flex gap-2.5">
                <Phone size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                <a href={`tel:${store.primary.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                  {store.primary.phone}
                </a>
              </p>
              <p className="flex gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                <a href={`mailto:${store.primary.email}`} className="hover:text-primary">
                  {store.primary.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {store.name}. Serving Kerala since{" "}
            {new Date(store.foundedOn).getFullYear()}.
          </p>
          <p>All prices are indicative and subject to change. {store.hours}.</p>
        </div>
      </div>
    </footer>
  );
}
