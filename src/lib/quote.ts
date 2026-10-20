import "server-only";

import { prisma } from "@/lib/prisma";

const QUOTE_REF = /^ESQ-[A-Z0-9]{16}$/;

/** Public bearer lookup with a strict reference shape and minimum data projection. */
export async function getQuoteByRef(ref: string) {
  if (!QUOTE_REF.test(ref)) return null;

  return prisma.enquiry.findFirst({
    where: { ref, kind: "QUOTE" },
    select: {
      ref: true,
      items: {
        select: {
          id: true,
          name: true,
          unitPriceMinor: true,
          quantity: true,
        },
      },
    },
  });
}
