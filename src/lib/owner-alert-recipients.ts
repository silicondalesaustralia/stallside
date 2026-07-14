/** Primary contact plus optional extra alert addresses, de-duplicated. */
export function ownerAlertRecipients(owner: {
  contactEmail: string;
  alertEmails?: string[] | null;
  user?: { email: string | null } | null;
}): string[] {
  const primary = (owner.contactEmail || owner.user?.email || "").trim();
  const emails = [primary, ...(owner.alertEmails ?? [])]
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.includes("@"));

  return [...new Set(emails)];
}
