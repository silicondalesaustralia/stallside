import type Stripe from "stripe";

const LABELS: Record<string, string> = {
  "individual.dob.day": "Date of birth",
  "individual.dob.month": "Date of birth",
  "individual.dob.year": "Date of birth",
  "individual.first_name": "Legal first name",
  "individual.last_name": "Legal last name",
  "individual.email": "Email address",
  "individual.phone": "Phone number",
  "individual.address.line1": "Home or business address",
  "individual.address.city": "City",
  "individual.address.state": "State",
  "individual.address.postal_code": "Postcode",
  "individual.id_number": "ID verification",
  "individual.verification.document": "Photo ID",
  "individual.verification.additional_document": "Additional ID document",
  "company.tax_id": "Business tax ID",
  "company.address.line1": "Business address",
  "company.phone": "Business phone",
  "business_profile.url": "Business website or social link",
  "business_profile.mcc": "Business category",
  "external_account": "Bank account for payouts",
  "tos_acceptance.date": "Terms of service acceptance",
  "representative.dob.day": "Representative date of birth",
  "representative.address.line1": "Representative address",
  "representative.first_name": "Representative first name",
  "representative.last_name": "Representative last name",
};

function labelForRequirement(key: string): string {
  if (LABELS[key]) return LABELS[key];
  if (key.includes("external_account")) return "Bank account for payouts";
  if (key.includes("dob")) return "Date of birth";
  if (key.includes("address")) return "Address";
  if (key.includes("verification.document")) return "Photo ID";
  const tail = key.split(".").pop() ?? key;
  return tail.replaceAll("_", " ");
}

/** Human-readable list of outstanding Stripe Connect requirements. */
export function summarizeStripeRequirements(
  account: Pick<Stripe.Account, "requirements">,
): string[] {
  const reqs = account.requirements;
  if (!reqs) return [];

  const keys = [
    ...(reqs.past_due ?? []),
    ...(reqs.currently_due ?? []),
  ];
  const seen = new Set<string>();
  const labels: string[] = [];

  for (const key of keys) {
    const label = labelForRequirement(key);
    const norm = label.toLowerCase();
    if (seen.has(norm)) continue;
    seen.add(norm);
    labels.push(label);
    if (labels.length >= 5) break;
  }

  return labels;
}
