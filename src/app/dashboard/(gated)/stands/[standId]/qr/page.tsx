import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { APP_DOMAIN } from "@/lib/constants";
import { standCheckoutUrl, standQrDataUrl } from "@/lib/stand-qr";
import QrActions from "./QrActions";
import QrPrintEditor from "./QrPrintEditor";
import QrSignSheet from "./QrSignSheet";

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
  const siteUrl = `https://${APP_DOMAIN}`;
  const sheet = {
    name: stand.name,
    qrCallout: stand.qrCallout,
    qrSignMessage: stand.qrSignMessage,
    description: stand.description,
    locationLabel: stand.locationLabel,
    checkoutUrl,
    qrDataUrl,
    siteUrl,
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 print:max-w-none print:gap-0">
      <p className="text-sm text-[var(--muted)] print:hidden">
        <Link href="/dashboard/stands" className="underline">
          My stands
        </Link>
        {" · "}
        <Link href={`/dashboard/stands/${stand.id}`} className="underline">
          {stand.name}
        </Link>
      </p>

      <QrSignSheet
        {...sheet}
        className="qr-print-sheet rounded-[var(--radius)] border border-[var(--line)]"
      />

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
          sheet={sheet}
        />
      </div>

      <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4 print:hidden">
        <QrPrintEditor stand={stand} />
      </div>
    </main>
  );
}
