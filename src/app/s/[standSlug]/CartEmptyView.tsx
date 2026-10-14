import Link from "next/link";
import SectionCopy from "@/components/studio/SectionCopy";

export default function CartEmptyView({ shopHref }: { shopHref: string }) {
  return (
    <div className="mt-10 flex flex-col gap-4">
      <SectionCopy k="empty" fallback="Your cart is empty." as="p" className="block text-xl text-[var(--muted)]" />
      <Link href={shopHref} className="font-semibold text-[var(--site-link,var(--leaf-dark))] underline">
        <SectionCopy k="browse" fallback="Browse products" />
      </Link>
    </div>
  );
}
