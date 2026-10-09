import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import { createQrCode } from "../actions";
import NewQrCodeForm from "./NewQrCodeForm";

export default async function NewWebsiteQrPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);

  const [stands, categories, storefront] = await Promise.all([
    prisma.stand.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, title: true },
    }),
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
          <Link href="/dashboard/website/qr" className="underline">
            QR codes
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          New QR code
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Point a poster at your whole shop or one category — e.g. Farm Stand.
        </p>
      </div>

      {!storefront ? (
        <p className="text-sm text-[var(--warn)]">
          Set up your{" "}
          <Link href="/dashboard/website/web-studio?tab=details" className="underline">
            website details
          </Link>{" "}
          first so the QR can open your shop.
        </p>
      ) : null}

      {categories.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No categories yet.{" "}
          <Link href="/dashboard/categories" className="underline">
            Create a category
          </Link>{" "}
          (like “Farm Stand”) then come back — or make a whole-shop QR now.
        </p>
      ) : null}

      <NewQrCodeForm
        action={createQrCode}
        stands={stands}
        categories={categories}
        defaultStandId={selected?.id ?? stands[0].id}
        hasStorefront={Boolean(storefront)}
      />
    </main>
  );
}
