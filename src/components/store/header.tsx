"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, Search, X, FileText } from "lucide-react";
import { LogoLockup } from "@/components/brand/logo";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { useCart, cartCount } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/brands", label: "Brands" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="chamfer-sm absolute -right-1.5 -top-1.5 flex min-w-[1.1rem] items-center justify-center bg-primary px-1 py-0.5 font-mono text-[0.6rem] font-bold text-primary-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header({ logoSrc }: { logoSrc?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = useCart((s) => s.items);
  const cartHydrated = useCart((s) => s.hydrated);
  const wishItems = useWishlist((s) => s.items);
  const wishHydrated = useWishlist((s) => s.hydrated);

  // Counts stay at 0 until the persisted store rehydrates, so the server HTML
  // and the first client render agree.
  const quoteCount = cartHydrated ? cartCount(items) : 0;
  const savedCount = wishHydrated ? wishItems.length : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border">
      <div className="glass">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <LogoLockup src={logoSrc} />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "chamfer-sm px-3 py-2 text-sm font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/products"
              aria-label="Search products"
              className="chamfer-sm inline-flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <Search size={18} aria-hidden />
            </Link>

            <ModeToggle className="chamfer-sm inline-flex size-10 items-center justify-center text-muted-foreground hover:text-foreground" />

            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${savedCount} items`}
              className="chamfer-sm relative inline-flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <Heart size={18} aria-hidden />
              <CountBadge count={savedCount} />
            </Link>

            <Link
              href="/cart"
              aria-label={`Quote list, ${quoteCount} items`}
              className="chamfer-sm relative inline-flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <FileText size={18} aria-hidden />
              <CountBadge count={quoteCount} />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="chamfer-sm inline-flex size-10 items-center justify-center text-muted-foreground hover:text-foreground lg:hidden"
            >
              {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            </button>
          </div>
        </div>

        {open ? (
          <nav className="border-t border-border px-4 pb-4 pt-2 lg:hidden" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
