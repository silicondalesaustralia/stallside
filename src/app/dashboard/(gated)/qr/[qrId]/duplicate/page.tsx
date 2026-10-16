import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { listQrTargets } from "@/lib/qr/targets";
import { duplicateQrCode } from "../../actions";
import DuplicateQrForm from "./DuplicateQrForm";

export default async function DuplicateQrPage({ params }: { params: Promise<{ qrId: string }> }) {
  const { qrId } = await params;
  const { owner } = await requireOwner();
  const qr = await prisma.qrCode.findFirst({ where: { id: qrId, ownerId: owner.id }, select: { id: true, name: true } });
  if (!qr) notFound();
  const options = await listQrTargets(owner.id);

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/qr" className="underline">
            QR codes
          </Link>
          {" · "}
          <Link href={`/dashboard/qr/${qr.id}`} className="underline">
            {qr.name}
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Duplicate QR code
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Makes a new QR code with the same poster design that opens a different page. The original
          QR code and any printed posters stay as they are.
        </p>
      </div>
      <DuplicateQrForm action={duplicateQrCode.bind(null, qr.id)} sourceName={qr.name} options={options} />
    </main>
  );
}
