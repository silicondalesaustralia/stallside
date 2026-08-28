import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import CouncilsDirectoryList from "@/components/jurisdictions/CouncilsDirectoryList";
import {
  getJurisdictionBySlug,
  loadAllUsJurisdictionRecords,
  loadJurisdictionCouncils,
} from "@/lib/jurisdictions/load";
import {
  localAgenciesPageDescription,
  localAgenciesPageH1,
  localAgenciesPageTitle,
} from "@/lib/jurisdictions/copy";
import {
  isPageIndexable,
  isPageRenderable,
  jurisdictionPathFor,
  localAgenciesPath,
} from "@/lib/jurisdictions/paths";
import { councilsDirectorySchema } from "@/lib/jurisdictions/hub-schema";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return loadAllUsJurisdictionRecords()
    .filter(isPageRenderable)
    .map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const record = getJurisdictionBySlug(slug);
  if (!record || record.country !== "US" || !isPageRenderable(record)) {
    return { title: "Not found" };
  }
  const indexable = isPageIndexable(record);
  return {
    title: localAgenciesPageTitle(record),
    description: localAgenciesPageDescription(record),
    alternates: { canonical: localAgenciesPath(record.slug) },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function LocalAgenciesDirectoryPage({ params }: Props) {
  const { slug } = await params;
  const record = getJurisdictionBySlug(slug);
  if (!record || record.country !== "US" || !isPageRenderable(record)) {
    notFound();
  }

  const directory = loadJurisdictionCouncils(record.code, "US");
  const count = directory?.councils.length ?? record.contact.council_count;

  return (
    <MarketingPageShell>
      <JsonLd data={councilsDirectorySchema(record, directory)} />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-[var(--muted)]">
          <Link
            href={jurisdictionPathFor(record)}
            className="underline underline-offset-2"
          >
            {record.name}
          </Link>
          <span aria-hidden="true"> / </span>
          Local agencies
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          {localAgenciesPageH1(record)}
        </h1>
        <p className="mt-6 text-[var(--field)] leading-relaxed">
          {record.name} has {count ?? "multiple"} local public health agencies.
          {record.gate.type === "none" ? (
            <>
              {" "}
              Where state cottage food law pre-empts local regulation, agencies
              may not inspect qualifying cottage food production. Once your product
              or venue falls outside that path, your local agency may regulate
              retail food establishments under state food code or local
              ordinances.
            </>
          ) : (
            <>
              {" "}
              Local agencies handle food establishment permits, inspections and
              enforcement for activities outside any statewide cottage food
              exemption.
            </>
          )}
        </p>
        {record.code === "mo" ? (
          <p className="mt-4 text-[var(--field)] leading-relaxed">
            Before selling at a farmers market, roadside stand or with a product
            not on the cottage food list, contact the agency for your county. A
            separate Food Code non-potentially hazardous stand exemption may apply
            where local codes allow.
          </p>
        ) : null}
        {record.contact.council_directory_url ? (
          <p className="mt-4 text-[var(--field)] leading-relaxed">
            Official state directory:{" "}
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

        {directory ? (
          <>
            <CouncilsDirectoryList directory={directory} />
            <p className="mt-8 text-sm text-[var(--muted)] leading-relaxed">
              Phone numbers are from the state directory. Food-program URLs are
              added where verified.
            </p>
          </>
        ) : (
          <p className="mt-6 text-sm text-[var(--muted)] leading-relaxed">
            A local agency directory is not available for this state yet. Use
            the official state directory above when listed, or contact your
            county health department.
          </p>
        )}
      </main>
    </MarketingPageShell>
  );
}
