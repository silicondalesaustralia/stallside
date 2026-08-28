import Link from "next/link";
import { localDirectoryLinkLabel } from "@/lib/jurisdictions/copy";
import { localDirectoryPath } from "@/lib/jurisdictions/paths";
import type { JurisdictionRecord } from "@/lib/jurisdictions/types";

export default function LocalDirectoryLink({
  record,
}: {
  record: JurisdictionRecord;
}) {
  const href = localDirectoryPath(record);
  const label = localDirectoryLinkLabel(record);
  const prompt =
    record.country === "US"
      ? "Outside cottage food law, your local public health agency matters."
      : "Looking for the right council?";

  return (
    <p className="mt-8 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[var(--field)] leading-relaxed">
      {prompt} See the{" "}
      <Link href={href} className="font-semibold underline underline-offset-2">
        {label}
      </Link>
      .
    </p>
  );
}
