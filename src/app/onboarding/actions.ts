"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createOwnerWithTrial } from "@/lib/owner-trial";
import { ensurePrimaryStand } from "@/lib/ensure-primary-stand";
import { dollarsToCents } from "@/lib/money";
import { uniqueProductSlug, slugify } from "@/lib/slug";
import {
  AU_STATES,
  FULFILMENT_INTENTS,
  SELL_CATEGORIES,
  defaultFulfilmentIntents,
  isBusinessMode,
  isOnboardingStep,
  nextOnboardingStep,
  type BusinessMode,
  type OnboardingStep,
} from "@/lib/business-mode";
import { DEFAULT_TIMEZONE } from "@/lib/stand-timezone";

async function loadOwnerForUser(userId: string) {
  return prisma.owner.findUnique({ where: { userId } });
}

function redirectStep(step: OnboardingStep) {
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

export async function saveBusinessProfile(formData: FormData) {
  const user = await requireUser();
  const owner = await loadOwnerForUser(user.id);
  if (!owner) redirectStep("mode");

  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "")
    .trim()
    .toLowerCase();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || null;
  const shortDescription =
    String(formData.get("shortDescription") ?? "").trim() || null;
  const suburb = String(formData.get("suburb") ?? "").trim() || null;
  const stateTerritory = String(formData.get("stateTerritory") ?? "").trim() || null;
  const postcode = String(formData.get("postcode") ?? "").trim() || null;
  const abn = String(formData.get("abn") ?? "").trim() || null;
  const timezone =
    String(formData.get("timezone") ?? "").trim() || DEFAULT_TIMEZONE;
  const gstRegistered = formData.get("gstRegistered") === "on";

  if (businessName.length < 2 || !contactEmail.includes("@")) {
    redirectStep("profile");
  }

  const validState = AU_STATES.some((s) => s.id === stateTerritory)
    ? stateTerritory
    : null;

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      businessName,
      contactEmail,
      contactPhone,
      shortDescription,
      suburb,
      stateTerritory: validState,
      postcode,
      abn,
      defaultTimezone: timezone,
      gstRegistered,
      country: "AU",
    },
  });

  redirectStep("sell");
}

export async function saveSellCategories(formData: FormData) {
  const user = await requireUser();
  const owner = await loadOwnerForUser(user.id);
  if (!owner) redirectStep("mode");

  const selected = formData.getAll("sellCategories").map(String);
  const allowed = new Set(SELL_CATEGORIES.map((c) => c.id));
  const sellCategories = selected.filter((id) => allowed.has(id));

  await prisma.owner.update({
    where: { id: owner.id },
    data: { sellCategories },
  });

  redirectStep("fulfilment");
}

export async function saveFulfilmentIntents(formData: FormData) {
  const user = await requireUser();
  const owner = await loadOwnerForUser(user.id);
  if (!owner) redirectStep("mode");

  const selected = formData.getAll("fulfilmentIntents").map(String);
  const allowed = new Set(FULFILMENT_INTENTS.map((f) => f.id));
  const fulfilmentIntents = selected.filter((id) => allowed.has(id));

  await prisma.owner.update({
    where: { id: owner.id },
    data: { fulfilmentIntents },
  });

  redirectStep("payments");
}

export async function skipOnboardingStep(formData: FormData) {
  const raw = String(formData.get("step") ?? "").trim();
  if (!isOnboardingStep(raw)) redirect("/onboarding");
  const next = nextOnboardingStep(raw);
  if (!next || next === "finish") {
    await finishOnboarding();
    return;
  }
  redirectStep(next);
}

export async function finishOnboarding() {
  const user = await requireUser();
  const owner = await loadOwnerForUser(user.id);
  if (!owner) redirectStep("mode");

  const mode = (owner.businessMode ?? "BOTH") as BusinessMode;
  if (mode === "FOOD_BUSINESS" || mode === "BOTH") {
    await ensurePrimaryStand(owner);
  }

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      onboardingCompletedAt: new Date(),
      businessMode: owner.businessMode ?? "BOTH",
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function saveThemeDefaults(formData: FormData) {
  const user = await requireUser();
  const owner = await loadOwnerForUser(user.id);
  if (!owner) redirectStep("mode");

  const brandAccentColor =
    String(formData.get("brandAccentColor") ?? "").trim() || null;
  const brandSecondaryColor =
    String(formData.get("brandSecondaryColor") ?? "").trim() || null;

  await prisma.owner.update({
    where: { id: owner.id },
    data: { brandAccentColor, brandSecondaryColor },
  });

  const stand = await ensurePrimaryStand({
    ...owner,
    brandAccentColor,
    brandSecondaryColor,
  });

  await prisma.stand.update({
    where: { id: stand.id },
    data: {
      accentColor: brandAccentColor,
      secondaryColor: brandSecondaryColor,
    },
  });

  redirectStep("finish");
}

export async function createFirstProduct(formData: FormData) {
  const user = await requireUser();
  const owner = await loadOwnerForUser(user.id);
  if (!owner) redirectStep("mode");

  const name = String(formData.get("name") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const description =
    String(formData.get("description") ?? "").trim() || null;
  const stockRaw = String(formData.get("stock") ?? "0").trim();

  if (name.length < 1) redirectStep("product");

  let priceCents = 0;
  try {
    priceCents = dollarsToCents(priceRaw || "0");
  } catch {
    redirectStep("product");
  }

  const stockQuantity = Math.max(0, Number.parseInt(stockRaw, 10) || 0);
  const stand = await ensurePrimaryStand(owner);

  const slug = await uniqueProductSlug(
    stand.id,
    slugify(name) || "product",
    async (standId, s) => {
      const found = await prisma.product.findFirst({
        where: { standId, slug: s },
        select: { id: true },
      });
      return Boolean(found);
    },
  );

  await prisma.product.create({
    data: {
      ownerId: owner.id,
      standId: stand.id,
      name,
      slug,
      description,
      priceCents,
      stockQuantity,
      currency: stand.currency,
      isActive: true,
    },
  });

  if (!owner.firstProductLiveAt) {
    await prisma.owner.update({
      where: { id: owner.id },
      data: { firstProductLiveAt: new Date() },
    });
  }

  redirectStep("theme");
}

/** Legacy fallback: simple owner create when User has no Owner. */
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
