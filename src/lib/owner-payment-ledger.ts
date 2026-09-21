import { prisma } from "@/lib/prisma";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import { formatMoney } from "@/lib/money";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { listPaidSubscriptionInvoices } from "@/lib/stripe-ltv";

export type LedgerRow = {
  id: string;
  at: string;
  kind: "Transaction fee" | "Subscription";
  reference: string;
  detail: string;
  amount: string;
  search: string;
};

const whenFormat = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Australia/Adelaide",
});

function rowSearch(parts: string[]): string {
  return parts.join(" ").toLowerCase();
}

export async function loadOwnerPaymentLedger(input: {
  ownerId: string;
  stripeCustomerId: string | null;
}): Promise<{ rows: LedgerRow[]; invoiceError: string | null }> {
  const orders = await prisma.order.findMany({
    where: {
      ownerId: input.ownerId,
      paymentStatus: { in: COUNTED_STATUSES },
      platformFeeCents: { gt: 0 },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      platformFeeCents: true,
      currency: true,
      paymentMethod: true,
      stand: { select: { name: true } },
    },
  });

  const feeRows: TimedRow[] = orders.map((order) => {
    const via = order.paymentMethod.toLowerCase();
    const at = whenFormat.format(order.createdAt);
    const amount = formatMoney(order.platformFeeCents, order.currency);
    const detail = `${order.stand.name} · ${via}`;
    return {
      id: order.id,
      sortAt: order.createdAt.getTime(),
      at,
      kind: "Transaction fee",
      reference: order.orderNumber,
      detail,
      amount,
      search: rowSearch([at, "transaction fee", order.orderNumber, detail, amount]),
    };
  });

  let invoiceError: string | null = null;
  const subRows: TimedRow[] = [];
  if (input.stripeCustomerId && isStripeConfigured()) {
    try {
      const invoices = await listPaidSubscriptionInvoices(
        getStripe(),
        input.stripeCustomerId,
      );
      for (const invoice of invoices) {
        const at = whenFormat.format(invoice.paidAt);
        const amount = formatMoney(invoice.amountCents, invoice.currency);
        const reference = invoice.number ?? invoice.id;
        subRows.push({
          id: invoice.id,
          sortAt: invoice.paidAt.getTime(),
          at,
          kind: "Subscription",
          reference,
          detail: "Pro subscription",
          amount,
          search: rowSearch([
            at,
            "subscription",
            reference,
            "pro subscription",
            amount,
          ]),
        });
      }
    } catch (error) {
      console.error("Owner payment ledger: subscription invoices", error);
      invoiceError = "Subscription payments could not be loaded from Stripe.";
    }
  }

  const rows = [...subRows, ...feeRows]
    .sort((a, b) => b.sortAt - a.sortAt)
    .map(({ sortAt: _sortAt, ...row }) => row);

  return { rows, invoiceError };
}

type TimedRow = LedgerRow & { sortAt: number };
