import Link from "next/link";

/** Duplicate and Edit & print links for a QR code table row; `href` is the code's edit page. */
export default function QrRowActions({ href }: { href: string }) {
  return (
    <div className="flex items-center justify-end gap-3 whitespace-nowrap text-sm">
      <Link href={`${href}/duplicate`} prefetch={false} className="underline">
        Duplicate
      </Link>
      <Link href={href} prefetch={false} className="font-semibold text-[var(--leaf-dark)] underline">
        Edit &amp; print
      </Link>
    </div>
  );
}
