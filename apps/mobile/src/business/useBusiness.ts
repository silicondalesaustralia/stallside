import { useContext } from "react";
import { BusinessContext, type BusinessContextValue } from "@/business/business-context";

export function useBusiness(): BusinessContextValue {
  const value = useContext(BusinessContext);
  if (!value) throw new Error("useBusiness must be used inside <BusinessProvider>");
  return value;
}
