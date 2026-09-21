import { prisma } from "@/lib/prisma";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import { formatMoney } from "@/lib/money";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { listApplicationFeeEvents } from "@/lib/stripe-application-fees";
import { listPaidSubscriptionInvoices } from "@/lib/stripe-ltv";
import type { LedgerRow } from "@/lib/owner-payment-ledger-types";

export type { LedgerRow } from "@/lib/owner-payment-ledger-types";

const whenFormat = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Australia/Adelaide",
});

function rowSearch(parts: string[]): string {
  return parts.join(" ").toLowerCase();
}

type TimedRow = LedgerRow & { sortAt: number };

async function feeRowsFromStripe(accountId: string): Promise<TimedRow[]> {
  const fees = await listApplicationFeeEvents(getStripe(), { accountId });
  return fees.map((fee) => {
    const at = whenFormat.format(fee.createdAt);
    const amount = formatMoney(fee.amountCents, fee.currency);
    const reference = fee.paymentIntentId ?? fee.id;
    return {
      id: fee.id,
      sortAt: fee.createdAt.getTime(),
      at,
      kind: "Transaction fee" as const,
      reference,
      detail: "Vendl.app fee · Stripe",
      amount,
      search: rowSearch([at, "transaction fee", "vendl.app fee", reference, amount]),
    };
  });
}

async function feeRowsFromOrders(ownerId: string): Promise<TimedRow[]> {
  const orders = await prisma.order.findMany({
    where: {
      ownerId,
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
  return orders.map((order) => {
    const at = whenFormat.format(order.createdAt);
    const amount = formatMoney(order.platformFeeCents, order.currency);
    const detail = `${order.stand.name} · ${order.paymentMethod.toLowerCase()}`;
    return {
      id: order.id,
      sortAt: order.createdAt.getTime(),
      at,
      kind: "Transaction fee" as const,
      reference: order.orderNumber,
      detail,
      amount,
      search: rowSearch([at, "transaction fee", order.orderNumber, detail, amount]),
    };
  });
}

export async function loadOwnerPaymentLedger(input: {
  ownerId: string;
  stripeCustomerId: string | null;
  stripeAccountId: string | null;
}): Promise<{ rows: LedgerRow[]; invoiceError: string | null }> {
  let feeRows: TimedRow[] = [];
  if (input.stripeAccountId && isStripeConfigured()) {
    try {
      feeRows = await feeRowsFromStripe(input.stripeAccountId);
    } catch (error) {
      console.error("Owner payment ledger: application fees", error);
    }
  }
  if (feeRows.length === 0) {
    feeRows = await feeRowsFromOrders(input.ownerId);
  }

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
