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
      country: owner.country || "AU",
    },
  });

  redirectStep("profile");
}

/** Mandatory gate: name + location/state, then dashboard. */
export async function saveBusinessProfile(formData: FormData) {
  const user = await requireUser();
  const owner = await loadOwnerForUser(user.id);
  if (!owner) redirectStep("mode");

  const businessName = String(formData.get("businessName") ?? "").trim();
  const suburb = String(formData.get("suburb") ?? "").trim() || null;
  const stateTerritory =
    String(formData.get("stateTerritory") ?? "").trim() || null;
  const postcode = String(formData.get("postcode") ?? "").trim() || null;
  const timezone =
    String(formData.get("timezone") ?? "").trim() || DEFAULT_TIMEZONE;

  if (businessName.length < 2) redirectStep("profile");

  const validState = AU_STATES.some((s) => s.id === stateTerritory)
    ? stateTerritory
    : null;
  if (!validState) redirectStep("profile");

  const mode = (owner.businessMode ?? "BOTH") as BusinessMode;

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      businessName,
      suburb,
      stateTerritory: validState,
      postcode,
      defaultTimezone: timezone,
      country: "AU",
      contactEmail: owner.contactEmail || user.email || owner.contactEmail,
    },
  });

  const refreshed = await prisma.owner.findUniqueOrThrow({
    where: { id: owner.id },
  });

  // Food / Both: create catalogue container now so the dashboard has a live shop URL.
  if (mode === "FOOD_BUSINESS" || mode === "BOTH") {
    await ensurePrimaryStand(refreshed);
  }

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
