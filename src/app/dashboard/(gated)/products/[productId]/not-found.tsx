import Link from "next/link";

export default function ProductEditNotFound() {
  return (
    <main className="flex flex-col gap-4 py-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
        Product not found
      </h1>
      <p className="text-sm text-[var(--muted)]">
        This product is missing, archived under another account, or your session
        can&apos;t open it. Go back to Products and try again.
      </p>
      <Link
        href="/dashboard/products"
        className="text-sm font-semibold text-[var(--leaf-dark)] underline"
      >
        Back to Products
      </Link>
    </main>
  );
}
