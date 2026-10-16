"use client";

import type { BriefLook, LookSection } from "@/lib/website-ai/assistant/brief/look";
import type { BriefData } from "@/lib/website-ai/assistant/brief/schema";
import LookChoice from "./LookChoice";
import LookSectionsField from "./LookSectionsField";
import { PRODUCT_PAGE_OPTIONS, RICHNESS_OPTIONS, STYLE_OPTIONS } from "./look-copy";
import type { BriefUpdater } from "./assistant-copy";

type Props = { brief: BriefData; update: BriefUpdater; sections: LookSection[] };

export default function LookStep({ brief, update, sections }: Props) {
  const look = brief.look;
  const set = <K extends keyof BriefLook>(key: K, value: BriefLook[K]) =>
    update((prev) => ({ ...prev, look: { ...prev.look, [key]: value } }));

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-[var(--muted)]">
        A few quick choices about how your website looks. Not sure? Leave &ldquo;Choose for me&rdquo; and Vendl will decide.
        You can change everything later in the editor.
      </p>
      <LookChoice title="Style" name="look-style" options={STYLE_OPTIONS} value={look.style} onChange={(v) => set("style", v)} />
      <LookChoice
        title="How much on the homepage"
        name="look-richness"
        options={RICHNESS_OPTIONS}
        value={look.richness}
        onChange={(v) => set("richness", v)}
      />
      <LookChoice
        title="Product page"
        name="look-product"
        options={PRODUCT_PAGE_OPTIONS}
        value={look.productPage}
        onChange={(v) => set("productPage", v)}
      />
      <LookSectionsField available={sections} value={look.sections} onChange={(v) => set("sections", v)} />
    </div>
  );
}
