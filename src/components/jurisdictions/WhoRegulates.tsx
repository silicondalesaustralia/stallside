import {
  Prose,
  ProseFollow,
  SectionH2,
} from "@/components/jurisdictions/section-chrome";
import type { JurisdictionRecord } from "@/lib/jurisdictions/types";

export default function WhoRegulates({ record }: { record: JurisdictionRecord }) {
  const by = record.gate.regulator_determined_by;
  const entity =
    record.country === "US"
      ? "cottage food operations"
      : "home food businesses";

  return (
    <section className="mt-12">
      <SectionH2>Who regulates you</SectionH2>

      {by === "geography" ? (
        <>
          <Prose>
            For most {entity} in {record.name}, {record.gate.regulator_primary} is the
            enforcement agency.
          </Prose>
          <ProseFollow>{record.gate.mechanism}</ProseFollow>
          {record.gate.regulator_fallback ? (
            <ProseFollow>
              {record.gate.regulator_fallback} provides statewide guidance or steps in
              where the primary agency does not cover the activity. In {record.name},
              geography usually determines who handles your{" "}
              {record.gate.type === "none" ? "cottage food compliance" : "notification or registration"}
              .
            </ProseFollow>
          ) : null}
        </>
      ) : null}

      {by === "sales_channel" ? (
        <>
          <Prose>
            In {record.name}, who regulates you depends on who you sell to, not only where
            you live.
          </Prose>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--field)] leading-relaxed">
            <li>
              <strong className="font-semibold">Direct to the person eating it</strong>
              {" - "}
              {record.gate.regulator_primary}.
            </li>
            <li>
              <strong className="font-semibold">Selling to a business to on-sell</strong>
              {" - "}
              {record.gate.regulator_fallback || "the statewide food authority"}.
            </li>
          </ul>
          <ProseFollow>{record.gate.mechanism}</ProseFollow>
        </>
      ) : null}

      {by === "business_class" || by === "food_risk" ? (
        <>
          <Prose>
            In {record.name}, the path depends on{" "}
            {by === "business_class" ? "business class" : "food risk"}
            {record.classification?.notes ? `. ${record.classification.notes}` : "."}
          </Prose>
          <ProseFollow>
            Primary agency: {record.gate.regulator_primary}
            {record.gate.regulator_fallback
              ? `. Fallback or related agency: ${record.gate.regulator_fallback}.`
              : "."}
          </ProseFollow>
          <ProseFollow>{record.gate.mechanism}</ProseFollow>
        </>
      ) : null}

      {record.premises.home_kitchen_allowed === true ? (
        <ProseFollow>
          Home-based preparation can be allowed, but being home-based does not exempt you
          from {record.country === "US" ? "state cottage food and food-safety rules" : "the Food Standards Code"}
          . The regulator can still assess whether the premises and activity are suitable.
        </ProseFollow>
      ) : null}
    </section>
  );
}
