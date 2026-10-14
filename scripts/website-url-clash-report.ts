import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, MenuKind } from "../src/generated/prisma/client";
import { siteClashReport } from "../src/lib/storefront/clash-report";
import { pickWebsiteStand } from "../src/lib/storefront/website-stand";

/**
 * READ-ONLY report of clean-URL clashes for every storefront (run before merging to main).
 * Lists slugs hidden by higher-priority items, redirects that hide live content, pre-order
 * name clashes and owners with several stands. Never writes.
 *
 *   npx tsx scripts/website-url-clash-report.ts [--slug=my-shop] [--published]
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");
  console.log(`Database host: ${new URL(databaseUrl).host}`);
  const slug = process.argv.find((a) => a.startsWith("--slug="))?.slice("--slug=".length);
  const publishedOnly = process.argv.includes("--published");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  let blocking = 0;
  try {
    const storefronts = await prisma.storefront.findMany({
      where: { ...(slug ? { slug } : {}), ...(publishedOnly ? { isPublished: true } : {}) },
      select: { slug: true, ownerId: true, isPublished: true, draftConfig: true, publishedConfig: true },
      orderBy: { slug: "asc" },
    });
    for (const sf of storefronts) {
      const [categories, stands] = await Promise.all([
        prisma.category.findMany({
          where: { ownerId: sf.ownerId, isActive: true },
          select: { id: true, slug: true, title: true },
        }),
        prisma.stand.findMany({ where: { ownerId: sf.ownerId }, orderBy: { createdAt: "asc" }, select: { id: true } }),
      ]);
      const standId = pickWebsiteStand(stands, sf.draftConfig)?.id;
      const [menus, preOrderPages, offers] = standId
        ? await Promise.all([
            prisma.menu.findMany({ where: { standId, kind: MenuKind.PREORDER_DROP }, select: { slug: true } }),
            prisma.preOrderPage.findMany({ where: { standId }, select: { slug: true } }),
            prisma.subscriptionOffer.findMany({ where: { standId }, select: { slug: true } }),
          ])
        : [[], [], []];
      const issues = siteClashReport({
        configRaw: sf.isPublished && sf.publishedConfig ? sf.publishedConfig : sf.draftConfig,
        categories,
        standCount: stands.length,
        isPublished: sf.isPublished,
        preOrderMenuSlugs: menus.map((m) => m.slug),
        preOrderPageSlugs: preOrderPages.map((p) => p.slug),
        subscriptionOfferSlugs: offers.map((o) => o.slug),
      });
      if (issues.length === 0) continue;
      blocking += issues.filter((i) => i.level === "block").length;
      console.log(`\n${sf.slug}${sf.isPublished ? " (published)" : ""}`);
      for (const i of issues) console.log(`  ${i.level === "block" ? "BLOCK" : "warn "} ${i.message}`);
    }
    console.log(`\n${storefronts.length} storefronts checked, ${blocking} blocking issue(s).`);
  } finally {
    await prisma.$disconnect();
  }
  if (blocking > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
