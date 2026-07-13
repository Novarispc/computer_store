import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { saveUpload, type UploadTarget } from "@/lib/uploads";

/**
 * Image intake for the admin panel.
 *
 * Node runtime, not edge: it writes to the filesystem. Guarded by isAdmin()
 * directly — src/proxy.ts only matches /admin/*, so an API route under /api
 * must check for itself.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Expected a file upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file received." }, { status: 400 });
  }

  const kind = String(form.get("kind") ?? "product");
  const name = String(form.get("name") ?? "");

  let target: UploadTarget;
  if (kind === "brand") {
    if (name !== "mascot" && name !== "logo-full") {
      return NextResponse.json({ ok: false, error: "Unknown brand asset." }, { status: 400 });
    }
    target = { kind: "brand", name };
  } else if (kind === "media") {
    // Constrain the filename: this becomes a path segment on disk.
    const safe = name.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "media";
    target = { kind: "media", name: safe };
  } else {
    target = { kind: "product" };
  }

  try {
    const result = await saveUpload(file, target);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    // Belt and suspenders: saveUpload() shouldn't throw (every branch returns
    // a result), but if something unexpected does slip through, the client
    // must still get clean JSON — not a raw 500 that fails res.json() and
    // shows up as a confusing "check your connection" message.
    return NextResponse.json(
      { ok: false, error: "Something went wrong saving that image. Please try again." },
      { status: 500 }
    );
  }
}
