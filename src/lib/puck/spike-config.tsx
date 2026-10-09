"use client";

import type { Config, Permissions } from "@puckeditor/core";
import PuckHeroBlock from "@/components/puck/blocks/PuckHeroBlock";
import PuckTextBlock from "@/components/puck/blocks/PuckTextBlock";
import PuckAboutBlock from "@/components/puck/blocks/PuckAboutBlock";
import PuckFeaturedProductsBlock from "@/components/puck/blocks/PuckFeaturedProductsBlock";
import PuckUpcomingMenusBlock from "@/components/puck/blocks/PuckUpcomingMenusBlock";
import ProductPickerField from "@/components/puck/editor/fields/ProductPickerField";
import CategoryPickerField from "@/components/puck/editor/fields/CategoryPickerField";
import { useEditorChrome } from "@/components/puck/editor/EditorChromeContext";
import type { PuckSpikeMetadata } from "./types";
import { sectionRule } from "./section-registry";

export type PuckSpikeComponents = {
  Hero: {
    headline: string;
    supportingText: string;
    layout: "simple" | "split" | "spotlight" | "background";
    ctaLabel: string;
    showCta: boolean;
  };
  Text: {
    heading: string;
    body: string;
    alignment: "left" | "centre";
  };
  FeaturedProducts: {
    source: "all" | "category" | "manual";
    categoryId: string;
    productIds: string[];
    limit: number;
    layout: "grid" | "list";
    columns: 2 | 3 | 4;
    showPrice: boolean;
    showAvailability: boolean;
  };
  UpcomingMenus: {
    maxItems: number;
    showClosingDate: boolean;
    cardStyle: "card" | "minimal";
  };
  About: {
    heading: string;
    body: string;
    layout: "simple" | "card";
  };
};

function spikeMeta(puck: { metadata: unknown }): PuckSpikeMetadata {
  return puck.metadata as PuckSpikeMetadata;
}

function sectionPermissions(
  type: string,
  permissions: Partial<Permissions>,
): Partial<Permissions> {
  const rule = sectionRule(type);
  return {
    ...permissions,
    duplicate: rule?.singleton ? false : permissions.duplicate,
    delete: rule?.required ? false : permissions.delete,
  };
}

function ProductIdsField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const { metadata } = useEditorChrome();
  return (
    <ProductPickerField
      value={value ?? []}
      onChange={onChange}
      products={metadata.products}
    />
  );
}

function CategoryIdField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { metadata } = useEditorChrome();
  return (
    <CategoryPickerField
      value={value ?? ""}
      onChange={onChange}
      categories={metadata.categories}
    />
  );
}

export const puckSpikeConfig: Config<PuckSpikeComponents> = {
  root: { fields: {} },
  components: {
    Hero: {
      label: "Hero",
      resolvePermissions: (data, { permissions }) =>
        sectionPermissions("Hero", permissions),
      fields: {
        headline: { type: "text", label: "Headline" },
        supportingText: { type: "textarea", label: "Supporting text" },
        layout: {
          type: "select",
          label: "Layout",
          options: [
            { label: "Simple", value: "simple" },
            { label: "Split", value: "split" },
            { label: "Spotlight", value: "spotlight" },
            { label: "Background image", value: "background" },
          ],
        },
        ctaLabel: { type: "text", label: "Button label" },
        showCta: {
          type: "radio",
          label: "Show shop button",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      defaultProps: {
        headline: "",
        supportingText: "",
        layout: "simple",
        ctaLabel: "Shop now",
        showCta: true,
      },
      render: (props) => (
        <PuckHeroBlock {...props} puck={{ metadata: spikeMeta(props.puck) }} />
      ),
    },
    Text: {
      label: "Text & image",
      fields: {
        heading: { type: "text", label: "Heading" },
        body: { type: "textarea", label: "Text" },
        alignment: {
          type: "select",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Centre", value: "centre" },
          ],
        },
      },
      defaultProps: { heading: "", body: "", alignment: "left" },
      render: PuckTextBlock,
    },
    FeaturedProducts: {
      label: "Products",
      resolvePermissions: (data, { permissions }) =>
        sectionPermissions("FeaturedProducts", permissions),
      resolveFields: (data, { fields }) => ({
        ...fields,
        categoryId: {
          ...fields.categoryId,
          visible: data.props.source === "category",
        },
        productIds: {
          ...fields.productIds,
          visible: data.props.source === "manual",
        },
      }),
      fields: {
        source: {
          type: "select",
          label: "Show",
          options: [
            { label: "All products", value: "all" },
            { label: "A category", value: "category" },
            { label: "Choose products", value: "manual" },
          ],
        },
        categoryId: {
          type: "custom",
          label: "Category",
          render: CategoryIdField,
        },
        productIds: {
          type: "custom",
          label: "Products",
          render: ProductIdsField,
        },
        limit: {
          type: "number",
          label: "Number of products",
          min: 1,
          max: 12,
        },
        layout: {
          type: "select",
          label: "Layout",
          options: [
            { label: "Grid", value: "grid" },
            { label: "List", value: "list" },
          ],
        },
        columns: {
          type: "select",
          label: "Columns",
          options: [
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4", value: 4 },
          ],
        },
        showPrice: {
          type: "radio",
          label: "Show prices",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        showAvailability: {
          type: "radio",
          label: "Show availability",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      defaultProps: {
        source: "all",
        categoryId: "",
        productIds: [],
        limit: 8,
        layout: "grid",
        columns: 3,
        showPrice: true,
        showAvailability: true,
      },
      render: (props) => (
        <PuckFeaturedProductsBlock
          {...props}
          puck={{
            metadata: spikeMeta(props.puck),
            isEditing: props.puck.isEditing,
          }}
        />
      ),
    },
    UpcomingMenus: {
      label: "Next drop",
      resolvePermissions: (data, { permissions }) =>
        sectionPermissions("UpcomingMenus", permissions),
      fields: {
        maxItems: { type: "number", label: "Maximum menus", min: 1, max: 6 },
        showClosingDate: {
          type: "radio",
          label: "Show closing date",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        cardStyle: {
          type: "select",
          label: "Style",
          options: [
            { label: "Card", value: "card" },
            { label: "Minimal", value: "minimal" },
          ],
        },
      },
      defaultProps: {
        maxItems: 3,
        showClosingDate: true,
        cardStyle: "card",
      },
      render: (props) => (
        <PuckUpcomingMenusBlock
          {...props}
          puck={{ metadata: spikeMeta(props.puck) }}
        />
      ),
    },
    About: {
      label: "About us",
      resolvePermissions: (data, { permissions }) =>
        sectionPermissions("About", permissions),
      fields: {
        heading: { type: "text", label: "Heading" },
        body: { type: "textarea", label: "Your story" },
        layout: {
          type: "select",
          label: "Style",
          options: [
            { label: "Simple", value: "simple" },
            { label: "Card", value: "card" },
          ],
        },
      },
      defaultProps: { heading: "About us", body: "", layout: "simple" },
      render: PuckAboutBlock,
    },
  },
};
