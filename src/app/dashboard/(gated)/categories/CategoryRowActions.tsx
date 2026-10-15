"use client";

const BUTTON = "rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold";

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
    <div className="flex shrink-0 gap-1.5">
      <form action={toggleAction}>
        <button type="submit" className={BUTTON}>
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
