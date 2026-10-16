"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import QrTargetPicker from "@/components/qr/QrTargetPicker";
import AtStallToggle from "@/components/qr/AtStallToggle";
import type { QrTargetOption } from "@/lib/qr/target-types";
import type { CreateQrInput, QrActionResult } from "../actions";

type StandOpt = { id: string; name: string };

export default function NewQrCodeForm({
  action,
  stands,
  options,
  defaultStandId,
}: {
  action: (input: CreateQrInput) => Promise<QrActionResult>;
  stands: StandOpt[];
  options: QrTargetOption[];
  defaultStandId: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<QrTargetOption | null>(options[0] ?? null);
  const [name, setName] = useState(options[0] ? `${options[0].label} QR` : "");
  const [nameTouched, setNameTouched] = useState(false);
  const [standId, setStandId] = useState(defaultStandId);
  const [atStall, setAtStall] = useState(false);

  const inputClass = "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm";

  function pick(option: QrTargetOption) {
    setTarget(option);
    if (!nameTouched) setName(`${option.label} QR`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return setMessage("Pick a page for this QR code.");
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await action({ name, standId, targetKind: target.kind, targetId: target.id, atStall });
        if ("error" in result) setMessage(result.error);
      } catch (err) {
        unstable_rethrow(err);
        setMessage("Could not create the QR code. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="dash-card flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Opens</span>
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
          className={inputClass}
          placeholder="Farm Stand shelf"
        />
        <span className="text-xs text-[var(--muted)]">Only you see this. It helps you find the code later.</span>
      </label>

      {stands.length > 1 ? (
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Business</span>
          <select value={standId} onChange={(e) => setStandId(e.target.value)} className={inputClass}>
            {stands.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <AtStallToggle checked={atStall} onChange={setAtStall} />

      {message ? <p className="text-sm text-[var(--warn)]">{message}</p> : null}

      <button type="submit" disabled={pending || !target} className={dashCtaClass}>
        {pending ? "Creating…" : "Create QR code and design poster"}
      </button>
    </form>
  );
}
