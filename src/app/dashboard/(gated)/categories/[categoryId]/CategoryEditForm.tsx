import type { ReactNode } from "react";
import { deleteCategory, updateCategory } from "../actions";
import { CATEGORY_DESCRIPTION_MAX } from "@/lib/categories/category-fields";
import CategoryImageField from "./CategoryImageField";

const INPUT = "rounded-lg border border-[var(--line)] px-3 py-2";
const FORMAT_HINT = "Use **bold**, _italic_, [link](https://…) and start lines with - for bullet points.";

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-white p-4">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {note ? <p className="text-xs text-[var(--muted)]">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function CategoryEditForm({
  category,
  saved,
  nameError,
}: {
  category: {
    id: string;
    title: string;
    description: string | null;
    bottomDescription: string | null;
    imageUrl: string | null;
    showOnWebsite: boolean;
  };
  saved: boolean;
  nameError: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <form action={updateCategory.bind(null, category.id)} className="flex flex-col gap-4">
        <Section title="Title">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Name</span>
            <input name="title" required maxLength={80} defaultValue={category.title} className={INPUT} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="showOnWebsite" defaultChecked={category.showOnWebsite} />
            Show in shop menu
          </label>
        </Section>
        <Section title="Descriptions" note={`Optional. ${FORMAT_HINT}`}>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Top description</span>
            <span className="text-xs text-[var(--muted)]">Under the category name, above the products.</span>
            <textarea
              name="description"
              maxLength={CATEGORY_DESCRIPTION_MAX}
              rows={4}
              defaultValue={category.description ?? ""}
              className={INPUT}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Bottom description</span>
            <span className="text-xs text-[var(--muted)]">Under the products, e.g. care tips or more detail.</span>
            <textarea
              name="bottomDescription"
              maxLength={CATEGORY_DESCRIPTION_MAX}
              rows={5}
              defaultValue={category.bottomDescription ?? ""}
              className={INPUT}
            />
          </label>
          <p className="text-xs text-[var(--muted)]">
            Turn each description on or off for all categories in the website editor (Category page).
          </p>
        </Section>
        <Section title="Thumbnail">
          <CategoryImageField initialUrl={category.imageUrl} />
        </Section>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Save
          </button>
          {saved ? <p className="text-sm text-[var(--muted)]">Saved.</p> : null}
          {nameError ? <p className="text-sm text-[var(--gone)]">Enter a category name.</p> : null}
        </div>
      </form>
      <form action={deleteCategory.bind(null, category.id)} className="border-t border-[var(--line)] pt-3">
        <button type="submit" className="text-sm font-semibold text-[var(--gone)] underline">
          Delete category
        </button>
        <span className="ml-2 text-xs text-[var(--muted)]">Products are kept; only the grouping is removed.</span>
      </form>
    </div>
  );
}
