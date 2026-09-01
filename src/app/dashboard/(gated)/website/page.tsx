import { requireOwner } from "@/lib/session";
import {
  ensureStorefront,
  storefrontFullUrl,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import { primaryStandIdForOwner } from "@/lib/catalogue/channels";
import { prisma } from "@/lib/prisma";
import { ProductChannelType } from "@/generated/prisma/client";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { normalizeBusinessMode } from "@/lib/business-mode";
import { appBaseUrl } from "@/lib/app-url";
import StorefrontEditor from "./StorefrontEditor";

export default async function WebsitePage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    published?: string;
    unpublished?: string;
    error?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const primaryStandId = await primaryStandIdForOwner(owner.id);

  const [onlineCount, onlineProducts] = await Promise.all([
    primaryStandId
      ? prisma.productChannel.count({
          where: {
            channelType: ProductChannelType.ONLINE,
            standId: primaryStandId,
            isEnabled: true,
            product: { ownerId: owner.id, isArchived: false },
          },
        })
      : Promise.resolve(0),
    primaryStandId
      ? prisma.product.findMany({
          where: {
            ownerId: owner.id,
            isArchived: false,
            channels: {
              some: {
                channelType: ProductChannelType.ONLINE,
                standId: primaryStandId,
                isEnabled: true,
              },
            },
          },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { id: true, name: true },
          take: 40,
        })
      : Promise.resolve([]),
  ]);

  const draftConfig = parseStorefrontConfig(storefront.draftConfig);
  const base = appBaseUrl();
  const slug = storefront.slug;

  return (
    <main className="flex flex-col gap-6 pb-8">
      <StorefrontEditor
        storefront={{
          slug: storefront.slug,
          headline: storefront.headline,
          subheadline: storefront.subheadline,
          about: storefront.about,
          heroImageUrl: storefront.heroImageUrl,
          themePreset: storefront.themePreset,
          isPublished: storefront.isPublished,
          contactEmail: storefront.contactEmail,
          showPhone: storefront.showPhone,
          publishedAt: storefront.publishedAt,
        }}
        owner={{
          businessName: owner.businessName,
          contactEmail: owner.contactEmail,
          businessMode: normalizeBusinessMode(owner.businessMode),
        }}
        draftConfig={draftConfig}
        onlineCount={onlineCount}
        previewBaseUrl={`${base}${storefrontPublicPath(slug)}`}
        liveBaseUrl={storefrontFullUrl(slug)}
        products={onlineProducts}
        saved={params.saved === "1"}
        published={params.published === "1"}
        unpublished={params.unpublished === "1"}
        error={params.error}
      />
    </main>
  );
}
