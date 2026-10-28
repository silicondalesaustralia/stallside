export type ImportEntity = "products" | "customers" | "inventory";

export type ImportField = {
  key: string;
  label: string;
  /** Lowercase header names that map here automatically. */
  aliases: string[];
  required?: boolean;
};

const option = (n: 1 | 2 | 3): ImportField[] => [
  { key: `option${n}Name`, label: `Option ${n} name`, aliases: [`option${n} name`, `option name ${n}`, `attribute ${n} name`] },
  { key: `option${n}Value`, label: `Option ${n} value`, aliases: [`option${n} value`, `option value ${n}`, `attribute ${n} value(s)`] },
];

export const PRODUCT_FIELDS: ImportField[] = [
  { key: "handle", label: "Group / handle", aliases: ["handle", "handleid", "product id", "parent", "slug", "url handle"] },
  { key: "name", label: "Product name", aliases: ["title", "name", "product name", "item name", "product"], required: true },
  { key: "description", label: "Description", aliases: ["description", "body (html)", "body", "short description", "product description", "plaindescription"] },
  { key: "price", label: "Price", aliases: ["price", "variant price", "regular price", "unit price"], required: true },
  { key: "salePrice", label: "Sale price", aliases: ["sale price", "online sale price"] },
  { key: "compareAtPrice", label: "Compare-at price", aliases: ["compare at price", "variant compare at price", "compare-at price", "strikethroughprice"] },
  { key: "cost", label: "Cost", aliases: ["cost", "cost per item", "unit cost", "default unit cost"] },
  { key: "sku", label: "SKU", aliases: ["sku", "variant sku"] },
  { key: "barcode", label: "Barcode / UPC", aliases: ["barcode", "barcodes", "upc", "gtin", "variant barcode", "ean"] },
  { key: "stock", label: "Stock on hand", aliases: ["stock", "quantity", "qty", "inventory", "inventory quantity", "on hand", "available", "stock quantity", "variant inventory qty"] },
  ...option(1),
  ...option(2),
  ...option(3),
  { key: "category", label: "Category", aliases: ["category", "categories", "type", "product type", "collection", "reporting category"] },
  { key: "imageUrl", label: "Image URL", aliases: ["image src", "product image url", "image", "images", "image url", "productimageurl", "hosted image urls"] },
  { key: "active", label: "Active / visible", aliases: ["status", "published", "visible", "active"] },
  { key: "taxable", label: "Taxable (GST)", aliases: ["taxable", "variant taxable", "charge tax", "tax status"] },
];

export const CUSTOMER_FIELDS: ImportField[] = [
  { key: "email", label: "Email", aliases: ["email", "email address", "email 1", "e-mail"], required: true },
  { key: "firstName", label: "First name", aliases: ["first name", "firstname", "given name"] },
  { key: "lastName", label: "Last name", aliases: ["last name", "lastname", "surname", "family name"] },
  { key: "name", label: "Full name", aliases: ["name", "full name", "customer name", "customer"] },
  { key: "phone", label: "Phone", aliases: ["phone", "phone number", "phone 1", "mobile", "default address phone"] },
  { key: "notes", label: "Notes", aliases: ["note", "notes", "memo"] },
  { key: "marketingConsent", label: "Accepts email marketing", aliases: ["accepts email marketing", "accepts marketing", "email subscription status", "email subscriber status", "marketing consent", "subscribed"] },
];

export const INVENTORY_FIELDS: ImportField[] = [
  { key: "sku", label: "SKU", aliases: ["sku", "variant sku"] },
  { key: "name", label: "Product name", aliases: ["title", "name", "product name", "item name", "product"] },
  { key: "option1Value", label: "Option 1 value", aliases: ["option1 value", "option 1 value", "option value 1"] },
  { key: "option2Value", label: "Option 2 value", aliases: ["option2 value", "option 2 value", "option value 2"] },
  { key: "option3Value", label: "Option 3 value", aliases: ["option3 value", "option 3 value", "option value 3"] },
  { key: "stock", label: "Stock on hand", aliases: ["on hand", "available", "stock", "quantity", "qty", "on hand (new)", "available (not editable)"], required: true },
];

export const FIELDS_BY_ENTITY: Record<ImportEntity, ImportField[]> = {
  products: PRODUCT_FIELDS,
  customers: CUSTOMER_FIELDS,
  inventory: INVENTORY_FIELDS,
};

export const ENTITY_LABELS: Record<ImportEntity, string> = {
  products: "Products",
  customers: "Customers",
  inventory: "Stock levels",
};
