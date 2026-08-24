import Link from "next/link";
import { AU_HUB_PATH, US_HUB_PATH } from "@/lib/jurisdictions";

const linkClass =
  "text-sm text-[var(--ink-on-dark)]/75 transition hover:text-[var(--ink-on-dark)]";

/** Footer guides column: country hubs only. */
export default function FooterSellingFoodNav() {
  return (
    <ul className="space-y-1.5">
      <li>
        <Link href={AU_HUB_PATH} className={linkClass}>
          Australia
        </Link>
      </li>
      <li>
        <Link href={US_HUB_PATH} className={linkClass}>
          USA
        </Link>
      </li>
    </ul>
  );
}
