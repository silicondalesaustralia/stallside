import Link from "next/link";
import type { StudioCommerceCategory } from "@/lib/studio/commerce-pages";
import RichText from "@/components/studio/RichText";
import SectionElement from "@/components/studio/SectionElement";
import SectionHeadingTag from "@/components/studio/SectionHeadingTag";

const HINT = "mt-3 rounded-lg border border-dashed border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]";

/** The current category's name and top description, both managed on the category's dashboard page. */
export default function StudioCategoryIntro({
  category,
  centred,
  isEditing,
}: {
  category: StudioCommerceCategory | undefined;
  centred: boolean;
  isEditing?: boolean;
}) {
  const description = category?.description?.trim();
  return (
    <div className={centred ? "text-center" : undefined} data-edit-category={isEditing ? category?.id : undefined}>
      <SectionHeadingTag defaultTag="h1" el="title" className="studio-heading">
        {category?.title || "Category name"}
      </SectionHeadingTag>
      {description ? (
        <SectionElement
          el="topDescription"
          as="div"
          className={`mt-3 max-w-3xl text-lg leading-relaxed text-[var(--muted)] ${centred ? "mx-auto" : ""}`}
        >
          <RichText value={description} />
        </SectionElement>
      ) : null}
      {isEditing ? (
        <p className={HINT}>
          The title and description come from each category&apos;s settings.{" "}
          {category?.id ? (
            <Link href={`/dashboard/categories/${category.id}`} className="font-semibold underline" target="_blank">
              Edit this category
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
