import { createContext } from "react";
import type { MobileBusiness } from "@contracts/mobile/me";

export type BusinessContextValue = {
  businesses: MobileBusiness[];
  selected: MobileBusiness | null;
  select: (standId: string) => void;
};

export const BusinessContext = createContext<BusinessContextValue | null>(null);
