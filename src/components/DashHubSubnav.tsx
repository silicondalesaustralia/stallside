"use client";

import { usePathname } from "next/navigation";
import { hubNavForPath } from "@/components/dash-nav-links";
import { ObjectSubnav } from "@/components/dash-object/DashObjectUi";

/** Renders hub subnav when the current route belongs to a major area. */
export default function DashHubSubnav() {
  const pathname = usePathname();
  const items = hubNavForPath(pathname);
  if (!items) return null;
  return (
    <div className="mb-6">
      <ObjectSubnav items={items} pathname={pathname} />
    </div>
  );
}
