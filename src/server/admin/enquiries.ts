"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ENQUIRY_STATUSES } from "@/lib/constants";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function listAdminEnquiries(params: { kind?: "QUOTE" | "CONTACT"; status?: string } = {}) {
  await requireAdmin();
  return prisma.enquiry.findMany({
    where: {
      ...(params.kind ? { kind: params.kind } : {}),
      ...(params.status ? { status: params.status } : {}),
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminEnquiry(id: string) {
  await requireAdmin();
  return prisma.enquiry.findUnique({ where: { id }, include: { items: true } });
}

export async function updateEnquiryStatus(id: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z.enum(ENQUIRY_STATUSES).safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid status." };

  await prisma.enquiry.update({ where: { id }, data: { status: parsed.data } });
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
  return { ok: true };
}
