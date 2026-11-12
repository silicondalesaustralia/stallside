import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { standPublicHome } from "@/lib/storefront/legacy-stand-redirect";
import { businessQrHref } from "@/lib/qr/hrefs";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import NoBusinessYet from "@/components/NoBusinessYet";
import DashPrimaryCta from "@/components/DashPrimaryCta";

const linkClass = "font-semibold text-[var(--leaf-dark)] underline";

export default async function FarmstandPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const header = (
    <PageHeader
      title="Farmstand"
      subtitle="The simple shop your QR code opens. It uses the same products, cart and checkout as your website. Only the look is different."
    />
  );
  if (!selected) {
    return (
      <main className="flex flex-col gap-6">
        {header}
        <NoBusinessYet />
      </main>
    );
  }

  const [stand, storefront] = await Promise.all([
    prisma.stand.findUniqueOrThrow({ where: { id: selected.id }, select: { slug: true, cartMode: true } }),
    prisma.storefront.findUnique({ where: { ownerId: owner.id }, select: { isPublished: true } }),
  ]);
  const home = await standPublicHome(stand.slug, stand.cartMode);
  const businessHref = `/dashboard/businesses/${selected.id}`;

  return (
    <main className="flex flex-col gap-6">
      {header}
      <section className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          {selected.name} farmstand
        </h2>
        <a href={home.url} target="_blank" rel="noreferrer" className="break-all font-receipt text-lg text-[var(--field)] hover:underline">
          {home.label}
        </a>
        <p className="text-sm text-[var(--muted)]">
          {storefront?.isPublished
            ? "Your website is live at your web address. The farmstand stays at this link, and your QR code opens it."
            : "Until you publish a website, your web address shows this farmstand too."}
          {stand.cartMode === "CUSTOMER_CHOICE" ? " Customers choose what they pay, so the link opens the pay page." : ""}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <DashPrimaryCta href={businessQrHref(selected.id)}>Print QR poster</DashPrimaryCta>
          <a href={home.url} target="_blank" rel="noreferrer" className={linkClass}>
            Open farmstand
          </a>
        </div>
      </section>
      <section className="flex flex-col gap-2 text-sm">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Set up</h2>
        <Link href={`${businessHref}?tab=details`} className={linkClass}>
          Name, location and social links
        </Link>
        <Link href={`${businessHref}?tab=branding`} className={linkClass}>
          Logo and colours
        </Link>
        <Link href="/dashboard/products" className={linkClass}>
          Products
        </Link>
        <Link href="/dashboard/payments" className={linkClass}>
          Payments
        </Link>
      </section>
    </main>
  );
}
