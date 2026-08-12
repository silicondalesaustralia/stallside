import {
  chunkForSheet,
  type LabelSheetTemplate,
} from "@/lib/print-label-sheets";
import CollectionPrintBrand, { type PrintBrand } from "./CollectionPrintBrand";

export type PrintLabelOrder = {
  id: string;
  orderNumber: string;
  customerName: string | null;
  handoverLabel: string;
  addressLine: string | null;
  items: {
    id: string;
    quantity: number;
    productNameSnapshot: string;
    optionsSnapshot: string | null;
  }[];
};

export default function CollectionLabelsPrint({
  orders,
  template,
  brand,
  showBrand,
  printId,
}: {
  orders: PrintLabelOrder[];
  template: LabelSheetTemplate;
  brand: PrintBrand;
  showBrand: boolean;
  printId: string;
}) {
  const pages = chunkForSheet(orders, template.perSheet);

  return (
    <div className="collections-print-labels" data-print-id={printId}>
      {pages.map((pageOrders, pageIndex) => (
        <div
          key={pageIndex}
          className="collections-label-page"
          data-cut-guides={template.id === "a4-cards" ? "1" : "0"}
          style={{
            width: `${template.pageWidthMm}mm`,
            height: `${template.pageHeightMm}mm`,
            paddingTop: `${template.marginTopMm}mm`,
            paddingLeft: `${template.marginLeftMm}mm`,
            boxSizing: "border-box",
            display: "grid",
            gridTemplateColumns: `repeat(${template.cols}, ${template.labelWidthMm}mm)`,
            gridTemplateRows: `repeat(${template.rows}, ${template.labelHeightMm}mm)`,
            columnGap: `${template.gapXMm}mm`,
            rowGap: `${template.gapYMm}mm`,
          }}
        >
          {pageOrders.map((order) => (
            <LabelCell
              key={order.id}
              order={order}
              padMm={template.padMm}
              brand={brand}
              showBrand={showBrand}
              compact={template.id === "l7160" || template.id === "l7162"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function LabelCell({
  order,
  padMm,
  brand,
  showBrand,
  compact,
}: {
  order: PrintLabelOrder;
  padMm: number;
  brand: PrintBrand;
  showBrand: boolean;
  compact: boolean;
}) {
  return (
    <div
      className="collections-label-cell flex flex-col overflow-hidden"
      style={{
        width: "100%",
        height: "100%",
        padding: `${padMm}mm`,
        boxSizing: "border-box",
        fontSize: compact ? "7.5pt" : "8.5pt",
        lineHeight: 1.25,
      }}
    >
      {showBrand ? (
        <div className="mb-[1mm] shrink-0 border-b border-black/20 pb-[1mm]">
          <CollectionPrintBrand brand={brand} compact />
        </div>
      ) : null}
      <p
        className="shrink-0 font-bold"
        style={{ fontSize: compact ? "9pt" : "10pt" }}
      >
        {order.customerName ?? "Customer"}
      </p>
      <p className="shrink-0 text-black/80">{order.handoverLabel}</p>
      {order.addressLine ? (
        <p className="shrink-0 truncate text-black/70">{order.addressLine}</p>
      ) : null}
      <ul className="mt-[1mm] min-h-0 flex-1 overflow-hidden">
        {order.items.map((item) => (
          <li key={item.id} className="truncate">
            {item.quantity}× {item.productNameSnapshot}
            {item.optionsSnapshot ? ` (${item.optionsSnapshot})` : ""}
          </li>
        ))}
      </ul>
      <p className="mt-auto shrink-0 pt-[0.5mm] text-[7pt] text-black/60">
        {order.orderNumber}
      </p>
    </div>
  );
}
