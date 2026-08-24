import {
  Prose,
  ProseFollow,
  SectionH2,
  SectionH3,
} from "@/components/jurisdictions/section-chrome";
import type { JurisdictionRecord } from "@/lib/jurisdictions/types";

export default function WhatDoesNotApply({
  record,
}: {
  record: JurisdictionRecord;
}) {
  if (record.country === "US") {
    if (!record.unique.what_does_not_apply) return null;
    return (
      <section className="mt-12">
        <SectionH2>What this regime does not cover</SectionH2>
        <Prose>{record.unique.what_does_not_apply}</Prose>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <SectionH2>What probably does not apply to a simple farm stand</SectionH2>
      <Prose>
        The food laws cover businesses ranging from a table of home-grown produce to
        restaurants handling high-risk ready-to-eat food. That means some of the more
        demanding requirements you will encounter when researching the rules do not apply
        to every small seller.
      </Prose>

      {record.training.fss_trigger ||
      record.food_safety_management.standard_322a_trigger ? (
        <>
          <SectionH3>Food Safety Supervisor</SectionH3>
          {record.food_safety_management.standard_322a_trigger ? (
            <ProseFollow>
              {record.food_safety_management.standard_322a_trigger}
            </ProseFollow>
          ) : null}
          {record.training.fss_trigger ? (
            <ProseFollow>{record.training.fss_trigger}</ProseFollow>
          ) : null}
          {record.unique.what_does_not_apply ? (
            <ProseFollow>{record.unique.what_does_not_apply}</ProseFollow>
          ) : (
            <ProseFollow>
              A stand selling whole fruit and vegetables, sealed jars of jam, honey or
              other low-risk products is not doing the same activity as Category 1 or 2
              food service. The dividing line is the food and how you handle it, not
              whether you call it a farm stand.
            </ProseFollow>
          )}
        </>
      ) : record.unique.what_does_not_apply ? (
        <ProseFollow>{record.unique.what_does_not_apply}</ProseFollow>
      ) : null}

      <SectionH3>Where the line changes</SectionH3>
      <ProseFollow>
        Whole raw fruit and vegetables are generally not treated as ready-to-eat food
        under the Food Standards Code because the consumer is expected to wash, peel or
        otherwise prepare them. Cut fruit, prepared salads, sandwiches, cooked meats and
        other unpackaged foods requiring temperature control can change your obligations
        significantly.
      </ProseFollow>

      {record.training.food_handler_skills_required === true ? (
        <>
          <SectionH3>Basic food-handler obligations still apply</SectionH3>
          <ProseFollow>
            Even where Standard 3.2.2A does not apply, food businesses must ensure people
            undertaking food-handling activities have appropriate skills and knowledge for
            the work they perform
            {record.training.free_training_name
              ? `. ${record.name} guidance may point to ${record.training.free_training_name} as a training resource`
              : ""}
            .
          </ProseFollow>
        </>
      ) : null}
    </section>
  );
}
