"use client";

import dynamic from "next/dynamic";

const OwnerPushRegister = dynamic(
  () => import("@/components/OwnerPushRegister"),
  { ssr: false },
);

export default function OwnerPushRegisterLazy({
  pushAlertsEnabled,
}: {
  pushAlertsEnabled: boolean;
}) {
  return <OwnerPushRegister pushAlertsEnabled={pushAlertsEnabled} />;
}
