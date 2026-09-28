"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import DashFormSection from "@/components/DashFormSection";
import { setProductCategories } from "../../categories/category-product-actions";

export default function ProductCategoriesCard({
  productId,
  categories,
}: {
  productId: string;
  categories: { id: string; title: string; checked: boolean }[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await setProductCategories(productId, formData);
      setMessage("error" in result ? result.error : "Saved.");
      router.refresh();
    });
  }

  return (
    <DashFormSection title="Categories" hint="Where this product appears in your shop menu.">
      {categories.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No categories yet.{" "}
          <Link href="/dashboard/categories" className="font-semibold text-[var(--leaf-dark)] underline">
            Create one
          </Link>
        </p>
      ) : (
        <form action={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-sm has-[:checked]:border-[var(--leaf)] has-[:checked]:bg-[var(--wash)]"
              >
                <input type="checkbox" name="categoryId" value={c.id} defaultChecked={c.checked} />
                {c.title}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save categories"}
            </button>
            {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
          </div>
        </form>
      )}
    </DashFormSection>
  );
}
