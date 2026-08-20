"use client";

import { useActionState } from "react";
import {
  submitGalleryStand,
  type GallerySubmitState,
} from "@/app/dashboard/(gated)/gallery/submit/actions";
import FilePickButton from "@/components/FilePickButton";

type StandOption = { id: string; name: string };

const initial: GallerySubmitState = {};

export default function GallerySubmitForm({
  stands,
  defaultName,
}: {
  stands: StandOption[];
  defaultName: string;
}) {
  const [state, action, pending] = useActionState(submitGalleryStand, initial);

  return (
    <form action={action} className="mt-8 flex flex-col gap-4" encType="multipart/form-data">
      {stands.length > 0 ? (
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Your stand (optional)</span>
          <select
            name="standId"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
            defaultValue=""
          >
            <option value="">-</option>
            {stands.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Display name</span>
        <input
          name="displayName"
          required
          minLength={2}
          maxLength={120}
          defaultValue={defaultName}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Location</span>
        <input
          name="location"
          required
          minLength={2}
          maxLength={120}
          placeholder="Barossa Valley, SA"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Caption (optional)</span>
        <input
          name="caption"
          maxLength={200}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Photo</span>
        <FilePickButton
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          label="Choose photo"
          maxBytes={5 * 1024 * 1024}
          hint="JPEG, PNG, or WebP · under 5 MB (large photos are resized)"
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consent" required className="mt-1 size-4" />
        <span>
          I own this photo and allow Vendl to show it publicly in the stand gallery.
        </span>
      </label>
      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
