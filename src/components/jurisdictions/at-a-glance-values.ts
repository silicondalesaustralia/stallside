import type { JurisdictionRecord } from "@/lib/jurisdictions/types";
import { formatFee } from "@/lib/jurisdictions/paths";

/** Value formatters for the SA yardstick At a glance table. */

export function gateLabel(record: JurisdictionRecord): string {
  if (record.gate.mechanism) {
    const first = record.gate.mechanism.split(".")[0]?.trim();
    if (first && first.length <= 90) return first;
  }
  const labels: Record<string, string> = {
    notification: "Food business notification",
    registration: "Food business registration",
    registration_or_notification: "Registration or notification (by risk or class)",
    licence: "Food business licence",
    permit: "Permit",
    none: "No permit (cottage food exemption)",
  };
  return labels[record.gate.type] ?? record.gate.type;
}

export function whoYouNotify(record: JurisdictionRecord): string {
  const primary = record.gate.regulator_primary;
  if (record.gate.regulator_fallback) {
    return `Usually ${primary} (${record.gate.regulator_fallback} in limited cases)`;
  }
  return primary;
}

export function feeValue(record: JurisdictionRecord): string {
  if (record.gate.fee === 0) return "Nil";
  if (record.gate.fee_notes && record.gate.fee === "not_published") {
    return record.gate.fee_notes;
  }
  return formatFee(record);
}

export function whenValue(record: JurisdictionRecord): string {
  if (record.gate.timing && record.gate.timing !== "not_applicable") {
    const t = record.gate.timing;
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  if (record.gate.type === "none") return "No gate timing (exemption regime)";
  return "Confirm with the regulator";
}

export function licenceValue(record: JurisdictionRecord): string {
  const labels: Record<string, string> = {
    none: "No. Cottage food exemption is the main gate",
    notification: "No. Notification is the main state food-business gate",
    registration: "No general licence beyond registration",
    registration_or_notification:
      "Depends on class: registration or notification, not a separate general licence",
    licence: "Yes, where the activity is a licensable food business",
    permit: "Yes, a permit is required",
  };
  return labels[record.gate.type] ?? "Confirm with the regulator";
}

export function salesCapValue(record: JurisdictionRecord): string {
  const cap = record.scope.sales_cap;
  if (typeof cap === "number") {
    const prefix = record.country === "US" ? "US$" : "A$";
    const locale = record.country === "US" ? "en-US" : "en-AU";
    const basis =
      record.scope.sales_cap_basis === "gross"
        ? " gross"
        : record.scope.sales_cap_basis === "net"
          ? " net"
          : "";
    return `${prefix}${cap.toLocaleString(locale)}${basis} per year`;
  }
  if (cap === "not_required") {
    return "None under the published cottage food rules";
  }
  if (
    cap === "not_applicable" ||
    record.scope.sales_cap_basis === "not_applicable"
  ) {
    return `None under the ${record.name} system`;
  }
  return "Not published by the regulator";
}

export function approvedListValue(record: JurisdictionRecord): string {
  if (record.scope.approved_food_list === true) {
    return "Yes. An approved (or allowed) foods list applies";
  }
  if (
    record.scope.approved_food_list === false ||
    record.scope.approved_food_list === "not_applicable"
  ) {
    return record.country === "US"
      ? "None published as a closed list for this regime"
      : "None. The Food Standards Code applies according to the food and activity";
  }
  return "Not published by the regulator";
}

export function multiplePremisesValue(record: JurisdictionRecord): string {
  if (record.gate.per_site === true) {
    return "Separate notification or registration is required for each site";
  }
  if (record.gate.per_site === false) {
    return "Not required per site under the published rules";
  }
  if (record.gate.per_site === "not_applicable") {
    return "Not applicable under this regime";
  }
  return "Not published by the regulator";
}
