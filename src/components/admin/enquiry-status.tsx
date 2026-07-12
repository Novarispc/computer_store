"use client";

import { useTransition } from "react";
import { updateEnquiryStatus } from "@/server/admin/enquiries";
import { ENQUIRY_STATUSES } from "@/lib/constants";
import { inputClass } from "@/components/admin/ui";

export function EnquiryStatus({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(() => {
          void updateEnquiryStatus(id, e.target.value);
        })
      }
      className={inputClass("w-auto")}
    >
      {ENQUIRY_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
