export const CATEGORY_COLUMNS = [2, 3, 4] as const;
export const CATEGORY_MOBILE_COLUMNS = [1, 2] as const;
export const CATEGORY_ALIGNS = ["left", "centre"] as const;
export const CATEGORY_CARD_STYLES = ["classic", "editorial"] as const;

export type CategoryColumns = (typeof CATEGORY_COLUMNS)[number];
export type CategoryMobileColumns = (typeof CATEGORY_MOBILE_COLUMNS)[number];
export type CategoryAlign = (typeof CATEGORY_ALIGNS)[number];
export type CategoryCardStyle = (typeof CATEGORY_CARD_STYLES)[number];

/** Category page settings as saved on the section; missing values fall back to the defaults. */
export type CategoryDetailProps = {
  showTitle?: boolean;
  showTopDescription?: boolean;
  showBottomDescription?: boolean;
  align?: CategoryAlign;
  columns?: CategoryColumns;
  mobileColumns?: CategoryMobileColumns;
  cardStyle?: CategoryCardStyle;
  showPrice?: boolean;
  showAvailability?: boolean;
};

export type CategoryDetailView = Required<CategoryDetailProps>;

function oneOf<T>(list: readonly T[], value: unknown, fallback: T): T {
  return list.includes(value as T) ? (value as T) : fallback;
}

export function categoryDetailView(p: Record<string, unknown>): CategoryDetailView {
  return {
    showTitle: p.showTitle !== false,
    showTopDescription: p.showTopDescription !== false,
    showBottomDescription: p.showBottomDescription !== false,
    align: oneOf(CATEGORY_ALIGNS, p.align, "left"),
    columns: oneOf(CATEGORY_COLUMNS, p.columns, 3),
    mobileColumns: oneOf(CATEGORY_MOBILE_COLUMNS, p.mobileColumns, 2),
    cardStyle: oneOf(CATEGORY_CARD_STYLES, p.cardStyle, "classic"),
    showPrice: p.showPrice !== false,
    showAvailability: p.showAvailability !== false,
  };
}

/** Static class names so Tailwind keeps every combination. */
const MOBILE_COLS: Record<CategoryMobileColumns, string> = { 1: "grid-cols-1", 2: "grid-cols-2" };
const WIDE_COLS: Record<CategoryColumns, string> = {
  2: "sf-md:grid-cols-2",
  3: "sf-md:grid-cols-3",
  4: "sf-md:grid-cols-3 sf-lg:grid-cols-4",
};

export function categoryGridClass(view: CategoryDetailView): string {
  return `${MOBILE_COLS[view.mobileColumns]} ${WIDE_COLS[view.columns]}`;
}
