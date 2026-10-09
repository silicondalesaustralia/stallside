/**
 * Idempotent Green Valley Farm & Bakes website demo seed.
 * Usage: npm run seed:green-valley-demo
 */
import "dotenv/config";
import {
  MenuKind,
  PrismaClient,
  ProductChannelType,
  FulfilmentOptionKind,
  HandoverMode,
  PaymentTiming,
  ShopperSubInterval,
  DeliveryZoneRuleKind,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  GREEN_VALLEY_DEMO_EMAIL,
  GREEN_VALLEY_DEMO_STAND_SLUG,
  GREEN_VALLEY_DEMO_STOREFRONT_SLUG,
} from "../src/lib/demo/green-valley/constants";
import {
  GREEN_VALLEY_CATEGORIES,
  GREEN_VALLEY_PRODUCTS,
  GREEN_VALLEY_BLOG_POSTS,
} from "../src/lib/demo/green-valley/catalogue";
import { rollingSaturdayBakeDates } from "../src/lib/demo/green-valley/dates";
import { buildGreenValleyHomeNodes } from "../src/lib/demo/green-valley/starter-nodes";
import { greenValleyPageNodes } from "../src/lib/demo/green-valley/pages";
import { STUDIO_VERSION } from "../src/lib/studio/types";
import { mergeCustomPagesIntoRaw, type StorefrontCustomPage } from "../src/lib/studio/custom-pages";
import { mergeBlogPostsIntoRaw, mergeBlogSettingsIntoRaw } from "../src/lib/studio/blog";
import { buildDefaultStorefrontConfig } from "../src/lib/storefront/config";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  let user = await prisma.user.findUnique({
    where: { email: GREEN_VALLEY_DEMO_EMAIL },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: GREEN_VALLEY_DEMO_EMAIL,
        name: "Green Valley Demo",
        emailVerified: new Date(),
      },
    });
  }

  let owner = await prisma.owner.findUnique({ where: { userId: user.id } });
  if (!owner) {
    owner = await prisma.owner.create({
      data: {
        userId: user.id,
        businessName: "Green Valley Farm & Bakes",
        contactEmail: GREEN_VALLEY_DEMO_EMAIL,
        businessMode: "BOTH",
        shortDescription: "Grown here. Baked here. Shared locally.",
        fulfilmentIntents: ["PICKUP", "DELIVERY", "STAND"],
        lifetimeAccess: true,
        subscriptionPlan: "pro",
        subscriptionStatus: "ACTIVE",
      },
    });
  } else {
    owner = await prisma.owner.update({
      where: { id: owner.id },
      data: {
        businessName: "Green Valley Farm & Bakes",
        contactEmail: GREEN_VALLEY_DEMO_EMAIL,
        businessMode: "BOTH",
        shortDescription: "Grown here. Baked here. Shared locally.",
      },
    });
  }

  let stand = await prisma.stand.findFirst({
    where: { slug: GREEN_VALLEY_DEMO_STAND_SLUG },
  });
  if (!stand) {
    stand = await prisma.stand.create({
      data: {
        ownerId: owner.id,
        name: "Green Valley Farm Stand",
        slug: GREEN_VALLEY_DEMO_STAND_SLUG,
        description:
          "Self-serve farm stand stocked with eggs, seasonal produce and pantry favourites. Availability changes throughout the week.",
        locationLabel: "Green Valley, Adelaide Hills, SA (fictional demo)",
        timezone: "Australia/Adelaide",
        currency: "AUD",
        isActive: true,
        acceptCash: true,
        acceptCard: false,
        acceptPayPal: false,
        acceptLocalTransfer: false,
      },
    });
  } else {
    stand = await prisma.stand.update({
      where: { id: stand.id },
      data: {
        name: "Green Valley Farm Stand",
        description:
          "Self-serve farm stand stocked with eggs, seasonal produce and pantry favourites. Availability changes throughout the week.",
        locationLabel: "Green Valley, Adelaide Hills, SA (fictional demo)",
        isActive: true,
      },
    });
  }

  const categoryIds = new Map<string, string>();
  for (const [i, cat] of GREEN_VALLEY_CATEGORIES.entries()) {
    const row = await prisma.category.upsert({
      where: { ownerId_slug: { ownerId: owner.id, slug: cat.slug } },
      create: {
        ownerId: owner.id,
        title: cat.title,
        slug: cat.slug,
        sortOrder: i,
        isActive: true,
      },
      update: { title: cat.title, sortOrder: i, isActive: true },
    });
    categoryIds.set(cat.title, row.id);
  }

  const productIds = new Map<string, string>();
  const featuredIds: string[] = [];
  for (const [i, p] of GREEN_VALLEY_PRODUCTS.entries()) {
    const existing = await prisma.product.findFirst({
      where: { standId: stand.id, slug: p.slug },
    });
    const product = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: p.name,
            priceCents: p.priceCents,
            description: `${p.short}\n\n${p.description}`,
            seoDescription: p.short,
            seoTitle: `${p.name} | Green Valley Farm & Bakes`,
            sortOrder: i,
            isArchived: false,
            isActive: true,
            isHidden: false,
            stockQuantity: 50,
          },
        })
      : await prisma.product.create({
          data: {
            ownerId: owner.id,
            standId: stand.id,
            name: p.name,
            slug: p.slug,
            priceCents: p.priceCents,
            description: `${p.short}\n\n${p.description}`,
            seoDescription: p.short,
            seoTitle: `${p.name} | Green Valley Farm & Bakes`,
            sortOrder: i,
            stockQuantity: 50,
          },
        });
    productIds.set(p.slug, product.id);
    if (p.featured) featuredIds.push(product.id);

    const catId = categoryIds.get(p.category);
    if (catId) {
      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: { productId: product.id, categoryId: catId },
        },
        create: { productId: product.id, categoryId: catId },
        update: {},
      });
    }

    await prisma.productChannel.upsert({
      where: {
        productId_channelType_standId: {
          productId: product.id,
          channelType: ProductChannelType.ONLINE,
          standId: stand.id,
        },
      },
      create: {
        productId: product.id,
        channelType: ProductChannelType.ONLINE,
        standId: stand.id,
        isEnabled: true,
        sortOrder: i,
      },
      update: { isEnabled: true, sortOrder: i },
    });

    if (p.standChannel) {
      await prisma.productChannel.upsert({
        where: {
          productId_channelType_standId: {
            productId: product.id,
            channelType: ProductChannelType.STAND,
            standId: stand.id,
          },
        },
        create: {
          productId: product.id,
          channelType: ProductChannelType.STAND,
          standId: stand.id,
          isEnabled: true,
          sortOrder: i,
        },
        update: { isEnabled: true },
      });
    }
  }

  const bakeDates = rollingSaturdayBakeDates();
  const bakeMenuSlugs = [
    "country-sourdough",
    "seeded-sourdough",
    "rosemary-sea-salt-focaccia",
    "cinnamon-morning-buns",
    "seasonal-fruit-danish",
    "chocolate-babka",
    "free-range-eggs-dozen",
    "weekend-breakfast-box",
  ];
  const standMenuSlugs = [
    "free-range-eggs-dozen",
    "seasonal-farm-box",
    "strawberry-jam",
    "garden-herb-salt",
    "garden-greens",
  ];

  const bakeMenu = await prisma.menu.upsert({
    where: {
      standId_slug: { standId: stand.id, slug: "saturday-farm-bake" },
    },
    create: {
      ownerId: owner.id,
      standId: stand.id,
      title: "Saturday Farm Bake",
      slug: "saturday-farm-bake",
      description:
        "Our weekly bake and farm collection. Order before Thursday evening and collect Saturday morning.",
      kind: MenuKind.PREORDER_DROP,
      isActive: true,
      showOnShop: true,
      hideOnBusinessPage: false,
      orderByAt: bakeDates.orderByAt,
      collectionAt: bakeDates.collectionAt,
      collectionNote: bakeDates.collectionNote,
      paymentTiming: PaymentTiming.PAY_UPFRONT,
      handoverMode: HandoverMode.COLLECT,
    },
    update: {
      title: "Saturday Farm Bake",
      description:
        "Our weekly bake and farm collection. Order before Thursday evening and collect Saturday morning.",
      kind: MenuKind.PREORDER_DROP,
      isActive: true,
      showOnShop: true,
      orderByAt: bakeDates.orderByAt,
      collectionAt: bakeDates.collectionAt,
      collectionNote: bakeDates.collectionNote,
    },
  });

  await prisma.menuProduct.deleteMany({ where: { menuId: bakeMenu.id } });
  for (const [i, slug] of bakeMenuSlugs.entries()) {
    const productId = productIds.get(slug);
    if (!productId) continue;
    await prisma.menuProduct.create({
      data: { menuId: bakeMenu.id, productId, sortOrder: i },
    });
  }

  const standMenu = await prisma.menu.upsert({
    where: {
      standId_slug: { standId: stand.id, slug: "farm-stand-favourites" },
    },
    create: {
      ownerId: owner.id,
      standId: stand.id,
      title: "Farm Stand Favourites",
      slug: "farm-stand-favourites",
      description:
        "Staples you'll often find at the stand. Stock changes with the season.",
      kind: MenuKind.ALWAYS_AVAILABLE,
      isActive: true,
      showOnShop: true,
      showOnStand: true,
    },
    update: {
      title: "Farm Stand Favourites",
      isActive: true,
      showOnShop: true,
    },
  });

  await prisma.menuProduct.deleteMany({ where: { menuId: standMenu.id } });
  for (const [i, slug] of standMenuSlugs.entries()) {
    const productId = productIds.get(slug);
    if (!productId) continue;
    await prisma.menuProduct.create({
      data: { menuId: standMenu.id, productId, sortOrder: i },
    });
  }

  const eggId = productIds.get("free-range-eggs-dozen");
  if (eggId) {
    const existingOffer = await prisma.subscriptionOffer.findUnique({
      where: {
        standId_slug: { standId: stand.id, slug: "weekly-egg-subscription" },
      },
    });
    if (existingOffer) {
      await prisma.subscriptionOffer.update({
        where: { id: existingOffer.id },
        data: {
          title: "Weekly Egg Subscription",
          description:
            "Reserve a dozen Green Valley eggs each week and collect them from the farm on Saturday morning.",
          isActive: true,
          priceCents: 800,
        },
      });
      await prisma.subscriptionOfferProduct.deleteMany({
        where: { subscriptionOfferId: existingOffer.id },
      });
      await prisma.subscriptionOfferProduct.create({
        data: {
          subscriptionOfferId: existingOffer.id,
          productId: eggId,
          quantity: 1,
          sortOrder: 0,
        },
      });
    } else {
      await prisma.subscriptionOffer.create({
        data: {
          ownerId: owner.id,
          standId: stand.id,
          title: "Weekly Egg Subscription",
          slug: "weekly-egg-subscription",
          description:
            "Reserve a dozen Green Valley eggs each week and collect them from the farm on Saturday morning.",
          isActive: true,
          interval: ShopperSubInterval.WEEKLY,
          handoverMode: HandoverMode.COLLECT,
          collectionWeekday: 6,
          collectionNote: "Collect Saturday morning from Green Valley Farm.",
          priceCents: 800,
          currency: "AUD",
          items: { create: [{ productId: eggId, quantity: 1, sortOrder: 0 }] },
        },
      });
    }
  }

  let pickup = await prisma.pickupLocation.findFirst({
    where: { ownerId: owner.id, name: "Green Valley Farm" },
  });
  if (!pickup) {
    pickup = await prisma.pickupLocation.create({
      data: {
        ownerId: owner.id,
        standId: stand.id,
        name: "Green Valley Farm",
        publicLabel: "Green Valley Farm",
        suburb: "Adelaide Hills",
        stateTerritory: "SA",
        publicInstructions:
          "Follow the Green Valley signs to the collection area beside the farm stand. Preorders will be packed under the name used at checkout. (Fictional demo location.)",
        showFullAddressBeforePurchase: false,
        isActive: true,
      },
    });
  }

  let zone = await prisma.deliveryZone.findFirst({
    where: { ownerId: owner.id, name: "Adelaide Hills demo" },
  });
  if (!zone) {
    zone = await prisma.deliveryZone.create({
      data: {
        ownerId: owner.id,
        name: "Adelaide Hills demo",
        deliveryFeeCents: 800,
        weekday: 6,
        startTimeMin: 13 * 60,
        endTimeMin: 16 * 60,
        isActive: true,
        rules: {
          create: [
            { kind: DeliveryZoneRuleKind.SUBURB, value: "Hahndorf" },
            { kind: DeliveryZoneRuleKind.SUBURB, value: "Stirling" },
            { kind: DeliveryZoneRuleKind.POSTCODE, value: "5152" },
          ],
        },
      },
    });
  }

  const existingPickupOpt = await prisma.fulfilmentOption.findFirst({
    where: { ownerId: owner.id, menuId: bakeMenu.id },
  });
  if (!existingPickupOpt) {
    await prisma.fulfilmentOption.create({
      data: {
        ownerId: owner.id,
        kind: FulfilmentOptionKind.PICKUP,
        label: "Saturday farm pickup",
        standId: stand.id,
        pickupLocationId: pickup.id,
        menuId: bakeMenu.id,
        handoverMode: HandoverMode.COLLECT,
        paymentTiming: PaymentTiming.PAY_NOW,
        feeCents: 0,
        channels: ["ONLINE"],
        isActive: true,
        sortOrder: 0,
      },
    });
  }

  const existingDelivery = await prisma.fulfilmentOption.findFirst({
    where: {
      ownerId: owner.id,
      kind: FulfilmentOptionKind.DELIVERY,
      deliveryZoneId: zone.id,
    },
  });
  if (!existingDelivery) {
    await prisma.fulfilmentOption.create({
      data: {
        ownerId: owner.id,
        kind: FulfilmentOptionKind.DELIVERY,
        label: "Local Adelaide Hills delivery",
        standId: stand.id,
        deliveryZoneId: zone.id,
        handoverMode: HandoverMode.DELIVER,
        paymentTiming: PaymentTiming.PAY_NOW,
        feeCents: 800,
        channels: ["ONLINE"],
        isActive: true,
        sortOrder: 1,
      },
    });
  }

  const homeArtisan = buildGreenValleyHomeNodes("artisan");
  const pageNodesMap = greenValleyPageNodes();
  const customPages: StorefrontCustomPage[] = [
    {
      id: "builtin-about",
      slug: "about",
      title: "About",
      navLabel: "About",
      template: "about",
      enabled: true,
      showInNav: true,
      showInFooter: true,
      footerColumn: "visit",
      sortOrder: 40,
      routeKind: "builtin",
      builtinKey: "about",
    },
    {
      id: "gv-our-farm",
      slug: "our-farm",
      title: "Our Farm",
      navLabel: "Our Farm",
      template: "info",
      enabled: true,
      showInNav: true,
      showInFooter: true,
      footerColumn: "visit",
      sortOrder: 35,
      routeKind: "custom",
    },
    {
      id: "gv-this-week",
      slug: "this-week",
      title: "This Week",
      navLabel: "This Week",
      template: "info",
      enabled: true,
      showInNav: true,
      showInFooter: true,
      footerColumn: "shop",
      sortOrder: 15,
      routeKind: "custom",
    },
    {
      id: "gv-pickup",
      slug: "pickup-delivery",
      title: "Pickup & Delivery",
      navLabel: "Pickup & Delivery",
      template: "pickup-delivery",
      enabled: true,
      showInNav: false,
      showInFooter: true,
      footerColumn: "visit",
      sortOrder: 50,
      routeKind: "custom",
    },
    {
      id: "gv-faq",
      slug: "faq",
      title: "FAQ",
      navLabel: "FAQ",
      template: "faq",
      enabled: true,
      showInNav: false,
      showInFooter: true,
      footerColumn: "visit",
      sortOrder: 55,
      routeKind: "custom",
    },
    {
      id: "builtin-contact",
      slug: "contact",
      title: "Contact",
      navLabel: "Contact",
      template: "contact",
      enabled: true,
      showInNav: true,
      showInFooter: true,
      footerColumn: "visit",
      sortOrder: 60,
      routeKind: "builtin",
      builtinKey: "contact",
    },
    {
      id: "builtin-blog",
      slug: "blog",
      title: "Journal",
      navLabel: "Journal",
      template: "blog-index",
      enabled: true,
      showInNav: true,
      showInFooter: true,
      footerColumn: "visit",
      sortOrder: 45,
      routeKind: "builtin",
      builtinKey: "blog",
    },
    {
      id: "builtin-privacy",
      slug: "privacy",
      title: "Privacy",
      navLabel: "Privacy",
      template: "privacy",
      enabled: true,
      showInNav: false,
      showInFooter: true,
      footerColumn: "policies",
      sortOrder: 90,
      routeKind: "builtin",
      builtinKey: "privacy",
    },
    {
      id: "builtin-terms",
      slug: "terms",
      title: "Terms",
      navLabel: "Terms",
      template: "terms",
      enabled: true,
      showInNav: false,
      showInFooter: true,
      footerColumn: "policies",
      sortOrder: 91,
      routeKind: "builtin",
      builtinKey: "terms",
    },
    {
      id: "builtin-returns",
      slug: "returns",
      title: "Returns & Refunds",
      navLabel: "Returns",
      template: "returns",
      enabled: true,
      showInNav: false,
      showInFooter: true,
      footerColumn: "policies",
      sortOrder: 92,
      routeKind: "builtin",
      builtinKey: "returns",
    },
  ];

  const nowIso = new Date().toISOString();
  const blogPosts = GREEN_VALLEY_BLOG_POSTS.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    bodyHtml: p.bodyHtml,
    featuredImageUrl: null,
    topicIds: [] as string[],
    status: "published" as const,
    publishedAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  }));

  let draftConfig: Record<string, unknown> = buildDefaultStorefrontConfig({
    businessMode: "BOTH",
    fulfilmentIntents: ["PICKUP", "DELIVERY", "STAND"],
  }) as unknown as Record<string, unknown>;
  draftConfig.featuredProductIds = featuredIds;
  draftConfig = mergeCustomPagesIntoRaw(draftConfig, customPages) as Record<
    string,
    unknown
  >;
  draftConfig = mergeBlogSettingsIntoRaw(draftConfig, {
    enabled: true,
    showInNav: true,
    navLabel: "Journal",
    indexTitle: "From Green Valley",
    navSortOrder: 45,
  }) as Record<string, unknown>;
  draftConfig = mergeBlogPostsIntoRaw(
    draftConfig,
    blogPosts,
  ) as Record<string, unknown>;

  draftConfig.websiteStudio = {
    version: STUDIO_VERSION,
    engine: "craft",
    templateId: "artisan",
    nodes: homeArtisan,
    pageNodes: {
      home: homeArtisan,
      "builtin-about": pageNodesMap.about,
      "gv-our-farm": pageNodesMap["our-farm"],
      "gv-pickup": pageNodesMap["pickup-delivery"],
      "gv-faq": pageNodesMap.faq,
      "builtin-contact": pageNodesMap.contact,
      "builtin-privacy": pageNodesMap.privacy,
      "builtin-terms": pageNodesMap.terms,
      "builtin-returns": pageNodesMap.returns,
      // Demo template variants (read-only for /demo/*; published template stays artisan)
      "__demo_farmhouse": buildGreenValleyHomeNodes("farmhouse"),
      "__demo_market": buildGreenValleyHomeNodes("market"),
    },
  };

  draftConfig.storefrontSeo = {
    home: {
      title: "Green Valley Farm & Bakes | Adelaide Hills",
      description:
        "Shop small-batch sourdough, fresh bakes, eggs and seasonal farm produce from the fictional Green Valley Farm & Bakes demo store.",
    },
  };

  const existingSf = await prisma.storefront.findUnique({
    where: { ownerId: owner.id },
  });
  if (existingSf) {
    await prisma.storefront.update({
      where: { ownerId: owner.id },
      data: {
        slug: GREEN_VALLEY_DEMO_STOREFRONT_SLUG,
        headline: "Green Valley Farm & Bakes",
        subheadline: "Grown here. Baked here. Shared locally.",
        about:
          "Fresh sourdough, small-batch bakes, eggs and seasonal produce from our little patch in the Adelaide Hills.",
        contactEmail: "hello@greenvalley.demo.vendl.app",
        themePreset: "farmhouse",
        isPublished: true,
        publishedAt: new Date(),
        draftConfig: draftConfig as object,
        publishedConfig: draftConfig as object,
      },
    });
  } else {
    await prisma.storefront.create({
      data: {
        ownerId: owner.id,
        slug: GREEN_VALLEY_DEMO_STOREFRONT_SLUG,
        headline: "Green Valley Farm & Bakes",
        subheadline: "Grown here. Baked here. Shared locally.",
        about:
          "Fresh sourdough, small-batch bakes, eggs and seasonal produce from our little patch in the Adelaide Hills.",
        contactEmail: "hello@greenvalley.demo.vendl.app",
        themePreset: "farmhouse",
        isPublished: true,
        publishedAt: new Date(),
        draftConfig: draftConfig as object,
        publishedConfig: draftConfig as object,
      },
    });
  }

  console.log("Green Valley website demo seeded.");
  console.log(`  owner: ${owner.id}`);
  console.log(`  stand: ${stand.slug}`);
  console.log(`  storefront: ${GREEN_VALLEY_DEMO_STOREFRONT_SLUG}`);
  console.log(`  products: ${productIds.size}`);
  console.log(`  demo URLs: /demo/artisan | /demo/farmhouse | /demo/market`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
