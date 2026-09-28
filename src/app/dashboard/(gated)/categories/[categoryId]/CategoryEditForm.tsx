import { deleteCategory, updateCategory } from "../actions";

export default function CategoryEditForm({
  category,
  saved,
  nameError,
}: {
  category: {
    id: string;
    title: string;
    description: string | null;
    isActive: boolean;
    showOnWebsite: boolean;
  };
  saved: boolean;
  nameError: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-white p-4">
      <form action={updateCategory.bind(null, category.id)} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Name</span>
          <input
            name="title"
            required
            maxLength={80}
            defaultValue={category.title}
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Description (optional)</span>
          <textarea
            name="description"
            maxLength={300}
            rows={2}
            defaultValue={category.description ?? ""}
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={category.isActive} />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="showOnWebsite" defaultChecked={category.showOnWebsite} />
          Show in shop menu
        </label>
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
