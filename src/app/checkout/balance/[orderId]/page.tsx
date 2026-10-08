import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentMethod, PaymentStatus, PaymentTiming } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { verifyOrderAccessToken } from "@/lib/order-access-token";
import { squareApplicationId } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";
import BalanceAuthButton from "./BalanceAuthButton";
import SquareBalanceCard from "./SquareBalanceCard";

async function squareBalanceConfig(order: { ownerId: string; squareLocationId: string | null }) {
  const applicationId = squareApplicationId();
  try {
    const conn = await getSquareConnection(order.ownerId);
    const locationId = order.squareLocationId ?? conn?.primaryLocationId;
    if (!applicationId || conn?.status !== "ACTIVE" || !locationId) return null;
    return { applicationId, locationId };
  } catch (error) {
    console.error("Square balance config failed", order.ownerId, error);
    return null;
  }
}

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
  const square = order.paymentMethod === PaymentMethod.SQUARE ? await squareBalanceConfig(order) : null;
  const showRetry = order.paymentMethod !== PaymentMethod.SQUARE || Boolean(order.squareCardId);

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
      {showRetry ? <BalanceAuthButton orderId={order.id} token={token!} /> : null}
      {square ? (
        <SquareBalanceCard
          orderId={order.id}
          token={token!}
          applicationId={square.applicationId}
          locationId={square.locationId}
        />
      ) : null}
      <Link href={`/s/${order.stand.slug}`} className="text-sm text-[var(--leaf-dark)] underline">
        Back to shop
      </Link>
    </main>
  );
}
