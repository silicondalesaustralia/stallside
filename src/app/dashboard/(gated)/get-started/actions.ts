"use server";

import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { loadSetupProgress } from "@/lib/onboarding/setup-progress";
import { GET_STARTED_PATH, markOnboardingComplete } from "@/lib/onboarding/onboarding-gate";

/** "Finish setup" needs at least one product; the other steps can wait. */
export async function finishOnboarding() {
  const { owner } = await requireOwnerWrite();
  const progress = await loadSetupProgress(owner);
  if (!progress.products) redirect(GET_STARTED_PATH);
  await markOnboardingComplete(owner.id);
  redirect("/dashboard");
}
