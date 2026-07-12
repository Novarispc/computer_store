"use client";

import { useActionState } from "react";
import { login, type LoginResult } from "@/server/admin/auth";
import { Button } from "@/components/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginResult | null, FormData>(
    async (_prev, formData) => login(formData),
    null
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <div className="chamfer-frame chamfer-sm">
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            className="chamfer-sm w-full bg-card px-3 py-2.5 text-sm outline-none"
          />
        </div>
      </div>

      {state && !state.ok ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
