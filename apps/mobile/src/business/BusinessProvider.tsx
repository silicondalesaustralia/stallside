import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { BusinessContext } from "@/business/business-context";
import { readSecure, writeSecure } from "@/auth/secure-values";
import { useMe } from "@/data/useMe";

/** Which business the app is working on. Sent as standId on every request (the app has no cookie). */
export default function BusinessProvider({ children }: { children: ReactNode }) {
  const { data } = useMe();
  const [storedId, setStoredId] = useState<string | null>(null);

  useEffect(() => {
    void readSecure("standId").then(setStoredId);
  }, []);

  const businesses = useMemo(() => data?.businesses ?? [], [data]);
  const selected = businesses.find((b) => b.id === storedId) ?? businesses[0] ?? null;

  const select = useCallback((standId: string) => {
    setStoredId(standId);
    writeSecure("standId", standId).catch((error: unknown) => {
      console.warn("Could not remember selected business", error);
    });
  }, []);

  const value = useMemo(() => ({ businesses, selected, select }), [businesses, selected, select]);
  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}
