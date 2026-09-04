"use server";

import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import {
  DomainPurchaseError,
  startDomainPurchaseCheckout,
} from "@/lib/domains/purchase-checkout";
import type { AuEligibility, RegistrantContact } from "@/lib/domains/registrar/types";
import { domainTld } from "@/lib/domains/registrar/namecheap/au-attrs";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function startDomainCheckoutAction(formData: FormData) {
  const { owner, user } = await requireOwnerWrite();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const domain = field(formData, "domain").toLowerCase();
  const tld = domainTld(domain);

  const registrant: RegistrantContact = {
    firstName: field(formData, "firstName"),
    lastName: field(formData, "lastName"),
    organization: field(formData, "organization") || undefined,
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    address1: field(formData, "address1"),
    address2: field(formData, "address2") || undefined,
    city: field(formData, "city"),
    state: field(formData, "state") || undefined,
    postalCode: field(formData, "postalCode"),
    country: field(formData, "country") || "AU",
  };

  let au: AuEligibility | undefined;
  if (tld === "com.au" || tld === "net.au") {
    au = {
      eligibilityType: field(formData, "eligibilityType") || "Company",
      eligibilityId: field(formData, "eligibilityId"),
      eligibilityIdType: field(formData, "eligibilityIdType") || "ABN",
      eligibilityName: field(formData, "organization") || undefined,
    };
  }

  try {
    const { checkoutUrl } = await startDomainPurchaseCheckout({
      ownerId: owner.id,
      storefrontId: storefront.id,
      ownerEmail: user.email ?? null,
      domain,
      registrant,
      au,
    });
    redirect(checkoutUrl);
  } catch (e) {
    if (e instanceof DomainPurchaseError) {
      redirect(
        `/dashboard/website/domains/buy?domain=${encodeURIComponent(domain)}&error=${encodeURIComponent(e.code)}`,
      );
    }
    throw e;
  }
}
