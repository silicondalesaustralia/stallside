import { redirect } from "next/navigation";
import { businessQrHref } from "@/lib/qr/hrefs";

export default async function StandQrPage({ params }: { params: Promise<{ standId: string }> }) {
  const { standId } = await params;
  redirect(businessQrHref(standId));
}
