import type { BriefData } from "./schema";

/** Fields a build needs before it can start; empty means ready. */
export function briefMissingFields(brief: BriefData): string[] {
  const missing: string[] = [];
  if (!brief.business.name.trim()) missing.push("Business name");
  const described =
    brief.business.description.trim().length >= 20 || brief.business.offering.trim().length >= 20;
  if (!described) missing.push("A short description of what you sell or do");
  if (!brief.business.primaryGoal) missing.push("The main goal of your website");
  return missing;
}
