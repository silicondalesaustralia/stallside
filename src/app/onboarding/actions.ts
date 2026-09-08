"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createOwnerWithTrial } from "@/lib/owner-trial";
import { ensurePrimaryStand } from "@/lib/ensure-primary-stand";
import {
  AU_STATES,
  defaultFulfilmentIntents,
  isBusinessMode,
  type BusinessMode,
  type OnboardingStep,
} from "@/lib/business-mode";
import { DEFAULT_TIMEZONE } from "@/lib/stand-timezone";
import {
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";
import { countryFromBillingCurrency } from "@/lib/commerce/payment-rail";

async function loadOwnerForUser(userId: string) {
  return prisma.owner.findUnique({ where: { userId } });
}

function redirectStep(step: OnboardingStep): never {
  redirect(`/onboarding?step=${step}`);
}

export async function saveBusinessMode(formData: FormData) {
  const user = await requireUser();
  const mode = String(formData.get("businessMode") ?? "").trim();
  if (!isBusinessMode(mode)) redirectStep("mode");

  let owner = await loadOwnerForUser(user.id);
  if (!owner) {
    owner = await createOwnerWithTrial({
      userId: user.id,
      name: user.name ?? "My business",
      email: user.email ?? "",
    });
  }

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      businessMode: mode,
      fulfilmentIntents: defaultFulfilmentIntents(mode),
    },
  });

  redirectStep("region");
}

export async function saveBillingRegion(formData: FormData) {
  const user = await requireUser();
  const owner = await loadOwnerForUser(user.id);
  if (!owner) redirectStep("mode");

  const raw = String(formData.get("billingCurrency") ?? "")
    .trim()
    .toUpperCase();
  if (!isBillingCurrency(raw)) redirectStep("region");
  const billingCurrency: BillingCurrency = raw;

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      billingCurrency,
      country: countryFromBillingCurrency(billingCurrency),
    },
  });

  redirectStep("profile");
}

/** Mandatory gate: name + location, then dashboard. */
export async function saveBusinessProfile(formData: FormData) {
  const user = await requireUser();
  const owner = await loadOwnerForUser(user.id);
  if (!owner) redirectStep("mode");
  if (!owner.billingCurrency) redirectStep("region");

  const businessName = String(formData.get("businessName") ?? "").trim();
  const suburb = String(formData.get("suburb") ?? "").trim() || null;
  const stateTerritory =
    String(formData.get("stateTerritory") ?? "").trim() || null;
  const postcode = String(formData.get("postcode") ?? "").trim() || null;
  const timezone =
    String(formData.get("timezone") ?? "").trim() || DEFAULT_TIMEZONE;

  if (businessName.length < 2) redirectStep("profile");

  const isAud = (owner.billingCurrency ?? "AUD").toUpperCase() === "AUD";
  const validState = AU_STATES.some((s) => s.id === stateTerritory)
    ? stateTerritory
    : null;
  if (isAud && !validState) redirectStep("profile");

  const mode = (owner.businessMode ?? "BOTH") as BusinessMode;
  const billingCurrency = isBillingCurrency(owner.billingCurrency)
    ? owner.billingCurrency
    : "AUD";

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      businessName,
      suburb,
      stateTerritory: isAud ? validState : stateTerritory,
      postcode,
      defaultTimezone: timezone,
      country: countryFromBillingCurrency(billingCurrency),
      contactEmail: owner.contactEmail || user.email || owner.contactEmail,
    },
  });

  const refreshed = await prisma.owner.findUniqueOrThrow({
    where: { id: owner.id },
  });

  if (mode === "FOOD_BUSINESS" || mode === "BOTH") {
    await ensurePrimaryStand(refreshed);
  } else {
    // Still sync primary stand currency if one already exists
    await prisma.stand.updateMany({
      where: { ownerId: owner.id },
      data: { currency: billingCurrency },
    });
  }

  // Keep stand currency aligned with billing region for new accounts
  await prisma.stand.updateMany({
    where: { ownerId: owner.id },
    data: { currency: billingCurrency },
  });

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      onboardingCompletedAt: new Date(),
      businessMode: mode,
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/** Legacy fallback when User has no Owner row. */
export async function completeOnboarding(formData: FormData) {
  const user = await requireUser();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "")
    .trim()
    .toLowerCase();
  const contactPhone =
    String(formData.get("contactPhone") ?? "").trim() || null;

  if (businessName.length < 2 || !contactEmail.includes("@")) {
    redirect("/onboarding");
  }

  const existing = await prisma.owner.findUnique({ where: { userId: user.id } });
  if (existing) {
    await prisma.owner.update({
      where: { id: existing.id },
      data: { businessName, contactEmail, contactPhone },
    });
  } else {
    await createOwnerWithTrial({
      userId: user.id,
      name: businessName,
      email: contactEmail,
    });
    if (contactPhone) {
      await prisma.owner.update({
        where: { userId: user.id },
        data: { contactPhone },
      });
    }
  }

  redirect("/onboarding?step=mode");
}
