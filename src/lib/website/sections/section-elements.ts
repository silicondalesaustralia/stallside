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
  ],
};

export function sectionElements(craftName: string): SectionElementDef[] {
  return SECTION_ELEMENTS[craftName] ?? [];
}
