"use client";

import { useState, useTransition } from "react";
import { createAndSendCommunication } from "../actions";
import CommunicationAudienceFields from "./CommunicationAudienceFields";
import CommunicationRichTextEditor from "./CommunicationRichTextEditor";

type CustomerOpt = { id: string; name: string | null; email: string | null };
type ProductOpt = { id: string; name: string };
type ListOpt = { id: string; name: string };

export default function CommunicationComposer({
  customers,
  products,
  lists,
  initialCustomerId,
  initialListId,
  initialListMembers,
}: {
  customers: CustomerOpt[];
  products: ProductOpt[];
  lists: ListOpt[];
  initialCustomerId: string | null;
  initialListId: string | null;
  initialListMembers: { email: string }[];
}) {
  const [audienceType, setAudienceType] = useState(
    initialListId ? "list" : initialCustomerId ? "customer" : "all_marketing",
  );
  const [listId, setListId] = useState(initialListId ?? "");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        setMessage(null);
        startTransition(async () => {
          const result = await createAndSendCommunication(fd);
          if (result?.error) setMessage(result.error);
        });
      }}
      className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5"
    >
      <CommunicationAudienceFields
        audienceType={audienceType}
        setAudienceType={setAudienceType}
        customers={customers}
        products={products}
        lists={lists}
        selectedProducts={selectedProducts}
        onToggleProduct={(id) =>
          setSelectedProducts((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
          )
        }
        initialCustomerId={initialCustomerId}
        listId={listId}
        onListIdChange={setListId}
        initialMembers={initialListMembers}
      />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Subject</span>
        <input
          name="subject"
          required
          maxLength={200}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Heading (optional)</span>
        <input
          name="heading"
          maxLength={200}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <CommunicationRichTextEditor />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Button label (optional)</span>
          <input
            name="ctaLabel"
            placeholder="Shop now"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Button URL (optional)</span>
          <input
            name="ctaUrl"
            placeholder="https://"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
      </div>
      <p className="-mt-2 text-xs text-[var(--muted)]">
        Leave both button fields blank to omit the button from the email.
      </p>

      {message ? <p className="text-sm text-[var(--warn)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Queueing…" : "Send"}
      </button>
    </form>
  );
}
