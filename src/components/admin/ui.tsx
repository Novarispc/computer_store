import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("chamfer-frame chamfer")}>
      <div className={cn("chamfer bg-card", className)}>{children}</div>
    </div>
  );
}

export function StatTile({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href?: string;
}) {
  const body = (
    <AdminCard className="p-5">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </AdminCard>
  );
  return href ? (
    <Link href={href} className="block transition-opacity hover:opacity-80">
      {body}
    </Link>
  ) : (
    body
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function inputClass(extra?: string) {
  return cn(
    "chamfer-sm w-full bg-card px-3 py-2.5 text-sm outline-none ring-1 ring-inset ring-border focus:ring-primary",
    extra
  );
}

export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <AdminCard>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">{children}</table>
      </div>
    </AdminCard>
  );
}

export function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="border-b border-border px-4 py-3 font-mono text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-border px-4 py-3 align-middle", className)}>{children}</td>;
}
