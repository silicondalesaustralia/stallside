import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/generated/prisma/client";

export default async function CheckoutCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  let standSlug: string | null = null;

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { stand: true },
    });
    if (order?.paymentStatus === PaymentStatus.PENDING) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.CANCELLED },
      });
    }
    standSlug = order?.stand.slug ?? null;
  }

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <div className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-8">
        <div
          aria-hidden
          className="absolute left-4 top-4 size-8 border-l-[3px] border-t-[3px] border-[var(--warn)]"
          style={{ borderTopLeftRadius: 8 }}
        />
        <p className="font-receipt text-4xl text-[var(--warn)]" aria-hidden>
          ‖
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
          Checkout cancelled
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          No charge was made. Stock was not reduced.
        </p>
      </div>
      {standSlug ? (
        <Link
          href={`/s/${standSlug}`}
          className="mt-8 inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Return to stand
        </Link>
      ) : (
        <Link href="/" className="mt-8 text-sm font-medium text-[var(--leaf-dark)] underline">
          Home
        </Link>
      )}
    </main>
  );
}
