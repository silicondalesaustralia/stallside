"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { dollarsToCents } from "@/lib/money";
import { issueGiftCard } from "@/lib/grow/gift-cards";

export async function issueGiftCardAction(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const amountCents = dollarsToCents(amountRaw || "0");
  const note = String(formData.get("note") ?? "").trim() || null;
  const customerId = String(formData.get("customerId") ?? "").trim() || null;

  const card = await issueGiftCard({
    ownerId: owner.id,
    amountCents,
    currency: owner.billingCurrency || "AUD",
    customerId,
    note,
  });

  revalidatePath("/dashboard/gift-cards");
  redirect(`/dashboard/gift-cards?issued=${encodeURIComponent(card.code)}`);
}
