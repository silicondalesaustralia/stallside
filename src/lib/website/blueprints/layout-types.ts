export type HeaderPattern =
  | "CLASSIC"
  | "CENTRED"
  | "STACKED"
  | "UTILITY_SEARCH"
  | "MINIMAL_ICON"
  | "INFO_BAR"
  | "BOLD_BAR";

export type HeroVariant =
  | "EDITORIAL_STACK"
  | "SPLIT_CATEGORY_TILES"
  | "ARCH_FRAME"
  | "FRAMED_INSET"
  | "TYPE_BLOCK"
  | "INFO_PANEL"
  | "COLLAGE_TRIO"
  | "SPLIT_MEDIA"
  | "PROMO_BANNER"
  | "PRODUCT_FEATURE";

export type MerchPattern =
  | "FEATURE_ROWS_LARGE_GRID"
  | "CATEGORY_ROWS"
  | "STORY_COLUMNS_MENU_LIST"
  | "LARGE_GRID_2"
  | "COLOUR_BLOCKS_GRID_4"
  | "AVAILABLE_NOW"
  | "GALLERY_PROCESS"
  | "TABBED_GRID_4"
  | "DENSE_GRID_6"
  | "CURATED_SETS";

export type BlueprintLayout = {
  header: HeaderPattern;
  hero: HeroVariant;
  merch: MerchPattern;
  gridColumns: {
    desktop: number | "LIST" | "MASONRY" | "SCROLL_ROW";
    mobile: number | "LIST" | "MASONRY" | "SCROLL_ROW";
  };
  cardTreatment:
    | "BORDERLESS"
    | "CAPTIONED"
    | "TINTED"
    | "LIST_ROW"
    | "THICK_BORDER"
    | "SOFT_SHADOW"
    | "HAIRLINE"
    | "COMPACT_HAIRLINE"
    | "TINTED_PANEL";
  imageShape: "RECT" | "ROUNDED" | "ROUNDED_LG" | "ARCH" | "CUTOUT" | "MIXED_RATIO";
  sectionSpacing: "S" | "M" | "L" | "XL" | "XXL";
  colourMode: "LIGHT" | "WARM" | "TINTED" | "STONE" | "DARK" | "BLUSH";
};

export type FontRef = {
  family: string;
  weights: number[];
  italic?: boolean;
};

export type BlueprintBrandKit = {
  palette: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    primary: string;
    onPrimary: string;
    accent: string;
    onAccent: string;
  };
  typography: {
    display: FontRef;
    body: FontRef;
    scaleRatio: number;
    headingCase: "SENTENCE" | "TITLE" | "UPPER";
    headingTrackingEm: number;
  };
  logoPlacement: {
    alignment: "LEFT" | "CENTRE" | "CENTRE_ABOVE_NAV";
    plate: "NONE" | "BADGE" | "STICKER";
    maxHeightPx: number;
    footerMaxHeightPx: number;
    wordmark: {
      font: "DISPLAY" | "BODY";
      case: "AS_IS" | "UPPER" | "LOWER";
      trackingEm: number;
      longName: "SCALE" | "STACK";
    };
  };
  shape: {
    radiusPx: number;
    buttonStyle:
      | "SQUARE"
      | "ROUNDED"
      | "PILL"
      | "TEXT_LINK"
      | "OFFSET_SHADOW"
      | "DOUBLE_OUTLINE";
  };
};

export type BlueprintAssetNeeds = {
  minPhotos: number;
  minProductsWithPhotos: number;
  usesCutouts: boolean;
};
