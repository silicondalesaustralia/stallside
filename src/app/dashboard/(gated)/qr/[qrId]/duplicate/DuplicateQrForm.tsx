"use client";

import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import QrTargetPicker from "@/components/qr/QrTargetPicker";
import type { QrTargetOption } from "@/lib/qr/target-types";
import type { QrActionResult } from "../../actions";

type DuplicateInput = { name: string; targetKind: string; targetId: string | null };

export default function DuplicateQrForm({
  action,
  sourceName,
  options,
}: {
  action: (input: DuplicateInput) => Promise<QrActionResult>;
  sourceName: string;
  options: QrTargetOption[];
}) {
  const [target, setTarget] = useState<QrTargetOption | null>(null);
  const [name, setName] = useState(`${sourceName} (copy)`);
  const [nameTouched, setNameTouched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function pick(option: QrTargetOption) {
    setTarget(option);
    if (!nameTouched) setName(`${option.label} QR`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return setMessage("Pick the page the new QR code should open.");
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await action({ name, targetKind: target.kind, targetId: target.id });
        if ("error" in result) setMessage(result.error);
      } catch (err) {
        unstable_rethrow(err);
        setMessage("Could not duplicate the QR code. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="dash-card flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium">New QR code opens</span>
        <QrTargetPicker options={options} value={target} onChange={pick} />
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Name</span>
        <input
          required
          maxLength={80}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameTouched(true);
          }}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
        />
      </label>
      {message ? <p className="text-sm text-[var(--warn)]">{message}</p> : null}
      <button type="submit" disabled={pending || !target} className={dashCtaClass}>
        {pending ? "Duplicating…" : "Create the copy"}
      </button>
    </form>
  );
}
