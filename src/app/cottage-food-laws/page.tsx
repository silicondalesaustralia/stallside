import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import { APP_NAME } from "@/lib/constants";
import { loadAllUsJurisdictionRecords } from "@/lib/jurisdictions/load";
import {
  US_HUB_PATH,
  isPageIndexable,
  jurisdictionPathFor,
} from "@/lib/jurisdictions/paths";
import { jurisdictionHubSchema } from "@/lib/jurisdictions/hub-schema";

const title = "Cottage food laws in the United States";
const description =
  "State cottage food laws for selling homemade food: sales caps, approved foods, labelling, and who regulates home kitchen sales.";

const published = loadAllUsJurisdictionRecords()
  .filter(isPageIndexable)
  .sort((a, b) => a.name.localeCompare(b.name));

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: US_HUB_PATH },
  robots:
    published.length > 0
      ? { index: true, follow: true }
      : { index: false, follow: false },
};

function gateLabel(type: string): string {
  if (type === "none") return "No permit";
  return type.replaceAll("_", " ");
}

export default function CottageFoodLawsIndexPage() {
  const listItems = published.map((r) => ({
    name: r.name,
    slug: r.slug,
    urlPath: jurisdictionPathFor(r),
  }));

  return (
    <MarketingPageShell>
      <JsonLd
        data={jurisdictionHubSchema({
          name: `${title} · ${APP_NAME}`,
          description,
          items: listItems,
          hubPath: US_HUB_PATH,
          aboutName: "Cottage food law in the United States",
          itemListName: "US cottage food states",
          inLanguage: "en-US",
        })}
      />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        {published.length === 0 ? (
          <p className="mb-6 rounded-[var(--radius)] border border-amber-700/30 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Draft hub: state pages ship after human verification. Not submitted for
            indexing yet.
          </p>
        ) : null}
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl sm:leading-tight">
          {title}
        </h1>
        <p className="mt-6 text-lg text-[var(--field)] leading-relaxed">
          Cottage food laws let people sell certain homemade foods from a home kitchen
          under state rules. Caps, approved foods, and permits differ by state.
        </p>
        <ul className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {published.map((r) => (
            <li
              key={r.code}
              className="flex items-baseline justify-between gap-4 py-4"
            >
              <Link
                href={jurisdictionPathFor(r)}
                className="font-semibold text-[var(--field)] underline-offset-2 hover:underline"
              >
                {r.name}
              </Link>
              <span className="shrink-0 text-sm text-[var(--muted)]">
                {gateLabel(r.gate.type)}
              </span>
            </li>
          ))}
        </ul>
      </main>
    </MarketingPageShell>
  );
}
