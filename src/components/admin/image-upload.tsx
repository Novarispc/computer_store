"use client";

import { useRef, useState } from "react";
import { ImageUp, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "product" | "brand" | "media";

/**
 * Picks a file, posts it to /api/admin/upload, and hands back the stored URL.
 * The parent decides what to do with that URL — it is never written to the
 * database from here.
 */
export function ImageUpload({
  value,
  onChange,
  kind = "product",
  name,
  label = "Image",
  hint,
  previewClassName,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  kind?: Kind;
  /** Required for brand assets ("mascot" | "logo-full") and media. */
  name?: string;
  label?: string;
  hint?: string;
  previewClassName?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", kind);
      if (name) body.append("name", name);

      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = (await res.json()) as { ok: boolean; url?: string; error?: string };

      if (!res.ok || !json.ok || !json.url) {
        setError(json.error ?? "Upload failed.");
        return;
      }
      // Every upload gets a unique URL now, so no cache-busting is needed.
      onChange(json.url);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>

      <div className="flex items-start gap-4">
        <div
          className={cn(
            "chamfer-sm flex size-24 shrink-0 items-center justify-center overflow-hidden bg-muted ring-1 ring-inset ring-border",
            previewClassName
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <ImageUp size={20} className="text-muted-foreground" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="chamfer-sm inline-flex items-center gap-2 bg-muted px-3 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
            >
              {busy ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <ImageUp size={13} aria-hidden />}
              {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
            </button>

            {value ? (
              <button
                type="button"
                onClick={() => onChange(null)}
                disabled={busy}
                className="chamfer-sm inline-flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground ring-1 ring-inset ring-border hover:text-danger"
              >
                <X size={13} aria-hidden />
                Remove
              </button>
            ) : null}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {hint ?? "PNG, JPG or WebP, up to 5 MB."}
          </p>

          {error ? (
            <p role="alert" className="mt-1 text-xs text-danger">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
