import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { nanoid } from "nanoid";

/**
 * Image intake. Everything here runs on the server: a file input is trivially
 * bypassed, so the type, the size and the destination are all decided here and
 * never taken from the client.
 *
 * Storage backend is chosen by environment, not by branching call sites:
 *   - `BLOB_READ_WRITE_TOKEN` present  → Vercel Blob (production). The runtime
 *     filesystem on Vercel is read-only, so writing to public/ would fail.
 *   - token absent                     → local public/ folder (zero-config dev).
 *
 * Either way the caller gets back a URL string and never needs to know which.
 * Because both backends return a unique URL per upload, discovery of "which
 * logo is current" lives in the database (Setting rows), not in fixed filenames
 * on a disk that doesn't persist on Vercel.
 *
 * SVG is deliberately NOT accepted. An SVG is a script-bearing document; served
 * from our own origin it would be a stored-XSS vector. Raster only.
 */

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

/** Magic bytes, because a Content-Type header is just a claim. */
function sniff(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  const b = bytes;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

export type UploadTarget =
  | { kind: "product" }
  | { kind: "brand"; name: "mascot" | "logo-full" }
  | { kind: "media"; name: string };

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

function baseName(target: UploadTarget): string {
  if (target.kind === "brand") return `brand-${target.name}`;
  if (target.kind === "media") return target.name;
  return "product";
}

export async function saveUpload(file: File, target: UploadTarget): Promise<UploadResult> {
  if (!file || typeof file.arrayBuffer !== "function") {
    return { ok: false, error: "No file received." };
  }
  if (file.size === 0) return { ok: false, error: "That file is empty." };
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "That image is over 5 MB. Please resize it and try again." };
  }

  const declared = ALLOWED[file.type];
  if (!declared) {
    return { ok: false, error: "Use a PNG, JPG or WebP image." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const actual = sniff(bytes);
  if (!actual || actual !== declared) {
    return { ok: false, error: "That file is not the image type it claims to be." };
  }

  const filename = `${baseName(target)}-${nanoid(10)}.${actual}`;

  // Production: Vercel Blob.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const { url } = await put(`esquire/${filename}`, Buffer.from(bytes), {
        access: "public",
        contentType: MIME_BY_EXT[actual],
        addRandomSuffix: false,
      });
      return { ok: true, url };
    } catch {
      return { ok: false, error: "Could not store the image. Please try again." };
    }
  }

  // Running on Vercel with no Blob token: the local-write fallback below would
  // hit Vercel's read-only filesystem and throw uncaught, which surfaces to
  // the browser as a broken non-JSON response ("check your connection") with
  // no clue what actually went wrong. Fail fast with the real reason instead.
  if (process.env.VERCEL) {
    return {
      ok: false,
      error:
        "Image uploads aren't configured yet — connect a Blob store to this project " +
        "(Vercel dashboard → Storage → Create Blob) and redeploy.",
    };
  }

  // Local dev: write under public/ so the same URLs resolve without Blob.
  try {
    const dir = target.kind === "brand" ? "brand" : "uploads";
    const absDir = join(process.cwd(), "public", dir);
    await mkdir(absDir, { recursive: true });
    await writeFile(join(absDir, filename), bytes);
    return { ok: true, url: `/${dir}/${filename}` };
  } catch {
    return { ok: false, error: "Could not save the file locally. Please try again." };
  }
}

/**
 * True for a URL this app produced: a site-relative upload path (local dev) or a
 * Vercel Blob URL (production). Rejects arbitrary remote URLs, so an admin form
 * can never embed an off-site image.
 */
export function isOwnUploadUrl(url: string): boolean {
  if (/^\/(uploads|brand)\/[A-Za-z0-9._-]+$/.test(url)) return true;
  try {
    const host = new URL(url).host;
    return url.startsWith("https://") && host.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}
