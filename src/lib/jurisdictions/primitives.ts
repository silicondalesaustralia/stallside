/** Shared sentinels and enums. See content/jurisdictions/_schema/SCHEMA-LOCK.md */

export type CountryCode = "AU" | "US";

export type GateType =
  | "notification"
  | "registration"
  | "registration_or_notification"
  | "licence"
  | "permit"
  | "none";

export type RegulatorDeterminedBy =
  | "geography"
  | "sales_channel"
  | "food_risk"
  | "business_class";

/** Explicit regulator silence / inapplicability. Distinct from null (unresearched). */
export type ExplicitGap = "not_published" | "not_required" | "not_applicable";

export type Maybe<T> = T | ExplicitGap | null;

/** Boolean fields that can also be activity-conditional. */
export type MaybeConditional = boolean | "conditional" | ExplicitGap | null;

export type SourceEntry = {
  field: string;
  url: string;
  retrieved: string;
  tier: 1 | 2;
};

export type VicFoodClass = "1" | "2" | "3" | "3A" | "4";

export type ClassificationBlock = {
  system: "vic_food_act_classes" | ExplicitGap | null;
  classes: VicFoodClass[] | ExplicitGap | null;
  determined_by: "highest_risk_activity" | ExplicitGap | null;
  registration_classes: VicFoodClass[] | ExplicitGap | null;
  notification_classes: VicFoodClass[] | ExplicitGap | null;
  notes: string;
};
