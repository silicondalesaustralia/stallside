import type { UpsellInputValues } from "@contracts/mobile/upsells";

export type SetUpsellField = <K extends keyof UpsellInputValues>(
  key: K,
  value: UpsellInputValues[K],
) => void;
