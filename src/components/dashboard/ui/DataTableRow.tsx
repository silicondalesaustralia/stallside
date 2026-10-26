"use client";

import { useRouter } from "next/navigation";

/** Table row that opens `href` on click, except when the click lands on a link, button or input. */
export default function DataTableRow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function onClick(e: React.MouseEvent<HTMLTableRowElement>) {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, select, textarea, label")) return;
    if (e.metaKey || e.ctrlKey) {
      window.open(href, "_blank");
      return;
    }
    router.push(href);
  }

  return (
    <tr onClick={onClick} className="cursor-pointer align-middle transition-colors hover:bg-[var(--wash)]/70">
      {children}
    </tr>
  );
}
