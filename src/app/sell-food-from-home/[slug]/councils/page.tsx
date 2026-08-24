import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import {
  getJurisdictionBySlug,
  loadAllAuJurisdictionRecords,
} from "@/lib/jurisdictions/load";
import {
  councilsPath,
  isPageIndexable,
  isPageRenderable,
  jurisdictionPath,
} from "@/lib/jurisdictions/paths";
import { councilsDirectorySchema } from "@/lib/jurisdictions/hub-schema";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return loadAllAuJurisdictionRecords()
    .filter(isPageRenderable)
    .map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const record = getJurisdictionBySlug(slug);
  if (!record || record.country !== "AU" || !isPageRenderable(record)) return { title: "Not found" };
  const indexable = isPageIndexable(record);
  return {
    title: `${record.name} food business councils`,
    description: `Find your local council for home-based food business notification or licensing in ${record.name}.`,
    alternates: { canonical: councilsPath(record.slug) },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function CouncilsDirectoryPage({ params }: Props) {
  const { slug } = await params;
  const record = getJurisdictionBySlug(slug);
  if (!record || record.country !== "AU" || !isPageRenderable(record)) notFound();

  return (
    <MarketingPageShell>
      <JsonLd data={councilsDirectorySchema(record)} />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-[var(--muted)]">
          <Link
            href={jurisdictionPath(record.slug)}
            className="underline underline-offset-2"
          >
            {record.name}
          </Link>
          <span aria-hidden="true"> / </span>
          Councils
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          {record.name} councils
        </h1>
        <p className="mt-6 text-[var(--field)] leading-relaxed">
          {record.name} has {record.contact.council_count ?? "multiple"} local councils.
          Your food business notification, registration or licence usually starts with the
          council for the premises where you prepare or store food.
        </p>
        {record.contact.council_directory_url ? (
          <p className="mt-4 text-[var(--field)] leading-relaxed">
            Official directory:{" "}
            <a
              href={record.contact.council_directory_url}
              className="underline underline-offset-2 break-all"
              rel="noopener noreferrer"
              target="_blank"
            >
              {record.contact.council_directory_url}
            </a>
          </p>
        ) : null}
        <p className="mt-6 text-sm text-[var(--muted)] leading-relaxed">
          Individual council pages are phase 2. This directory exists so the jurisdiction
          page can link a real council path from day one.
        </p>
      </main>
    </MarketingPageShell>
  );
}
