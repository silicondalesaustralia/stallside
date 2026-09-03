import Link from "next/link";
import { Suspense } from "react";
import QRCode from "qrcode";
import { HandoverMode } from "@/lib/ops/enums";
import { requireOwner } from "@/lib/session";
import { ensureOpsLookupToken, type OpsBoardOrder } from "@/lib/ops/board";
import { appBaseUrl } from "@/lib/app-url";
import {
  DEFAULT_LABEL_SHEET,
  LABEL_SHEETS,
  type LabelSheetId,
} from "@/lib/print-label-sheets";
import CollectionLabelsPrint, {
  type PrintLabelOrder,
} from "@/app/dashboard/(gated)/collections/CollectionLabelsPrint";
import {
  deliveryAddressLine,
  fulfilmentContext,
  handoverOf,
} from "../../ops-display";
import { loadOrdersForPrint, loadPrintBrand } from "../load-print-orders";
import PrintAuto from "../PrintAuto";
import OpsLabelSheetPicker from "./OpsLabelSheetPicker";

export default async function OpsLabelsPrintPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    ids?: string;
    standId?: string;
    sheet?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const sheetId = (
    sp.sheet && sp.sheet in LABEL_SHEETS ? sp.sheet : DEFAULT_LABEL_SHEET
  ) as LabelSheetId;

  const orders = await loadOrdersForPrint(owner.id, {
    ids: sp.ids,
    view: sp.view,
    standId: sp.standId,
  });
  const brand = await loadPrintBrand(owner.id, sp.standId);
  const { labelOrders, qrRows } = await buildLabelPayload(owner.id, orders);

  return (
    <main className="flex flex-col gap-4 p-4 text-black">
      <div className="print:hidden flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/fulfilment/orders"
          className="text-sm underline text-[var(--muted)]"
        >
          Back to board
        </Link>
        <Suspense fallback={null}>
          <OpsLabelSheetPicker current={sheetId} />
        </Suspense>
        <PrintAuto />
        <p className="text-xs text-[var(--muted)]">
          Pickup labels omit phone/email. Address only on delivery labels.
        </p>
      </div>

      <CollectionLabelsPrint
        orders={labelOrders}
        template={LABEL_SHEETS[sheetId]}
        brand={brand}
        showBrand
        printId="ops-labels"
      />

      {qrRows.length > 0 ? (
        <section className="mt-4 grid gap-3 break-inside-avoid sm:grid-cols-2 md:grid-cols-3">
          <p className="sm:col-span-full text-sm font-medium">
            Order lookup QR
          </p>
          {qrRows.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-3 rounded-lg border border-black/20 p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.dataUrl} alt="" width={64} height={64} />
              <p className="text-sm font-semibold">#{row.orderNumber}</p>
            </div>
          ))}
        </section>
      ) : null}
    </main>
  );
}

async function buildLabelPayload(ownerId: string, orders: OpsBoardOrder[]) {
  const labelOrders: PrintLabelOrder[] = [];
  const qrRows: {
    id: string;
    orderNumber: string;
    dataUrl: string;
  }[] = [];

  for (const order of orders) {
    const token = await ensureOpsLookupToken(order.id, ownerId);
    const handover = handoverOf(order);
    labelOrders.push({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      handoverLabel: fulfilmentContext(order),
      addressLine:
        handover === HandoverMode.DELIVER
          ? deliveryAddressLine(order)
          : null,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        productNameSnapshot: item.productNameSnapshot,
        optionsSnapshot: item.optionsSnapshot,
      })),
    });
    const url = `${appBaseUrl()}/dashboard/ops/lookup/${token}`;
    qrRows.push({
      id: order.id,
      orderNumber: order.orderNumber,
      dataUrl: await QRCode.toDataURL(url, {
        margin: 1,
        width: 96,
        color: { dark: "#000000", light: "#ffffff" },
      }),
    });
  }

  return { labelOrders, qrRows };
}
