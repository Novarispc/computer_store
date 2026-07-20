"use server";

import { z } from "zod";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkPublicSubmissionLimit } from "@/lib/rate-limit";

/**
 * Both the contact form and the quote checkout land here. A CONTACT enquiry has
 * no items; a QUOTE enquiry snapshots each line so the record survives a product
 * being edited or deleted later.
 *
 * Prices are never trusted from the client — they are re-read from the database.
 */

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.email("That email address does not look right").max(120),
  phone: z.string().trim().min(7, "A phone number helps us respond faster").max(24),
  company: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Add a short message").max(2000),
  // Hidden from people, filled by basic bots.
  website: z.string().trim().max(0).optional(),
});

const QuoteSchema = ContactSchema.extend({
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().min(1).max(999),
      })
    )
    .min(1, "Your quote list is empty")
    .refine((items) => new Set(items.map((item) => item.slug)).size === items.length, "Duplicate products are not allowed"),
});

export type ActionResult =
  | { ok: true; ref: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function fail(error: string, fieldErrors?: Record<string, string[]>): ActionResult {
  return { ok: false, error, fieldErrors };
}

async function publicSubmissionLimit(kind: "contact" | "quote"): Promise<ActionResult | null> {
  const requestHeaders = await headers();
  const address =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip");

  // Local development and unusual proxies may not expose an address.
  if (!address) return null;

  const result = await checkPublicSubmissionLimit(kind + ":" + address);
  return result.allowed
    ? null
    : fail("Too many requests. Please try again in " + result.retryAfterSeconds + " seconds.");
}

/** Short, human-quotable reference: ESQ-8F3K2M. */
function makeRef(): string {
  // This reference is shown in a public URL, so it is an unguessable bearer value.
  return `ESQ-${nanoid(16).toUpperCase().replace(/[^A-Z0-9]/g, "X")}`;
}

export async function createContactEnquiry(formData: FormData): Promise<ActionResult> {
  const parsed = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company") ?? "",
    city: formData.get("city") ?? "",
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return fail("Please check the highlighted fields.", z.flattenError(parsed.error).fieldErrors);
  }

  const d = parsed.data;
  const limitFailure = await publicSubmissionLimit("contact");
  if (limitFailure) return limitFailure;

  const enquiry = await prisma.enquiry.create({
    data: {
      ref: makeRef(),
      kind: "CONTACT",
      status: "NEW",
      name: d.name,
      email: d.email,
      phone: d.phone,
      company: d.company || null,
      city: d.city || null,
      message: d.message,
    },
  });

  revalidatePath("/admin/enquiries");
  return { ok: true, ref: enquiry.ref };
}

export async function createQuoteEnquiry(input: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  city?: string;
  message?: string;
  items: { slug: string; quantity: number }[];
}): Promise<ActionResult> {
  const parsed = QuoteSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please check the highlighted fields.", z.flattenError(parsed.error).fieldErrors);
  }
  const d = parsed.data;
  const limitFailure = await publicSubmissionLimit("quote");
  if (limitFailure) return limitFailure;

  // Re-read prices server-side. A client could otherwise post any figure.
  const slugs = d.items.map((i) => i.slug);
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, active: true },
    select: { id: true, slug: true, name: true, model: true, priceMinor: true },
  });

  if (products.length !== slugs.length) {
    return fail("One or more products are no longer available. Please rebuild your list.");
  }

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items = d.items.flatMap((i) => {
    const p = bySlug.get(i.slug);
    if (!p) return [];
    return [
      {
        productId: p.id,
        name: p.name,
        model: p.model,
        unitPriceMinor: p.priceMinor,
        quantity: i.quantity,
      },
    ];
  });

  const enquiry = await prisma.enquiry.create({
    data: {
      ref: makeRef(),
      kind: "QUOTE",
      status: "NEW",
      name: d.name,
      email: d.email,
      phone: d.phone,
      company: d.company || null,
      city: d.city || null,
      message: d.message || null,
      items: { create: items },
    },
  });

  revalidatePath("/admin/enquiries");
  return { ok: true, ref: enquiry.ref };
}

export async function getEnquiryByRef(ref: string) {
  return prisma.enquiry.findUnique({ where: { ref }, include: { items: true } });
}
