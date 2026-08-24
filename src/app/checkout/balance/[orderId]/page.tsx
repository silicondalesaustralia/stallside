import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentStatus, PaymentTiming } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { verifyOrderAccessToken } from "@/lib/order-access-token";
import BalanceAuthButton from "./BalanceAuthButton";

export default async function BalanceAuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderId } = await params;
  const { token } = await searchParams;
  if (!verifyOrderAccessToken(orderId, "balance", token)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { stand: true },
  });
  if (
    !order ||
    order.paymentTiming !== PaymentTiming.DEPOSIT_THEN_BALANCE ||
    (order.paymentStatus !== PaymentStatus.BALANCE_FAILED &&
      order.paymentStatus !== PaymentStatus.BALANCE_DUE &&
      order.paymentStatus !== PaymentStatus.DEPOSIT_PAID)
  ) {
    notFound();
  }

  const balance = formatMoney(order.balanceCents ?? 0, order.currency);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-6 px-4 py-16">
      <p className="text-sm text-[var(--muted)]">{APP_NAME}</p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
        Complete your balance
      </h1>
      <p className="text-[var(--muted)]">
        Order <strong>{order.orderNumber}</strong> at {order.stand.name} still
        owes <strong>{balance}</strong>. Tap below to retry the charge (you may
        need to authenticate with your bank).
      </p>
      <BalanceAuthButton orderId={order.id} token={token!} />
      <Link href={`/s/${order.stand.slug}`} className="text-sm text-[var(--leaf-dark)] underline">
        Back to stand
      </Link>
    </main>
  );
}
