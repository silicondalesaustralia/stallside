"use client";

import { useEffect, useState } from "react";
import {
  isIosSafari,
  isInstalledWebApp,
  isMobilePhone,
} from "@/lib/register-owner-web-push";

export default function EnableThisPhoneButton({
  pending,
  onEnable,
}: {
  pending: boolean;
  onEnable: () => void;
}) {
  const [phone, setPhone] = useState<boolean | null>(null);
  const [needsHomeScreen, setNeedsHomeScreen] = useState(false);

  useEffect(() => {
    setPhone(isMobilePhone());
    setNeedsHomeScreen(isIosSafari() && !isInstalledWebApp());
  }, []);

  if (phone === false) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled
          className="w-fit cursor-not-allowed rounded-lg border border-[var(--line)] bg-[var(--wash)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)]"
        >
          Enable this phone
        </button>
        <p className="text-[var(--muted)]">
          Open Notifications on your phone to turn on push. This computer cannot
          receive stall alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {needsHomeScreen ? (
        <p className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-[var(--muted)]">
          On iPhone: tap Share → <strong>Add to Home Screen</strong>, open Vendl
          from that icon, then tap Enable this phone.
        </p>
      ) : null}
      <button
        type="button"
        disabled={pending || phone === null}
        onClick={onEnable}
        className="w-fit rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {pending ? "Working…" : "Enable this phone"}
      </button>
    </div>
  );
}
