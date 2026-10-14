import Link from "next/link";
import DashFormSection from "@/components/DashFormSection";

export type CategoryChoice = { id: string; title: string; checked: boolean };

/** Shop categories, the freshness note on cards, and pre-order availability. */
export default function ProductOrganisationSection({
  categories,
  freshnessNote,
  showPreOrder,
  preOrderEligible,
  onPreOrderChange,
}: {
  categories: CategoryChoice[];
  freshnessNote: string | null;
  showPreOrder: boolean;
  preOrderEligible: boolean;
  onPreOrderChange: (next: boolean) => void;
}) {
  return (
    <DashFormSection title="Organisation">
      <div className="flex flex-col gap-2 text-sm">
        <span className="font-semibold">Categories</span>
        {categories.length === 0 ? (
          <p className="text-[var(--muted)]">
            No categories yet.{" "}
            <Link href="/dashboard/categories" className="font-semibold text-[var(--leaf-dark)] underline">
              Create one
            </Link>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <input type="hidden" name="categoriesShown" value="1" />
            {categories.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-1.5 has-[:checked]:border-[var(--leaf)] has-[:checked]:bg-[var(--wash)]"
              >
                <input type="checkbox" name="categoryId" value={c.id} defaultChecked={c.checked} />
                {c.title}
              </label>
            ))}
          </div>
        )}
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Freshness note</span>
        <input
          name="freshnessNote"
          defaultValue={freshnessNote ?? ""}
          maxLength={80}
          placeholder="Laid this morning"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
        <span className="text-xs text-[var(--muted)]">A short line shown with the product.</span>
      </label>
      {showPreOrder ? (
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="preOrderEligible"
            checked={preOrderEligible}
            onChange={(e) => onPreOrderChange(e.target.checked)}
            className="mt-0.5 size-4"
          />
          <span>
            <span className="font-semibold">Available for pre-order pages</span>
            <span className="mt-1 block text-[var(--muted)]">
              Add it to a{" "}
              <Link href="/dashboard/pre-order-pages" className="text-[var(--leaf-dark)] underline">
                pre-order page
              </Link>
              . Collection day is set on the page.
            </span>
          </span>
        </label>
      ) : null}
    </DashFormSection>
  );
}
