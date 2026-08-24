import {
  Prose,
  ProseFollow,
  SectionH2,
  SectionH3,
} from "@/components/jurisdictions/section-chrome";
import type { JurisdictionRecord } from "@/lib/jurisdictions/types";

export default function LabellingSection({
  record,
}: {
  record: JurisdictionRecord;
}) {
  const elements = record.labelling.required_elements;
  const disclaimer = record.labelling.mandated_disclaimer_text;
  const au = record.country === "AU";

  return (
    <section className="mt-12">
      <SectionH2>
        {au
          ? "Labelling food you sell from home"
          : "Labelling cottage food you sell from home"}
      </SectionH2>
      <Prose>
        {au
          ? "Food labelling is primarily governed nationally through the Australia New Zealand Food Standards Code rather than by a separate state labelling system. The exact information you need depends on whether the food is packaged, unpackaged, or made and packaged at the point of sale."
          : `Cottage food labelling in ${record.name} follows ${record.law.statute} and the regulator's published label rules.`}
      </Prose>

      {elements.length > 0 ? (
        <>
          <ProseFollow>
            {au
              ? "For packaged retail food that is required to carry a label, the Code can require information including:"
              : "Published label elements for this regime include:"}
          </ProseFollow>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--field)] leading-relaxed">
            {elements.map((el) => (
              <li key={el}>{el}</li>
            ))}
          </ul>
        </>
      ) : null}

      {disclaimer !== "not_applicable" &&
      disclaimer !== "not_published" &&
      disclaimer ? (
        <>
          <SectionH3>Mandated disclaimer</SectionH3>
          <blockquote className="mt-4 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--field)]">
            {disclaimer}
          </blockquote>
        </>
      ) : null}

      {au && record.labelling.nutrition_panel_required !== "not_published" ? (
        <>
          <SectionH3>Nutrition information panels are not universal</SectionH3>
          <ProseFollow>
            Most packaged food requires a Nutrition Information Panel, but FSANZ publishes
            exemptions. Examples can include some food sold unpackaged and food made and
            packaged at the point of sale. Making a nutrition or health claim can also
            trigger requirements that would otherwise not apply.
          </ProseFollow>
        </>
      ) : null}

      {au && record.labelling.allergen_rule ? (
        <>
          <SectionH3>Allergen declarations matter</SectionH3>
          <ProseFollow>{record.labelling.allergen_rule}</ProseFollow>
        </>
      ) : null}

      {au && record.labelling.country_of_origin_required === true ? (
        <>
          <SectionH3>Country of origin is a separate Australian requirement</SectionH3>
          <ProseFollow>
            Country-of-origin food labelling sits under the Country of Origin Food Labelling
            Information Standard 2016 as part of Australian Consumer Law, not under the Food
            Standards Code. Depending on the food and how it is sold, country-of-origin
            requirements may still apply.
          </ProseFollow>
        </>
      ) : null}

      {record.labelling.supplier_address_required === true ? (
        <>
          <SectionH3>What address goes on a home-food label?</SectionH3>
          <ProseFollow>
            {au
              ? "Where the Code requires supplier identification, it requires the supplier's name and address in Australia or New Zealand."
              : "Where the rules require a producer address or ID, follow the published wording exactly."}{" "}
            {record.labelling.address_can_be_non_residential === "not_published"
              ? "Whether a non-residential address or PO box satisfies the requirement is not published as a general rule. Confirm before printing a large run of labels."
              : ""}
          </ProseFollow>
        </>
      ) : null}
    </section>
  );
}
