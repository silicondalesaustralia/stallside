import {
  Prose,
  ProseFollow,
  SectionH2,
  SectionH3,
} from "@/components/jurisdictions/section-chrome";
import type { JurisdictionRecord } from "@/lib/jurisdictions/types";
import { formatFee, formatMoneyAud } from "@/lib/jurisdictions/paths";

export default function HowToNotify({ record }: { record: JurisdictionRecord }) {
  const isNone = record.gate.type === "none";
  const title = isNone
    ? "How the cottage food rules work in practice"
    : record.gate.type === "licence" || record.gate.type === "permit"
      ? "How to apply"
      : "How to notify your food business";

  const money = (n: number) =>
    record.country === "US"
      ? `US$${n.toLocaleString("en-US")}`
      : formatMoneyAud(n);

  return (
    <section className="mt-12">
      <SectionH2>{title}</SectionH2>

      <ol className="mt-4 list-decimal space-y-3 pl-5 text-[var(--field)] leading-relaxed">
        <li>
          <strong className="font-semibold">
            Contact {record.gate.regulator_primary} before setting up
          </strong>
          <ProseFollow>
            Tell them what you intend to make, where it will be prepared, how it will be
            stored, and where and how you intend to sell it
            {record.premises.home_kitchen_allowed === true
              ? ". Home-based businesses can still be subject to inspection, so establish expectations before you commit to the setup"
              : ""}
            .
          </ProseFollow>
        </li>
        <li>
          <strong className="font-semibold">
            {isNone
              ? "Confirm you fit the exemption"
              : `Complete the ${record.gate.mechanism.split(".")[0] || "required form"}`}
          </strong>
          <ProseFollow>
            {isNone
              ? `Stay within the published ${record.name} cottage food conditions, including any sales cap and approved foods list.`
              : record.gate.portal_url
                ? "Use the statewide portal linked in the sources section."
                : record.gate.form_url
                  ? "Use the form linked in the sources section."
                  : "Your council or regulator can provide the current form."}{" "}
            Fee: {formatFee(record)}.
          </ProseFollow>
        </li>
        {record.gate.timing && record.gate.timing !== "not_applicable" ? (
          <li>
            <strong className="font-semibold">Respect the timing rule</strong>
            <ProseFollow>
              {record.gate.timing.charAt(0).toUpperCase() + record.gate.timing.slice(1)}.
              Do not wait until after your first market or first weekend of sales.
            </ProseFollow>
          </li>
        ) : null}
        {record.gate.per_site === true ? (
          <li>
            <strong className="font-semibold">Notify or register each premises</strong>
            <ProseFollow>
              If the business operates from multiple food premises, separate information is
              required for each site.
            </ProseFollow>
          </li>
        ) : null}
        {record.gate.change_of_details_rule ? (
          <li>
            <strong className="font-semibold">Keep your information current</strong>
            <ProseFollow>{record.gate.change_of_details_rule}</ProseFollow>
          </li>
        ) : null}
      </ol>

      <SectionH3>What happens if you do not comply?</SectionH3>
      {typeof record.gate.penalty_max_individual === "number" ||
      typeof record.gate.penalty_max_individual_units === "number" ? (
        <>
          <ProseFollow>
            {record.name} publishes penalties for operating without the required gate.
          </ProseFollow>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--field)] leading-relaxed">
            {typeof record.gate.penalty_max_individual === "number" ? (
              <li>
                Maximum penalty (individual): {money(record.gate.penalty_max_individual)}
              </li>
            ) : null}
            {typeof record.gate.penalty_max_body_corporate === "number" ? (
              <li>
                Maximum penalty (body corporate):{" "}
                {money(record.gate.penalty_max_body_corporate)}
              </li>
            ) : null}
            {typeof record.gate.penalty_expiation_individual === "number" ? (
              <li>
                Expiation (individual): {money(record.gate.penalty_expiation_individual)}
              </li>
            ) : null}
            {typeof record.gate.penalty_expiation_body_corporate === "number" ? (
              <li>
                Expiation (body corporate):{" "}
                {money(record.gate.penalty_expiation_body_corporate)}
              </li>
            ) : null}
            {typeof record.gate.penalty_max_individual_units === "number" ? (
              <li>
                Maximum under the Act: {record.gate.penalty_max_individual_units} penalty
                units (confirm the current unit value in {record.name})
              </li>
            ) : null}
          </ul>
        </>
      ) : (
        <ProseFollow>
          Maximum penalties are not published in the Tier 1 material used for this page.
          Confirm with {record.gate.regulator_primary}.
        </ProseFollow>
      )}
    </section>
  );
}
