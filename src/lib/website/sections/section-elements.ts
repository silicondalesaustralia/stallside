export type SectionElementDef = { id: string; label: string };

/** Parts of a section the seller can restyle one by one; ids match the `el` names in the section's components. */
export const SECTION_ELEMENTS: Record<string, SectionElementDef[]> = {
  CraftProductDetailSection: [
    { id: "name", label: "Product name" },
    { id: "badge", label: "Pre-order label" },
    { id: "price", label: "Price" },
    { id: "description", label: "Description text" },
    { id: "descriptionList", label: "Description bullet points" },
    { id: "bullets", label: "Info lines under the buttons" },
    { id: "tabTitle", label: "Info tab titles" },
    { id: "tabBody", label: "Info tab text" },
    { id: "stars", label: "Review stars" },
    { id: "ratingCount", label: "Rating numbers" },
    { id: "reviewBody", label: "Review text" },
    { id: "reviewName", label: "Reviewer names" },
    { id: "reviewReply", label: "Your review replies" },
  ],
  CraftProductGridSection: [
    { id: "productName", label: "Product names" },
    { id: "productPrice", label: "Prices" },
    { id: "stars", label: "Stars" },
    { id: "ratingCount", label: "Rating numbers" },
  ],
  CraftReviewsSection: [
    { id: "stars", label: "Stars" },
    { id: "reviewTitle", label: "Review titles" },
    { id: "reviewBody", label: "Review text" },
    { id: "reviewName", label: "Reviewer names" },
    { id: "reviewReply", label: "Your replies" },
  ],
  CraftCategoriesSection: [
    { id: "intro", label: "Description" },
    { id: "categoryName", label: "Category names" },
    { id: "categoryDescription", label: "Category descriptions" },
    { id: "stars", label: "Stars" },
    { id: "ratingCount", label: "Rating numbers" },
  ],
  CraftCategoryDetailSection: [
    { id: "title", label: "Category name" },
    { id: "topDescription", label: "Top description" },
    { id: "bottomDescription", label: "Bottom description" },
    { id: "productName", label: "Product names" },
    { id: "productPrice", label: "Prices" },
  ],
};

export function sectionElements(craftName: string): SectionElementDef[] {
  return SECTION_ELEMENTS[craftName] ?? [];
}
