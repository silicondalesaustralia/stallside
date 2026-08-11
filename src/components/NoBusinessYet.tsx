import Link from "next/link";

/** Shown when ops pages need a business but the owner has none. */
export default function NoBusinessYet() {
  return (
    <p className="text-sm text-[var(--muted)]">
      Create a business first, then manage products and orders for it.{" "}
      <Link
        href="/dashboard/businesses/new"
        className="text-[var(--leaf-dark)] underline"
      >
        New business
      </Link>
    </p>
  );
}
