import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import JurisdictionPage from "@/components/jurisdictions/JurisdictionPage";
import MarketingPageShell from "@/components/MarketingPageShell";
import { APP_NAME } from "@/lib/constants";
import { pageDescription, pageTitle } from "@/lib/jurisdictions/copy";
import {
  getJurisdictionBySlug,
  loadAllUsJurisdictionRecords,
} from "@/lib/jurisdictions/load";
import {
  isPageIndexable,
  isPageRenderable,
  jurisdictionPathFor,
} from "@/lib/jurisdictions/paths";
import { jurisdictionPageSchema } from "@/lib/jurisdictions/schema";

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
  const title = pageTitle(record);
  const description = pageDescription(record);
  const indexable = isPageIndexable(record);
  const path = jurisdictionPathFor(record);
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: `${title} · ${APP_NAME}`,
      description,
      url: path,
    },
  };
}

export default async function CottageFoodStatePage({ params }: Props) {
  const { slug } = await params;
  const record = getJurisdictionBySlug(slug);
  if (!record || record.country !== "US" || !isPageRenderable(record)) {
    notFound();
  }

  return (
    <MarketingPageShell>
      <JsonLd data={jurisdictionPageSchema(record)} />
      <JurisdictionPage record={record} />
    </MarketingPageShell>
  );
}
