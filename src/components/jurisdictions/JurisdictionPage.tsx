import Link from "next/link";
import NewsMarkdown from "@/components/NewsMarkdown";
import AtAGlance from "@/components/jurisdictions/AtAGlance";
import CouncilDirectoryLink from "@/components/jurisdictions/CouncilDirectoryLink";
import GettingPaid from "@/components/jurisdictions/GettingPaid";
import HowToNotify from "@/components/jurisdictions/HowToNotify";
import JurisdictionFaq from "@/components/jurisdictions/JurisdictionFaq";
import LabellingSection from "@/components/jurisdictions/LabellingSection";
import NearbyJurisdictions from "@/components/jurisdictions/NearbyJurisdictions";
import QuirkSection from "@/components/jurisdictions/QuirkSection";
import SourcesSection from "@/components/jurisdictions/SourcesSection";
import WhatCounts from "@/components/jurisdictions/WhatCounts";
import WhatDoesNotApply from "@/components/jurisdictions/WhatDoesNotApply";
import WhereYouSell from "@/components/jurisdictions/WhereYouSell";
import WhoRegulates from "@/components/jurisdictions/WhoRegulates";
import { answerLead, pageTitle } from "@/lib/jurisdictions/copy";
import {
  loadJurisdictionCouncils,
  loadJurisdictionPageMarkdown,
} from "@/lib/jurisdictions/load";
import {
  hubPathFor,
  isPageIndexable,
} from "@/lib/jurisdictions/paths";
import { faqsForJurisdiction } from "@/lib/jurisdictions/schema";
import type { JurisdictionRecord } from "@/lib/jurisdictions/types";

export default function JurisdictionPage({
  record,
}: {
  record: JurisdictionRecord;
}) {
  const draft = !isPageIndexable(record);
  const curated = loadJurisdictionPageMarkdown(record.code, record.country);
  const faqs = faqsForJurisdiction(record);
  const hubPath = hubPathFor(record);
  const hubLabel =
    record.country === "US" ? "Cottage food laws" : "Sell food from home";
  const hasCouncils =
    record.country === "AU" &&
    loadJurisdictionCouncils(record.code, "AU") != null;

  return (
    <article className="jurisdiction-page mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
      {draft ? (
        <p className="mb-6 rounded-[var(--radius)] border border-amber-700/30 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Draft: pending human verification. Not submitted for indexing. Clear every
          [VERIFY] marker before publish.
        </p>
      ) : null}

      <p className="text-sm text-[var(--muted)]">
        <Link href={hubPath} className="underline underline-offset-2">
          {hubLabel}
        </Link>
        <span aria-hidden="true"> / </span>
        {record.name}
      </p>

      <h1 className="jurisdiction-title mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl sm:leading-tight">
        {pageTitle(record)}
      </h1>

      {hasCouncils ? <CouncilDirectoryLink record={record} /> : null}

      {curated ? (
        <div className="jurisdiction-body mt-6 text-[var(--field)] [&_p]:mt-4 [&_p]:leading-relaxed [&_ol]:mt-4 [&_ul]:mt-4 [&_li]:leading-relaxed [&_strong]:font-semibold [&_table]:mt-8 [&_a]:underline [&_a]:underline-offset-2">
          <NewsMarkdown source={curated} skipFirstH1={false} />
        </div>
      ) : (
        <div className="jurisdiction-body">
          <p className="jurisdiction-lead mt-6 text-lg text-[var(--field)] leading-relaxed">
            {answerLead(record)}
          </p>
          <AtAGlance record={record} />
          <WhoRegulates record={record} />
          <WhatCounts record={record} />
          <WhatDoesNotApply record={record} />
          <HowToNotify record={record} />
          <LabellingSection record={record} />
          <WhereYouSell record={record} />
          <GettingPaid record={record} />
          <QuirkSection record={record} />
          <NearbyJurisdictions record={record} />
          <SourcesSection record={record} />
        </div>
      )}

      <JurisdictionFaq faqs={faqs} />
    </article>
  );
}
