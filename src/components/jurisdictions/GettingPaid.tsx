import Link from "next/link";
import {
  Prose,
  ProseFollow,
  SectionH2,
  SectionH3,
} from "@/components/jurisdictions/section-chrome";
import type { JurisdictionRecord } from "@/lib/jurisdictions/types";

export default function GettingPaid({ record }: { record: JurisdictionRecord }) {
  if (record.country === "US") {
    return (
      <section className="mt-12">
        <SectionH2>Getting paid</SectionH2>
        <Prose>
          Cottage food permission is not a tax registration. Confirm sales tax, business
          licensing and income tax rules for {record.name} separately.
        </Prose>
        <SectionH3>Taking payments at an unattended stand</SectionH3>
        <ProseFollow>
          Once the compliance side is sorted, an unattended stand still has a practical
          problem: taking payment without requiring somebody to stand beside it all day. If
          you want customers to scan a QR code, select what they are buying, pay and update
          your stall inventory without someone being there,{" "}
          <Link href="/stall" className="underline underline-offset-2">
            see how Vendl handles farm-stand checkout and pre-orders
          </Link>
          .
        </ProseFollow>
      </section>
    );
  }

  const gst =
    typeof record.money.gst_threshold === "number"
      ? `A$${record.money.gst_threshold.toLocaleString("en-AU")}`
      : null;

  return (
    <section className="mt-12">
      <SectionH2>GST, ABNs and getting paid</SectionH2>
      <Prose>
        Food-business notification or registration does not register you for tax.
      </Prose>
      {gst ? (
        <ProseFollow>
          The Australian Taxation Office says a business generally reaches the GST
          registration threshold when its current or projected GST turnover is {gst} or
          more. For non-profit bodies, a higher threshold can apply. GST turnover is based
          on turnover, not profit. Whether GST actually applies to an individual sale is a
          separate question: many basic foods are GST-free, while other prepared foods and
          beverages can be taxable.
        </ProseFollow>
      ) : (
        <ProseFollow>
          Confirm the GST registration threshold and food GST treatment with the Australian
          Taxation Office before you rely on a figure.
        </ProseFollow>
      )}

      <SectionH3>Is your stand a business or a hobby?</SectionH3>
      <ProseFollow>
        There is no single dollar figure that turns a hobby into a business. Australian
        Government guidance looks at profit intention, repetition, scale, whether you
        operate in a planned and businesslike way, and whether you keep business records.
        An ABN is not compulsory for every business, although having one can matter for GST
        registration and dealing with other businesses.
      </ProseFollow>
      <ProseFollow>
        Do not confuse the tax test with the Food Act. An activity can attract food-safety
        obligations even where it is small, occasional or community-based.
      </ProseFollow>

      <SectionH3>Taking payments at an unattended stand</SectionH3>
      <ProseFollow>
        Once the compliance side is sorted, an unattended farm stand still has a practical
        problem: taking payment without requiring somebody to stand beside it all day. Cash
        and bank transfers can work, but they make it harder to tie a payment to an order,
        manage stock or offer customers pre-orders.
      </ProseFollow>
      <ProseFollow>
        If you want customers to scan a QR code, select what they are buying, pay and update
        your stall inventory without someone being there,{" "}
        <Link href="/stall" className="underline underline-offset-2">
          see how Vendl handles farm-stand checkout and pre-orders
        </Link>
        .
      </ProseFollow>
    </section>
  );
}
