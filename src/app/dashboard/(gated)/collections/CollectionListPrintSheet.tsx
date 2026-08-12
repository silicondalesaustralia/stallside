import CollectionPrintBrand, { type PrintBrand } from "./CollectionPrintBrand";

export type PrintDayGroup = {
  key: string;
  label: string;
  takenLabel: string;
  windowClosed: boolean;
  itemCount: number;
  skus: { name: string; qty: number }[];
  suburbs: { name: string; count: number }[];
  orders: {
    id: string;
    orderNumber: string;
    customerName: string | null;
    customerPhone: string | null;
    collectionStatus: string | null;
    handoverSummary: string;
    addressLine: string | null;
    items: {
      id: string;
      quantity: number;
      productNameSnapshot: string;
      optionsSnapshot: string | null;
    }[];
  }[];
};

export default function CollectionListPrintSheet({
  days,
  brand,
  showBrand,
}: {
  days: PrintDayGroup[];
  brand: PrintBrand;
  showBrand: boolean;
}) {
  return (
    <div className="collections-print-list hidden">
      <header className="mb-6 border-b border-black pb-3">
        {showBrand ? <CollectionPrintBrand brand={brand} /> : null}
        <p
          className={`text-sm text-black/70 ${showBrand ? "mt-2" : "text-base font-semibold text-black"}`}
        >
          Collections run sheet
        </p>
      </header>

      {days.map((day) => (
        <section key={day.key} className="mb-8 break-inside-avoid">
          <h2 className="text-lg font-semibold">{day.label}</h2>
          <p className="mt-1 text-sm">
            {day.skus.map((s) => `${s.name} ${s.qty}`).join(" · ") || "No items"}
          </p>
          <p className="mt-1 text-sm text-black/70">
            {day.orders.length} order{day.orders.length === 1 ? "" : "s"} ·{" "}
            {day.takenLabel} taken
            {day.windowClosed ? " · window closed" : ""}
            {day.itemCount
              ? ` · ${day.itemCount} item${day.itemCount === 1 ? "" : "s"}`
              : ""}
          </p>
          {day.suburbs.length > 0 ? (
            <p className="mt-1 text-sm">
              Deliver -{" "}
              {day.suburbs.map((s) => `${s.count} in ${s.name}`).join(", ")}
            </p>
          ) : null}

          <table className="mt-4 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-1.5 pr-2 font-semibold">Customer</th>
                <th className="py-1.5 pr-2 font-semibold">Items</th>
                <th className="py-1.5 pr-2 font-semibold">Status</th>
                <th className="py-1.5 font-semibold">Order</th>
              </tr>
            </thead>
            <tbody>
              {day.orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-black/20 align-top"
                >
                  <td className="py-2 pr-2">
                    <p className="font-medium">
                      {order.customerName ?? "Customer"}
                    </p>
                    <p className="text-xs text-black/70">{order.handoverSummary}</p>
                    {order.addressLine ? (
                      <p className="text-xs text-black/70">{order.addressLine}</p>
                    ) : null}
                    {order.customerPhone ? (
                      <p className="text-xs text-black/70">{order.customerPhone}</p>
                    ) : null}
                  </td>
                  <td className="py-2 pr-2">
                    <ul>
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity}× {item.productNameSnapshot}
                          {item.optionsSnapshot
                            ? ` (${item.optionsSnapshot})`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="whitespace-nowrap py-2 pr-2">
                    {order.collectionStatus ?? "ORDERED"}
                  </td>
                  <td className="whitespace-nowrap py-2 text-xs">
                    {order.orderNumber}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
