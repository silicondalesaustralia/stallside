import type { MaterialStatus } from "@contracts/mobile/materials";
import { colors } from "@/lib/theme";

export const MATERIAL_STATUS_LABEL: Record<MaterialStatus, string> = {
  in_stock: "In stock",
  reorder: "Reorder",
  out: "Out",
  archived: "Archived",
};

export function materialStatusColor(status: MaterialStatus): string {
  if (status === "out") return colors.danger;
  if (status === "reorder") return "#b54708";
  if (status === "archived") return colors.muted;
  return colors.brand;
}

/** "2026-10-30" → "30 Oct 2026". */
export function dayLabel(value: string): string {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
