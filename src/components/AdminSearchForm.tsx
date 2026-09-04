import Link from "next/link";

export default function AdminSearchForm({
  q,
  placeholder,
  clearHref,
}: {
  q: string;
  placeholder: string;
  clearHref: string;
}) {
  return (
    <form className="flex flex-wrap items-center gap-3">
      <input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className="min-w-[16rem] flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="text-sm font-semibold text-[var(--leaf-dark)] underline"
      >
        Search
      </button>
      {q ? (
        <Link href={clearHref} className="text-sm text-[var(--muted)] underline">
          Clear
        </Link>
      ) : null}
    </form>
  );
}
