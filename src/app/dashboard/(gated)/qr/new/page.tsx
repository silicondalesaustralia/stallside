import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import { websiteSectionEnabledFor } from "@/lib/website/access";
import { listQrTargets } from "@/lib/qr/targets";
import { createQrCode } from "../actions";
import NewQrCodeForm from "./NewQrCodeForm";

export default async function NewWebsiteQrPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);

  const [stands, options, storefront] = await Promise.all([
    prisma.stand.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    listQrTargets(owner.id),
    prisma.storefront.findUnique({
      where: { ownerId: owner.id },
      select: { slug: true },
    }),
  ]);

  if (stands.length === 0) {
    return (
      <main className="flex flex-col gap-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          New QR code
        </h1>
        <NoBusinessYet />
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/qr" className="underline">
            QR codes
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          New QR code
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Pick any page of your online store: a category like Farm Stand, one product, a menu or your
          checkout. Next you&apos;ll design the poster.
        </p>
      </div>

      {!storefront && websiteSectionEnabledFor(owner.id) ? (
        <p className="text-sm text-[var(--warn)]">
          Set up your{" "}
          <Link href="/dashboard/website/web-studio?tab=details" className="underline">
            website details
          </Link>{" "}
          so the QR can open your shop. Until then, scans open your business&apos;s order page.
        </p>
      ) : null}
      {!storefront && !websiteSectionEnabledFor(owner.id) ? (
        <p className="text-sm text-[var(--muted)]">
          Scans open your business&apos;s order page.
        </p>
      ) : null}

      <NewQrCodeForm
        action={createQrCode}
        stands={stands}
        options={options}
        defaultStandId={selected?.id ?? stands[0].id}
      />
    </main>
  );
}
