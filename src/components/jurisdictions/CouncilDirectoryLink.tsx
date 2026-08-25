import Link from "next/link";
import { councilsPath } from "@/lib/jurisdictions/paths";
import type { JurisdictionRecord } from "@/lib/jurisdictions/types";

export default function CouncilDirectoryLink({
  record,
}: {
  record: JurisdictionRecord;
}) {
  return (
    <p className="mt-8 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[var(--field)] leading-relaxed">
      Looking for the right council? See the{" "}
      <Link
        href={councilsPath(record.slug)}
        className="font-semibold underline underline-offset-2"
      >
        {record.name} council food forms & rules
      </Link>
      .
    </p>
  );
}
