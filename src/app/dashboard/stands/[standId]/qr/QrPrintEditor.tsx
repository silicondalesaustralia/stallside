"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateStandQrPrint } from "../../actions";
import SimpleHtmlEditor from "@/components/SimpleHtmlEditor";

type PrintFields = {
  id: string;
  name: string;
  description: string | null;
  locationLabel: string | null;
  qrSignMessage: string | null;
};

export default function QrPrintEditor({ stand }: { stand: PrintFields }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const save = updateStandQrPrint.bind(null, stand.id);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await save(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Saved - print preview updated.");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4 print:hidden">
      <input type="hidden" name="standId" value={stand.id} />
      <h2 className="text-lg font-semibold">Edit QR sign</h2>
      <p className="text-sm text-[var(--muted)]">
        These details appear on the printable / downloadable sign and on the public checkout page.
      </p>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Stand name</span>
        <input
          name="name"
          required
          defaultValue={stand.name}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Instructions</span>
        <p className="text-[var(--muted)]">
          Use bold, lists, and Enter for new lines so steps read clearly on the printout.
        </p>
        <SimpleHtmlEditor
          name="description"
          defaultValue={stand.description ?? ""}
          placeholder="Step 1: Scan QR code…"
        />
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Location</span>
        <input
          name="locationLabel"
          defaultValue={stand.locationLabel ?? ""}
          placeholder="Gate on Miller Rd"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Sign message under the name</span>
        <input
          name="qrSignMessage"
          defaultValue={stand.qrSignMessage ?? ""}
          placeholder="Scan to browse and pay at this stand."
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save sign details"}
      </button>
    </form>
  );
}
