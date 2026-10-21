import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { loadPreOrderList } from "@/lib/storefront/views/load-offer-lists";
import StandStoreHeader from "../StandStoreHeader";
import PreOrderListBody from "./PreOrderListBody";

/** Open pre-order pages on the stand page (`/s/{stand}/pre`). */
export default async function PreOrdersIndexView({ standSlug }: { standSlug: string }) {
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const stand = await prisma.stand.findUnique({ where: { slug }, include: { owner: true } });
  if (!stand || !stand.isActive) notFound();
  const data = await loadPreOrderList(stand.id, null);
  if (!data) notFound();
  const branded = publicStandBranding(stand, stand.owner);

  return (
    <div className="min-h-dvh w-full" style={standAccentStyle(branded.accentColor, branded.secondaryColor)}>
      <div className="mx-auto w-full max-w-lg px-4 pb-2 pt-8">
        <StandStoreHeader
          standName={stand.name}
          standSlug={stand.slug}
          logoUrl={branded.logoUrl}
          locationLabel={stand.locationLabel}
        />
      </div>
      <PreOrderListBody data={data} />
    </div>
  );
}
