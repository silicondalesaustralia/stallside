import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { APP_DOMAIN } from "@/lib/constants";
import { standCheckoutUrl, standQrDataUrl } from "@/lib/stand-qr";
import BrandMark from "@/components/BrandMark";
import QrActions from "./QrActions";
import QrPrintEditor from "./QrPrintEditor";

export default async function StandQrPage({
  params,
}: {
  params: Promise<{ standId: string }>;
}) {
  const { standId } = await params;
  const { owner } = await requireOwner();
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
  });
  if (!stand) notFound();

  const checkoutUrl = standCheckoutUrl(stand.slug);
  const qrDataUrl = await standQrDataUrl(checkoutUrl, 640);
  const signMessage =
    stand.qrSignMessage?.trim() || "Scan to browse and pay at this stand.";

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-8">
      <p className="text-sm text-[var(--muted)] print:hidden">
        <Link href="/dashboard/stands" className="underline">
          My stands
        </Link>
        {" · "}
        <Link href={`/dashboard/stands/${stand.id}`} className="underline">
          {stand.name}
        </Link>
      </p>

      <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-6 text-center print:border-0">
        <div
          aria-hidden
          className="absolute left-4 top-4 size-10 border-l-[4px] border-t-[4px] border-[var(--field)]"
          style={{ borderTopLeftRadius: 10 }}
        />
        <div
          aria-hidden
          className="absolute bottom-4 right-4 size-10 border-b-[4px] border-r-[4px] border-[var(--marigold)]"
          style={{ borderBottomRightRadius: 10 }}
        />
        <div className="flex justify-center">
          <BrandMark className="size-10" />
        </div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
          {stand.name}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{signMessage}</p>
        {stand.description ? (
          <p className="mt-3 text-sm text-[var(--ink)]">{stand.description}</p>
        ) : null}
        {stand.locationLabel ? (
          <p className="mt-2 text-xs text-[var(--muted)]">{stand.locationLabel}</p>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`QR code for ${stand.name}`}
          className="mx-auto mt-6 w-full max-w-[320px]"
        />
        <p className="mt-4 break-all font-receipt text-xs text-[var(--muted)]">{checkoutUrl}</p>
      </div>

      <div className="print:hidden">
        {!checkoutUrl.startsWith("https://") ? (
          <p className="mb-3 rounded-lg border border-[var(--warn)]/40 bg-[var(--panel)] px-3 py-2 text-sm text-[var(--warn)]">
            This QR still points at a local URL. Set{" "}
            <code className="font-receipt">NEXT_PUBLIC_APP_URL=https://{APP_DOMAIN}</code> in
            production and regenerate before printing.
          </p>
        ) : null}
        <QrActions
          checkoutUrl={checkoutUrl}
          qrDataUrl={qrDataUrl}
          fileName={`${stand.slug}-qr.png`}
        />
      </div>

      <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4 print:hidden">
        <QrPrintEditor stand={stand} />
      </div>
    </main>
  );
}
