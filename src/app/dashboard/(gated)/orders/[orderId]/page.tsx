import { redirect } from "next/navigation";

/** Canonical order detail under Orders hub (ops view). */
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  redirect(`/dashboard/fulfilment/orders/${orderId}`);
}
