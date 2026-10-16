import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { listQrTargets } from "@/lib/qr/targets";
import { businessQrHref } from "@/lib/qr/hrefs";
import { duplicateBusinessQr } from "../../../duplicate-business-action";
import DuplicateQrForm from "../../../[qrId]/duplicate/DuplicateQrForm";

export default async function DuplicateBusinessQrPage({ params }: { params: Promise<{ standId: string }> }) {
  const { standId } = await params;
  const { owner } = await requireOwner();
  const stand = await prisma.stand.findFirst({ where: { id: standId, ownerId: owner.id }, select: { id: true, name: true } });
  if (!stand) notFound();
  const options = await listQrTargets(owner.id);

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/qr" className="underline">
            QR codes
          </Link>
          {" · "}
          <Link href={businessQrHref(stand.id)} className="underline">
            {stand.name} (main QR)
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Duplicate QR code
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Makes a new QR code with your main poster&apos;s design that opens a different page. Your main QR
          code and any printed posters stay as they are.
        </p>
      </div>
      <DuplicateQrForm action={duplicateBusinessQr.bind(null, stand.id)} sourceName={stand.name} options={options} />
    </main>
  );
}
