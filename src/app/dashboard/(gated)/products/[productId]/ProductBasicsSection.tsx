import DashFormSection from "@/components/DashFormSection";
import RichTextField from "@/components/RichTextField";
import { PRODUCT_DESCRIPTION_MAX } from "@/lib/product-limits";

/** Product name and the formatted description shown on the product page. */
export default function ProductBasicsSection({ name, description }: { name: string; description: string | null }) {
  return (
    <DashFormSection title="Product">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Name</span>
        <input
          name="name"
          required
          maxLength={120}
          defaultValue={name}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base"
        />
      </label>
      <RichTextField
        name="description"
        label="Description"
        defaultValue={description}
        placeholder="What makes it special, how it's made, how to use or store it…"
        maxLength={PRODUCT_DESCRIPTION_MAX}
      />
    </DashFormSection>
  );
}
