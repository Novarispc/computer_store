import { Emblem } from "@/components/brand/logo";
import { LoginForm } from "@/components/admin/login-form";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Emblem className="text-primary" size={36} />
          <div>
            <p className="font-display text-lg font-bold tracking-wide">ESQUIRE</p>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
              Admin access
            </p>
          </div>
        </div>

        <div className="chamfer-frame chamfer glow-edge">
          <div className="chamfer bg-card p-7">
            <LoginForm next={next ?? "/admin"} />
          </div>
        </div>
      </div>
    </div>
  );
}
