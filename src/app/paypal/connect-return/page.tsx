import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** PayPal Partner return — no session yet; bounce through login if needed. */
export default async function PayPalConnectReturnPage({
  searchParams,
}: {
  searchParams: Promise<{
    merchantIdInPayPal?: string;
    merchantId?: string;
    permissionsGranted?: string;
  }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams({ return: "1" });
  if (params.merchantIdInPayPal) {
    qs.set("merchantIdInPayPal", params.merchantIdInPayPal);
  }
  if (params.permissionsGranted) {
    qs.set("permissionsGranted", params.permissionsGranted);
  }

  const dest = `/dashboard/settings/paypal?${qs.toString()}`;
  const session = await auth();
  if (session?.user?.id) {
    redirect(dest);
  }
  redirect(`/login?callbackUrl=${encodeURIComponent(dest)}`);
}
