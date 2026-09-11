import type { AISitePlan, AiSectionConfig } from "./types";
import type { DecorativeImageAssets } from "./decorative-images";

function patchSection(
  section: AiSectionConfig,
  patch: Partial<AiSectionConfig>,
): AiSectionConfig {
  return {
    ...section,
    ...patch,
    props: { ...(section.props ?? {}), ...(patch.props ?? {}) },
  };
}

/** Attach decorative image URLs + placeholder markers onto the HOME plan. */
export function applyDecorativeImagesToPlan(
  plan: AISitePlan,
  assets: DecorativeImageAssets,
): AISitePlan {
  return {
    ...plan,
    pages: plan.pages.map((page) => {
      if (page.pageType !== "HOME") return page;
      let sections = page.sections.map((section) => {
        if (section.type === "Hero") {
          return patchSection(section, {
            placeholderKind: "IMAGE_DECORATIVE",
            props: { decorativeImageUrl: assets.heroUrl, decorativeAlt: assets.heroAlt },
          });
        }
        if (section.type === "ImageText" || section.type === "About") {
          return patchSection(section, {
            placeholderKind: section.placeholderKind ?? "IMAGE_DECORATIVE",
            props: { imageUrl: assets.storyUrl, decorativeAlt: assets.storyAlt },
          });
        }
        return section;
      });

      const hasStoryImage = sections.some(
        (s) =>
          (s.type === "ImageText" || s.type === "About") &&
          Boolean(s.props?.imageUrl),
      );
      if (!hasStoryImage) {
        const storySection: AiSectionConfig = {
          id: "story-decorative",
          type: "ImageText",
          heading: "Our story",
          body: "Tell customers what you grow or bake…",
          copyKind: "INSTRUCTIONAL",
          placeholderKind: "IMAGE_DECORATIVE",
          props: { imageUrl: assets.storyUrl, decorativeAlt: assets.storyAlt },
        };
        sections = [
          ...sections.slice(0, Math.min(2, sections.length)),
          storySection,
          ...sections.slice(Math.min(2, sections.length)),
        ].slice(0, 10);
      }

      return { ...page, sections };
    }),
    changeSummary: plan.changeSummary
      ? `${plan.changeSummary} Images added.`
      : "Images added.",
  };
}
