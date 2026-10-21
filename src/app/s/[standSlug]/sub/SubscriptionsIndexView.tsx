import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { loadSubscriptionList } from "@/lib/storefront/views/load-offer-lists";
import StandStoreHeader from "../StandStoreHeader";
import SubscriptionListBody from "./SubscriptionListBody";

/** Membership list on the stand page (`/s/{stand}/sub`). */
export default async function SubscriptionsIndexView({ standSlug }: { standSlug: string }) {
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const stand = await prisma.stand.findUnique({ where: { slug }, include: { owner: true } });
  if (!stand || !stand.isActive) notFound();
  const data = await loadSubscriptionList(stand.id, null);
  if (!data) notFound();
  const branded = publicStandBranding(stand, stand.owner);

  return (
    <div className="min-h-dvh w-full" style={standAccentStyle(branded.accentColor, branded.secondaryColor)}>
      <div className="mx-auto w-full max-w-lg px-4 pb-2 pt-8">
        <StandStoreHeader standName={stand.name} standSlug={stand.slug} logoUrl={branded.logoUrl} />
      </div>
      <SubscriptionListBody data={data} />
    </div>
  );
}
