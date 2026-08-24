import {
  Prose,
  ProseFollow,
  SectionH2,
  SectionH3,
} from "@/components/jurisdictions/section-chrome";
import type { JurisdictionRecord } from "@/lib/jurisdictions/types";

export default function WhatCounts({ record }: { record: JurisdictionRecord }) {
  const au = record.country === "AU";
  const hasAny =
    record.scope.applies_to_one_off_sales === true ||
    record.scope.applies_to_charitable === true ||
    record.scope.definition_of_sale_includes_donations === true ||
    record.scope.primary_production_carve_out === true ||
    record.scope.licence_exemptions.length > 0 ||
    record.scope.approved_food_list === true ||
    record.scope.commodity_schemes.includes("eggs");

  if (!hasAny) return null;

  return (
    <section className="mt-12">
      <SectionH2>
        {au ? "What counts as a food business" : "What counts as a cottage food operation"}
      </SectionH2>
      <Prose>
        {au
          ? `The definition under the ${record.law.statute} is broader than a café, bakery or commercial kitchen.`
          : `Under ${record.law.statute}, cottage food rules cover specific homemade foods sold under the published conditions for ${record.name}.`}
      </Prose>

      {record.scope.applies_to_one_off_sales === true ? (
        <>
          <SectionH3>One-off sales still count</SectionH3>
          <ProseFollow>
            The rules can apply whether you sell regularly or on only one occasion. Running
            a stall once rather than every weekend does not, by itself, take the activity
            outside the definition.
          </ProseFollow>
        </>
      ) : null}

      {record.scope.applies_to_charitable === true ||
      record.scope.definition_of_sale_includes_donations === true ? (
        <>
          <SectionH3>Charitable and community sales still count</SectionH3>
          {record.scope.applies_to_charitable === true ? (
            <ProseFollow>
              A business does not have to operate for profit to fall within the{" "}
              {record.law.statute}. Charitable and community organisations that sell food
              can still be food businesses.
            </ProseFollow>
          ) : null}
          {record.scope.definition_of_sale_includes_donations === true ? (
            <ProseFollow>
              Requesting a donation in exchange for food can still constitute selling food.
              An honesty system based on a requested payment or donation should not be
              treated as a way around the rules.
            </ProseFollow>
          ) : null}
        </>
      ) : null}

      {record.scope.primary_production_carve_out === true ? (
        <>
          <SectionH3>Growing the food yourself does not necessarily exempt the sale</SectionH3>
          <ProseFollow>
            Primary food production is generally excluded from the food-business definition.
            Growing, raising, cultivating, picking, harvesting and collecting food can sit
            in that carve-out.
          </ProseFollow>
          <ProseFollow>
            Direct sale or service of food to the public is often carved out of that
            primary-production definition
            {record.scope.farm_gate_requires_notification === true
              ? ", so farm-gate sales can still require notification or registration"
              : ""}
            . Growing tomatoes on your property can be primary production; selling those
            tomatoes directly to the public from your gate can be a different activity.
          </ProseFollow>
        </>
      ) : null}

      {record.scope.approved_food_list === true ? (
        <>
          <SectionH3>Approved or allowed foods</SectionH3>
          <ProseFollow>
            {record.name} publishes an approved or allowed foods list for this regime.
            Foods outside that list are not covered by the cottage food / home exemption
            path and may need a different permit.
          </ProseFollow>
          {Array.isArray(record.scope.prohibited_foods) &&
          record.scope.prohibited_foods.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--field)] leading-relaxed">
              {record.scope.prohibited_foods.slice(0, 12).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}

      {record.scope.licence_exemptions.length > 0 ? (
        <>
          <SectionH3>Licence exemptions (where published)</SectionH3>
          <ProseFollow>
            Activities that consist only of the following are not licensable under the
            published {record.name} rules:
          </ProseFollow>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--field)] leading-relaxed">
            {record.scope.licence_exemptions.slice(0, 10).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}

      {au && record.scope.commodity_schemes.includes("eggs") ? (
        <>
          <SectionH3>Eggs have additional rules</SectionH3>
          <ProseFollow>
            If you sell eggs, council food-business notification or registration may be only
            part of the picture. Egg production can be separately regulated
            {record.scope.commodity_scheme_regulator
              ? ` by ${record.scope.commodity_scheme_regulator}`
              : ""}
            . Check commodity-scheme obligations separately rather than assuming the main
            food-business gate covers everything.
          </ProseFollow>
        </>
      ) : null}
    </section>
  );
}
