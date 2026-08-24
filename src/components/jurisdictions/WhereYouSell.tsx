import {
  Prose,
  ProseFollow,
  SectionH2,
  SectionH3,
} from "@/components/jurisdictions/section-chrome";
import type { JurisdictionRecord } from "@/lib/jurisdictions/types";

export default function WhereYouSell({ record }: { record: JurisdictionRecord }) {
  const au = record.country === "AU";

  return (
    <section className="mt-12">
      <SectionH2>Where you can sell</SectionH2>
      <Prose>
        {au
          ? `${record.name} food law can clearly capture direct sales to the public, including direct sales of food that would otherwise sit with primary production. Selling from your own property is not automatically exempt just because you grew or produced the food yourself.`
          : `${record.name} cottage food rules set where and how you may sell. Treat the sales channel as part of the compliance question rather than assuming one exemption answers every issue.`}
      </Prose>
      {record.channels.notes ? (
        <ProseFollow>{record.channels.notes}</ProseFollow>
      ) : null}
      <ProseFollow>
        A farmers market may have its own application and insurance conditions. Interstate
        or out-of-state sales can introduce requirements beyond {record.name}&apos;s local
        rules. Confirm each channel before you rely on it.
      </ProseFollow>

      <SectionH3>Unattended stalls and honesty boxes</SectionH3>
      {record.channels.unattended_honesty_stall === "not_published" ||
      record.channels.unattended_honesty_stall == null ? (
        <ProseFollow>
          There is no special published &ldquo;honesty box exemption&rdquo; in the Tier 1
          material used for this page. An unattended stand selling food is still a method
          of selling food. Making the stand unattended does not change the product or remove
          food-safety obligations
          {record.scope.definition_of_sale_includes_donations === true
            ? ", and requesting payment or a donation can still count as a sale"
            : ""}
          .
        </ProseFollow>
      ) : record.channels.unattended_honesty_stall === true ? (
        <ProseFollow>
          Unattended or honesty-box sales are addressed as in scope under the published
          rules used here. Labelling, temperature control and contamination protections
          still apply.
        </ProseFollow>
      ) : (
        <ProseFollow>
          Unattended honesty-box sales are not allowed under the published rules used for
          this page.
        </ProseFollow>
      )}
      <ProseFollow>
        If payment is requested through an honesty box, QR code or electronic checkout, you
        are still conducting a sale where the food-law definition of sale is met.
      </ProseFollow>

      {au ? (
        <>
          <SectionH3>Planning approval is separate</SectionH3>
          <ProseFollow>
            Food-business notification or registration and permission to operate a roadside
            or front-gate stall are different issues. Your council&apos;s planning rules may
            regulate whether and how you can operate a business or roadside stall from your
            property. Food notification does not automatically give you planning approval,
            and planning approval does not replace your food-business obligations.
          </ProseFollow>
        </>
      ) : null}
    </section>
  );
}
