"use client";

import Link from "next/link";
import SiteChoice from "./SiteChoice";
import { CONTACT_FORM_LAYOUTS, parseContactLayout } from "@/lib/studio/contact-form";
import type { CraftContactFormProps } from "@/components/studio/sections/CraftContactFormSection";

const LAYOUT_LABELS = { stacked: "Centred", split: "Text beside form" } as const;

/** Contact form section: layout, phone field, and where messages are sent. */
export default function ContactFormSettings({
  props,
  setProp,
}: {
  props: CraftContactFormProps;
  setProp: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <p className="text-xs text-[var(--muted)]">
        Edit the heading, intro, field labels, button and thank-you message directly on the page.
      </p>
      <SiteChoice
        label="Layout"
        options={CONTACT_FORM_LAYOUTS}
        labels={LAYOUT_LABELS}
        value={parseContactLayout(props.layout)}
        onChange={(v) => setProp("layout", v)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={props.showPhone !== false} onChange={(e) => setProp("showPhone", e.target.checked)} />
        Ask for a phone number (optional for customers)
      </label>
      <p className="rounded-lg bg-[var(--wash)] p-2.5 text-xs text-[var(--muted)]">
        Messages are emailed to your shop contact email. Reply to the email to answer the customer. Change the address in{" "}
        <Link href="/dashboard/website/details" className="font-semibold text-[var(--field)] underline">
          Shop details
        </Link>
        .
      </p>
    </>
  );
}
