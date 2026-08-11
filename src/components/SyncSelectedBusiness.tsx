"use client";

import { useEffect, useRef } from "react";
import { selectBusiness } from "@/app/dashboard/select-business-action";

/** When opening a business setup page, make it the selected business. */
export default function SyncSelectedBusiness({
  standId,
  selectedId,
}: {
  standId: string;
  selectedId: string | null;
}) {
  const synced = useRef(false);
  useEffect(() => {
    if (synced.current || standId === selectedId) return;
    synced.current = true;
    void selectBusiness(standId);
  }, [standId, selectedId]);
  return null;
}
