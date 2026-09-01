"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import DashFormSection from "@/components/DashFormSection";
import {
  saveProductCategories,
  saveProductChannels,
} from "../catalogue-actions";

type StandOpt = { id: string; name: string };
type CatOpt = { id: string; title: string };

export default function ProductCatalogueFields({
  productId,
  stands,
  standChannelIds,
  showOnline,
  categories,
  categoryIds,
  locationLabel,
}: {
  productId: string;
  stands: StandOpt[];
  standChannelIds: string[];
  showOnline: boolean;
  categories: CatOpt[];
  categoryIds: string[];
  locationLabel: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onChannels(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await saveProductChannels(productId, formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Channels saved.");
      router.refresh();
    });
  }

  function onCategories(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await saveProductCategories(productId, formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Categories saved.");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5 lg:col-span-2 lg:grid-cols-2">
      <DashFormSection
        title="Selling channels"
        hint={`Where this product appears. Stock and price stay shared.`}
      >
        <form action={onChannels} className="flex flex-col gap-3">
          <p className="text-sm font-medium">{locationLabel}</p>
          {stands.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="standId"
                value={s.id}
                defaultChecked={standChannelIds.includes(s.id)}
              />
              {s.name}
            </label>
          ))}
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="showOnline"
              defaultChecked={showOnline}
            />
            Show on online shop (primary public page)
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-2 self-start rounded-full bg-[var(--field)] px-4 py-2 text-sm font-bold text-[var(--ink-on-dark)] disabled:opacity-60"
          >
            Save channels
          </button>
        </form>
      </DashFormSection>

      <DashFormSection
        title="Categories"
        hint={
          categories.length === 0
            ? "Create categories under Sell → Categories first."
            : "Optional — product can be in more than one."
        }
      >
        {categories.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No categories yet.</p>
        ) : (
          <form action={onCategories} className="flex flex-col gap-3">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="categoryId"
                  value={c.id}
                  defaultChecked={categoryIds.includes(c.id)}
                />
                {c.title}
              </label>
            ))}
            <button
              type="submit"
              disabled={pending}
              className="mt-2 self-start rounded-full bg-[var(--field)] px-4 py-2 text-sm font-bold text-[var(--ink-on-dark)] disabled:opacity-60"
            >
              Save categories
            </button>
          </form>
        )}
      </DashFormSection>
      {message ? (
        <p className="text-sm text-[var(--muted)] lg:col-span-2">{message}</p>
      ) : null}
    </div>
  );
}
