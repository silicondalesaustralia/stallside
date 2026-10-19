"use server";

import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { updateOwnerCustomerNotes } from "@/lib/customers/service";

export async function updateCustomerNotes(
  customerId: string,
  formData: FormData,
) {
  const { owner } = await requireOwnerWrite();
  const saved = await updateOwnerCustomerNotes(
    owner.id,
    customerId,
    String(formData.get("notes") ?? ""),
  );
  if (!saved) redirect("/dashboard/customers");
  redirect(`/dashboard/customers/${customerId}?saved=1`);
}
