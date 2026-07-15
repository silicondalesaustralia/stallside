export const CONTACT_SUBJECTS = [
  "General",
  "Subscriptions",
  "Feature Request",
  "Support",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

const SLUG_TO_SUBJECT: Record<string, ContactSubject> = {
  general: "General",
  subscriptions: "Subscriptions",
  "feature-request": "Feature Request",
  support: "Support",
};

export function isContactSubject(value: string): value is ContactSubject {
  return (CONTACT_SUBJECTS as readonly string[]).includes(value);
}

export function contactSubjectFromParam(
  value: string | string[] | undefined,
): ContactSubject {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "General";
  const decoded = decodeURIComponent(raw).trim().toLowerCase();
  if (SLUG_TO_SUBJECT[decoded]) return SLUG_TO_SUBJECT[decoded];
  if (isContactSubject(raw)) return raw;
  return "General";
}
