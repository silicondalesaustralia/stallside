/** Buy-a-Domain search (Namecheap) — launch TLDs only. */

import { createNamecheapRegistrar } from "./namecheap/provider";
import { namecheapConfigured } from "./namecheap/config";
import { domainSearchEnabled } from "../config";
import { retailFromRegistrarUsd } from "./retail-pricing";
import type { AvailabilityResult, MoneyCents } from "./types";

export const LAUNCH_TLDS = ["com.au", "com", "net.au"] as const;

export type DomainSearchHit = AvailabilityResult & {
  registration?: MoneyCents;
  renewal?: MoneyCents;
  retailRegistration?: MoneyCents;
  retailRenewal?: MoneyCents;
};

function normalizeLabel(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "")
    .split(".")[0]!
    .replace(/[^a-z0-9-]/g, "");
}

export async function searchLaunchDomains(
  query: string,
): Promise<DomainSearchHit[]> {
  if (!domainSearchEnabled()) {
    throw new Error("Domain search is not enabled");
  }
  if (!namecheapConfigured()) {
    throw new Error("Registrar is not configured");
  }
  const label = normalizeLabel(query);
  if (!label || label.length < 2) {
    throw new Error("Enter at least 2 characters");
  }

  const registrar = createNamecheapRegistrar();
  const hits: DomainSearchHit[] = [];
  for (const tld of LAUNCH_TLDS) {
    const domain = `${label}.${tld}`;
    const avail = await registrar.checkAvailability(domain);
    let registration: MoneyCents | undefined;
    let renewal: MoneyCents | undefined;
    let retailRegistration: MoneyCents | undefined;
    let retailRenewal: MoneyCents | undefined;
    if (avail.available && !avail.premium) {
      try {
        registration = await registrar.getRegistrationPrice(domain, 1);
        renewal = await registrar.getRenewalPrice(domain, 1);
        retailRegistration = retailFromRegistrarUsd(registration).retail;
        retailRenewal = retailFromRegistrarUsd(renewal).retail;
      } catch {
        /* pricing optional */
      }
    }
    hits.push({
      ...avail,
      registration,
      renewal,
      retailRegistration,
      retailRenewal,
    });
  }
  return hits;
}
