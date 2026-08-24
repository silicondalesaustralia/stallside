import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import { APP_NAME } from "@/lib/constants";
import { loadAllAuJurisdictionRecords } from "@/lib/jurisdictions/load";
import {
  AU_HUB_PATH,
  isPageIndexable,
  isPageRenderable,
  jurisdictionPath,
} from "@/lib/jurisdictions/paths";
import { jurisdictionHubSchema } from "@/lib/jurisdictions/hub-schema";

const title = "Sell food from home in Australia";
const description =
  "State and territory rules for home-based food businesses in Australia: who to notify, how to start, and where you can sell.";

const records = loadAllAuJurisdictionRecords().sort((a, b) =>
  a.name.localeCompare(b.name),
);
const hasPublished = records.some(isPageIndexable);

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: AU_HUB_PATH },
  robots: hasPublished
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function SellFoodFromHomeIndexPage() {
  const listItems = records.filter(isPageRenderable).map((r) => ({
    name: r.name,
    slug: r.slug,
    urlPath: jurisdictionPath(r.slug),
  }));

  return (
    <MarketingPageShell>
      <JsonLd
        data={jurisdictionHubSchema({
          name: `${title} · ${APP_NAME}`,
          description,
          items: listItems,
        })}
      />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        {!hasPublished ? (
          <p className="mb-6 rounded-[var(--radius)] border border-amber-700/30 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Draft hub: jurisdiction pages ship after human verification. Not submitted for
            indexing yet.
          </p>
        ) : null}
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl sm:leading-tight">
          {title}
        </h1>
        <p className="mt-6 text-lg text-[var(--field)] leading-relaxed">
          Australia has no cottage food law. Each state and territory runs its own food
          business notification, registration or licensing rules for people who sell food
          they make at home.
        </p>
        <ul className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {records.map((r) => {
            const ready = isPageRenderable(r);
            const live = isPageIndexable(r);
            return (
              <li key={r.code} className="flex items-baseline justify-between gap-4 py-4">
                {ready ? (
                  <Link
                    href={jurisdictionPath(r.slug)}
                    className="font-semibold text-[var(--field)] underline-offset-2 hover:underline"
                  >
                    {r.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-[var(--muted)]">{r.name}</span>
                )}
                <span className="shrink-0 text-sm text-[var(--muted)]">
                  {live
                    ? r.gate.type.replaceAll("_", " ")
                    : ready
                      ? "Draft"
                      : "Research in progress"}
                </span>
              </li>
            );
          })}
        </ul>
      </main>
    </MarketingPageShell>
  );
}
