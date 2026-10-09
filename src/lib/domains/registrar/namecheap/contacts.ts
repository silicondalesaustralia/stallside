/** Map Vendl contacts → Namecheap XML contact params (internal). */

import type { RegistrantContact } from "../types";

type Role = "Registrant" | "Admin" | "Tech" | "AuxBilling";

function roleParams(role: Role, c: RegistrantContact): Record<string, string> {
  const out: Record<string, string> = {
    [`${role}FirstName`]: c.firstName,
    [`${role}LastName`]: c.lastName,
    [`${role}Address1`]: c.address1,
    [`${role}City`]: c.city,
    [`${role}StateProvince`]: c.state || c.city,
    [`${role}PostalCode`]: c.postalCode,
    [`${role}Country`]: c.country,
    [`${role}Phone`]: c.phone,
    [`${role}EmailAddress`]: c.email,
  };
  if (c.organization) out[`${role}OrganizationName`] = c.organization;
  if (c.address2) out[`${role}Address2`] = c.address2;
  return out;
}

/** Default: seller on all four roles (Admin/Tech/Billing may match Registrant). */
export function namecheapContactParams(input: {
  registrant: RegistrantContact;
  admin?: RegistrantContact;
  tech?: RegistrantContact;
  billing?: RegistrantContact;
}): Record<string, string> {
  return {
    ...roleParams("Registrant", input.registrant),
    ...roleParams("Admin", input.admin || input.registrant),
    ...roleParams("Tech", input.tech || input.registrant),
    ...roleParams("AuxBilling", input.billing || input.registrant),
  };
}
