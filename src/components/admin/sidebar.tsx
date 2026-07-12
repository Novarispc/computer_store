"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tags,
  LayoutTemplate,
  Settings,
  Wrench,
  Inbox,
  LogOut,
  ExternalLink,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import { Emblem } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { logout } from "@/server/admin/auth";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Tags },
  { href: "/admin/highlights", label: "Highlights", icon: Star },
  { href: "/admin/homepage", label: "Homepage", icon: LayoutTemplate },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/branding", label: "Branding", icon: ImageIcon },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({
  newEnquiries,
  logoSrc,
}: {
  newEnquiries: number;
  logoSrc?: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
        {logoSrc ? (
          // Uploaded logo-full art already bakes in the wordmark, same as the
          // storefront header — so no separate "ESQUIRE" text beside it here either.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} alt="Esquire Computers" className="h-10 w-auto" />
        ) : (
          <Emblem className="text-primary" size={24} />
        )}
        <div>
          {!logoSrc ? (
            <p className="font-display text-sm font-bold tracking-wide">ESQUIRE</p>
          ) : null}
          <p className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
            Admin
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "chamfer-sm flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} aria-hidden />
                {item.label}
              </span>
              {item.href === "/admin/enquiries" && newEnquiries > 0 ? (
                <span className="chamfer-sm bg-primary px-1.5 py-0.5 font-mono text-[0.6rem] font-bold text-primary-foreground">
                  {newEnquiries}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ExternalLink size={16} aria-hidden />
          View storefront
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-danger"
          >
            <LogOut size={16} aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
