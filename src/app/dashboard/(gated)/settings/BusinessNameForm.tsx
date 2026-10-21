"use client";

import { useState, useTransition } from "react";
import { updateBusinessNameAndAddress } from "./web-address-actions";
import { useWebAddressPreview } from "@/components/web-address/use-web-address-preview";
import WebAddressHint from "@/components/web-address/WebAddressHint";

export default function BusinessNameForm({
  businessName,
}: {
  businessName: string;
}) {
  const [name, setName] = useState(businessName);
  const [renameAddress, setRenameAddress] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const preview = useWebAddressPreview(name);
  const addressChanges = Boolean(preview && !preview.locked && preview.host !== preview.currentHost);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await updateBusinessNameAndAddress(formData);
        if ("error" in result) {
          setMessage(result.error);
          return;
        }
        setMessage(result.host ? `Saved. Your website is now at ${result.host}.` : "Business name saved.");
      } catch (error) {
        console.error("Business name save failed", error);
        setMessage("Couldn't save. Check your connection and try again.");
      }
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-2">
      <label className="flex flex-col gap-1.5">
        <span className="font-medium">Business name</span>
        <input
          name="businessName"
          required
          minLength={2}
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
        />
      </label>
      {addressChanges && preview ? (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="renameAddress"
            checked={renameAddress}
            onChange={(e) => setRenameAddress(e.target.checked)}
            className="mt-0.5"
          />
          {preview.currentHost ? (
            <span>
              Also change my web address from <span className="font-medium">{preview.currentHost}</span> to{" "}
              <span className="font-medium">{preview.host}</span>. The old address will forward to the new one.
            </span>
          ) : (
            <span>
              Reserve my web address: <span className="font-medium">{preview.host}</span>
            </span>
          )}
        </label>
      ) : (
        <WebAddressHint preview={preview} />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--leaf)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {message ? (
          <p className="text-sm text-[var(--muted)]">{message}</p>
        ) : null}
      </div>
    </form>
  );
}
