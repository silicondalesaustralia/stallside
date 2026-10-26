"use client";

const BUTTON = "text-sm font-semibold underline";

/** Publish/Unpublish and Delete for one category in the Categories list. */
export default function CategoryRowActions({
  title,
  isActive,
  toggleAction,
  deleteAction,
}: {
  title: string;
  isActive: boolean;
  toggleAction: () => Promise<void>;
  deleteAction: () => Promise<void>;
}) {
  return (
    <div className="flex shrink-0 justify-end gap-3 whitespace-nowrap">
      <form action={toggleAction}>
        <button type="submit" className={`${BUTTON} text-[var(--leaf-dark)]`}>
          {isActive ? "Unpublish" : "Publish"}
        </button>
      </form>
      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (!window.confirm(`Delete "${title}"? Its products are kept; only the grouping is removed.`)) e.preventDefault();
        }}
      >
        <button type="submit" className={`${BUTTON} text-[var(--gone)]`}>
          Delete
        </button>
      </form>
    </div>
  );
}
