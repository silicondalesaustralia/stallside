import Link from "next/link";
import CsvUploadForm from "./CsvUploadForm";

export default function UploadListPage() {
  return (
    <main className="flex max-w-xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/customers/lists" className="underline">
            Lists
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Upload CSV
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          One email per row. Optional header: email, name, phone.
        </p>
      </div>
      <CsvUploadForm />
    </main>
  );
}
