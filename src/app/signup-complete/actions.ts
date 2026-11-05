"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBillingCurrency } from "@/lib/saas-pricing";
import { requireUser } from "@/lib/session";

const WELCOME_FREE_PATH = "/dashboard";
const WHY_PRO_PATH = "/dashboard/why-pro";

/** Straight to Pro checkout for "Choose Pro" signups; otherwise the Pro plans page. */
function proDestination(formData: FormData): string {
  if (formData.get("direct") !== "1") return WHY_PRO_PATH;
  const qs = new URLSearchParams({ plan: "pro" });
  const currency = String(formData.get("currency") ?? "");
  if (isBillingCurrency(currency)) qs.set("currency", currency);
  if (formData.get("interval") === "year") qs.set("interval", "year");
  return `/dashboard/settings/billing?${qs.toString()}`;
}

/**
 * Records the one-time welcome choice, then continues. A failed write is logged
 * and never blocks the user; viewing Pro plans never starts checkout.
 */
export async function chooseWelcome(formData: FormData) {
  const user = await requireUser();
  const choice = formData.get("choice") === "pro" ? "pro" : "free";
  try {
    await prisma.owner.updateMany({
      where: { userId: user.id, welcomeChoiceAt: null },
      data: { welcomeChoice: choice, welcomeChoiceAt: new Date() },
    });
  } catch (error) {
    console.error("signup-complete: welcome choice could not be saved", { userId: user.id, choice, error });
  }
  redirect(choice === "pro" ? proDestination(formData) : WELCOME_FREE_PATH);
}
