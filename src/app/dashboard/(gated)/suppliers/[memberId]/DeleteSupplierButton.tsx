"use client";

import { useTransition } from "react";
import { deleteSupplier } from "./delete-actions";

export default function DeleteSupplierButton({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        if (
          !window.confirm(
            `Delete ${memberName} permanently? Their separate products are archived, shared links are removed, and their remaining shared stock is taken off the stall.`,
          )
        ) {
          return;
        }
        startTransition(async () => {
          await deleteSupplier(formData);
        });
      }}
    >
      <input type="hidden" name="memberId" value={memberId} />
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-red-700 underline disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete supplier"}
      </button>
    </form>
  );
}
