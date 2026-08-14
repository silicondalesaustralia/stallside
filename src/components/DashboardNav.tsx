"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import type { BusinessOption } from "@/lib/selected-business";

const STORAGE_KEY = "vendl-dash-sidebar";

export default function DashboardNav({
  businesses,
  selectedBusinessId,
}: {
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function onToggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <DashboardSidebar
      businesses={businesses}
      selectedBusinessId={selectedBusinessId}
      collapsed={collapsed}
      onToggle={onToggle}
    />
  );
}
