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
    { id: "title", label: "Category name (category pages)" },
    { id: "topDescription", label: "Category description (category pages)" },
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
  CraftFarmStandSection: [
    { id: "cardLabel", label: "Card titles (Location, Stand hours…)" },
    { id: "cardText", label: "Card text" },
    { id: "cardLink", label: "Get directions link" },
  ],
  CraftPreOrderSection: [
    { id: "eyebrow", label: "Small label above the title" },
    { id: "title", label: "Title" },
    { id: "intro", label: "Intro text" },
    { id: "factLabel", label: "Fact labels (Order by, Collect…)" },
    { id: "factValue", label: "Fact values (dates)" },
    { id: "cardHeading", label: "Order card heading" },
    { id: "productName", label: "Product names" },
    { id: "price", label: "Prices" },
    { id: "smallPrint", label: "Collection reminder" },
    { id: "detailsHeading", label: "Details headings" },
    { id: "detailsText", label: "Details text" },
  ],
  CraftSubscriptionSection: [
    { id: "eyebrow", label: "Small label above the title" },
    { id: "title", label: "Title" },
    { id: "intro", label: "Intro text" },
    { id: "factValue", label: "Fact figures" },
    { id: "factLabel", label: "Fact labels" },
    { id: "price", label: "Headline price" },
    { id: "valueLine", label: "Line under the price" },
    { id: "stepTitle", label: "How it works step titles" },
    { id: "stepText", label: "How it works step text" },
    { id: "detailsHeading", label: "Terms headings" },
    { id: "detailsText", label: "Terms text" },
    { id: "smallPrint", label: "Small print" },
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
