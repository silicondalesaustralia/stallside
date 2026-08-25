import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import CouncilsDirectoryList from "@/components/jurisdictions/CouncilsDirectoryList";
import {
  getJurisdictionBySlug,
  loadAllAuJurisdictionRecords,
  loadJurisdictionCouncils,
} from "@/lib/jurisdictions/load";
import {
  councilsPageDescription,
  councilsPageH1,
  councilsPageTitle,
} from "@/lib/jurisdictions/copy";
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
  if (!record || record.country !== "AU" || !isPageRenderable(record)) {
    return { title: "Not found" };
  }
  const indexable = isPageIndexable(record);
  return {
    title: councilsPageTitle(record),
    description: councilsPageDescription(record),
    alternates: { canonical: councilsPath(record.slug) },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function CouncilsDirectoryPage({ params }: Props) {
  const { slug } = await params;
  const record = getJurisdictionBySlug(slug);
  if (!record || record.country !== "AU" || !isPageRenderable(record)) {
    notFound();
  }

  const directory = loadJurisdictionCouncils(record.code, "AU");
  const count = directory?.councils.length ?? record.contact.council_count;

  return (
    <MarketingPageShell>
      <JsonLd data={councilsDirectorySchema(record, directory)} />
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
          {councilsPageH1(record)}
        </h1>
        <p className="mt-6 text-[var(--field)] leading-relaxed">
          {record.name} has {count ?? "multiple"} local government areas. Your
          food business notification, registration or licence usually starts with
          the council for the premises where you prepare or store food.
        </p>
        {record.gate.type === "licence" ? (
          <p className="mt-4 text-[var(--field)] leading-relaxed">
            In {record.name}, a council food business licence is only required
            when your activity is a licensable food business under the Food Act.
            Many low-risk sales are licence-exempt but still must follow the Food
            Standards Code. Fees are set by each council.
          </p>
        ) : null}
        {record.gate.regulator_determined_by === "sales_channel" ? (
          <p className="mt-4 text-[var(--field)] leading-relaxed">
            In {record.name}, who you notify depends on how you sell. Direct to
            the person who eats the food usually means your local council.
            Selling to another business to on-sell usually means the NSW Food
            Authority instead.
          </p>
        ) : null}
        {record.gate.fee === 0 ? (
          <p className="mt-4 text-[var(--field)] leading-relaxed">
            In {record.name}, the Food Business Notification itself has no fee.
            Councils set their own inspection fees.
          </p>
        ) : null}
        {record.contact.council_directory_url ? (
          <p className="mt-4 text-[var(--field)] leading-relaxed">
            Official find-your-council directory:{" "}
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
              Verified food-business links are marked above. Other councils show
              as link pending until their pages are checked. Individual council
              pages are not published until they clear the local indexability
              bar.
            </p>
          </>
        ) : (
          <p className="mt-6 text-sm text-[var(--muted)] leading-relaxed">
            Individual council pages are phase 2. This directory exists so the
            jurisdiction page can link a real council path from day one.
          </p>
        )}
      </main>
    </MarketingPageShell>
  );
}
