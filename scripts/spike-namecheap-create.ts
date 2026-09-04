/**
 * Optional Sandbox create — proves seller-as-registrant.
 *
 *   NAMECHEAP_SPIKE_ALLOW_CREATE=1 npx tsx scripts/spike-namecheap-create.ts
 *   NAMECHEAP_SPIKE_VERIFY_DOMAIN=vendlspike….com npx tsx scripts/spike-namecheap-create.ts
 *
 * Uses a disposable .com (not Green Valley). Costs Sandbox balance.
 */
import "dotenv/config";
import {
  namecheapConfigured,
  namecheapEnvironment,
} from "../src/lib/domains/registrar/namecheap/config";
import { createNamecheapRegistrar } from "../src/lib/domains/registrar/namecheap/provider";
import type { RegistrantContact } from "../src/lib/domains/registrar/types";

const SELLER: RegistrantContact = {
  firstName: "Alex",
  lastName: "Seller",
  organization: "Green Valley Farm & Bakes Spike",
  email: "seller-spike@example.com",
  phone: "+61.412345678",
  address1: "1 Farm Gate Rd",
  city: "Adelaide",
  state: "SA",
  postalCode: "5000",
  country: "AU",
};

async function verify(domain: string) {
  const registrar = createNamecheapRegistrar();
  if (!registrar.getContacts) throw new Error("getContacts missing");
  const contacts = (await registrar.getContacts(domain)) as {
    registrantEmail?: string;
    registrantOrg?: string;
    registrantFirst?: string;
    registrantLast?: string;
  };
  const emailOk =
    (contacts.registrantEmail || "").toLowerCase() === SELLER.email.toLowerCase();
  const orgOk =
    (contacts.registrantOrg || "").toLowerCase() ===
    SELLER.organization!.toLowerCase();
  const nameOk =
    (contacts.registrantFirst || "").toLowerCase() ===
      SELLER.firstName.toLowerCase() &&
    (contacts.registrantLast || "").toLowerCase() ===
      SELLER.lastName.toLowerCase();
  // Hard gate: authorised person + email must match. Org is best-effort on .com.
  const pass = emailOk && nameOk;
  console.log(
    JSON.stringify({
      gate: pass
        ? "CUSTOMER_AS_REGISTRANT PASS"
        : "CUSTOMER_AS_REGISTRANT FAIL",
      domain,
      match: { email: emailOk, org: orgOk, name: nameOk },
    }),
  );
  process.exit(pass ? 0 : 1);
}

async function main() {
  if (namecheapEnvironment() !== "sandbox") {
    console.error("Refused: create spike is Sandbox-only");
    process.exit(1);
  }
  if (!namecheapConfigured()) {
    console.error("Namecheap not configured");
    process.exit(1);
  }

  const verifyDomain = process.env.NAMECHEAP_SPIKE_VERIFY_DOMAIN?.trim();
  if (verifyDomain) {
    await verify(verifyDomain);
    return;
  }

  if (process.env.NAMECHEAP_SPIKE_ALLOW_CREATE !== "1") {
    console.error(
      "Refused: set NAMECHEAP_SPIKE_ALLOW_CREATE=1 or NAMECHEAP_SPIKE_VERIFY_DOMAIN=",
    );
    process.exit(1);
  }

  const registrar = createNamecheapRegistrar();
  const label = `vendlspike${Date.now().toString(36)}`;
  const domain = `${label}.com`;

  const avail = await registrar.checkAvailability(domain);
  console.log("probe", domain, "available=", avail.available);
  if (!avail.available) {
    console.error("Probe domain not available — retry");
    process.exit(1);
  }

  const created = await registrar.registerDomain({
    domain,
    periodYears: 1,
    registrant: SELLER,
    idempotencyKey: `spike-${domain}`,
  });
  console.log("create", {
    domain,
    registrarDomainId: created.registrarDomainId,
    status: created.status,
  });
  await verify(domain);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
