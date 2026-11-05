"use server";

import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { DFY_BUILD_PATH, dfyBuildCurrency } from "@/lib/website/dfy-build";
import { startDfyBuildCheckout } from "@/lib/website/dfy-build-checkout";

const HOSTNAME_RE = /^(?=.{3,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

function cleanDomain(raw: FormDataEntryValue | null): string | null {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
  if (!value) return "";
  return HOSTNAME_RE.test(value) ? value : null;
}

export async function buyDfyBuild(formData: FormData) {
  const { owner, user, impersonator } = await requireOwner();
  if (impersonator) redirect(`${DFY_BUILD_PATH}?error=impersonating`);
  const domain = cleanDomain(formData.get("domain"));
  if (domain === null) redirect(`${DFY_BUILD_PATH}?error=domain`);

  let checkoutUrl: string;
  try {
    checkoutUrl = await startDfyBuildCheckout(
      {
        id: owner.id,
        currency: dfyBuildCurrency(owner.billingCurrency),
        email: user.email ?? owner.contactEmail ?? undefined,
        name: owner.businessName,
        stripeCustomerId: owner.stripeCustomerId,
      },
      domain,
    );
  } catch (err) {
    console.error("[dfyBuild] checkout failed", { ownerId: owner.id, err });
    redirect(`${DFY_BUILD_PATH}?error=checkout`);
  }
  redirect(checkoutUrl);
}
