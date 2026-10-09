import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { normalizeBusinessMode } from "../src/lib/business-mode";
import { reportConfigMigration, type ConfigMigrationReport } from "../src/lib/website/adapter/migration-report";

/**
 * READ-ONLY dry run of the Craft -> Vendl WebsiteDefinition migration.
 * Converts every storefront's draft and published config separately and
 * reports what would fail. It never writes; there is nothing to roll back.
 *
 *   npx tsx scripts/website-migrate-dry-run.ts [--verbose] [--slug=my-shop]
 */
function summarise(label: string, r: ConfigMigrationReport, verbose: boolean): string {
  const status = r.errors.length > 0 ? "FAIL" : r.lossless ? "ok" : "LOSSY";
  const line =
    `  ${label}: ${status} pages=${r.pages} (sections ${r.sectionPages}, legacy ${r.legacyPages})` +
    ` sections=${r.sections} errors=${r.errors.length} warnings=${r.warnings.length}`;
  const detail = [...r.errors, ...(verbose ? r.warnings : [])].map(
    (d) => `    ${d.severity} ${d.path}: ${d.message}`,
  );
  return [line, ...detail].join("\n");
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");
  const verbose = process.argv.includes("--verbose");
  const slug = process.argv.find((a) => a.startsWith("--slug="))?.slice("--slug=".length);
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    const storefronts = await prisma.storefront.findMany({
      where: slug ? { slug } : undefined,
      select: {
        slug: true,
        isPublished: true,
        draftConfig: true,
        publishedConfig: true,
        owner: { select: { businessMode: true } },
      },
      orderBy: { slug: "asc" },
    });
    let failed = 0;
    let lossy = 0;
    for (const sf of storefronts) {
      const mode = normalizeBusinessMode(sf.owner.businessMode);
      const draft = reportConfigMigration(sf.draftConfig, mode);
      const reports = [summarise("draft", draft, verbose)];
      let bad = draft.errors.length > 0;
      let notLossless = !draft.lossless;
      if (sf.publishedConfig) {
        const live = reportConfigMigration(sf.publishedConfig, mode);
        reports.push(summarise("published", live, verbose));
        bad ||= live.errors.length > 0;
        notLossless ||= !live.lossless;
      }
      if (bad) failed += 1;
      if (notLossless) lossy += 1;
      console.log(`${sf.slug} [${mode}${sf.isPublished ? ", live" : ""}]\n${reports.join("\n")}`);
    }
    console.log(`\n${storefronts.length} storefronts, ${failed} with errors, ${lossy} not lossless.`);
    if (failed > 0) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
