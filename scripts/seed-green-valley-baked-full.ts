/**
 * Full test data for Green Valley Baked Goods (jono@silicondales.com): materials and purchases,
 * recipes, batches, catalogue, pre-orders, subscription, membership, customers, orders, reviews,
 * discounts, upsell, QR, supplier, campaign draft and pickup point.
 *
 * Every row is marked (FS-MOCK- orders, MOCK- batches/SKUs, .mock@example.com shoppers,
 * "[mock-seed]" notes) and re-running replaces the previous seed.
 *
 * Usage:
 *   npx tsx scripts/seed-green-valley-baked-full.ts          # reset + seed
 *   npx tsx scripts/seed-green-valley-baked-full.ts --reset  # remove the seed only
 */
import "dotenv/config";
import { connect, loadScope } from "./seed/green-valley-baked/context";
import { resetMockData } from "./seed/green-valley-baked/reset";
import { seedMaterials } from "./seed/green-valley-baked/materials";
import { seedRecipes } from "./seed/green-valley-baked/recipes";
import { seedCatalogue } from "./seed/green-valley-baked/catalogue";
import { seedProduction } from "./seed/green-valley-baked/production";
import { seedCustomers } from "./seed/green-valley-baked/customers";
import { seedSelling } from "./seed/green-valley-baked/selling";
import { seedOrders } from "./seed/green-valley-baked/orders";
import { seedExtras } from "./seed/green-valley-baked/extras";

async function main() {
  const db = connect();
  try {
    const scope = await loadScope(db);
    await resetMockData(db, scope);
    if (process.argv.includes("--reset")) return;

    const materials = await seedMaterials(db, scope);
    const recipes = await seedRecipes(db, scope, materials);
    const catalogue = await seedCatalogue(db, scope, recipes);
    await seedProduction(db, scope, materials, recipes, catalogue);
    const customers = await seedCustomers(db, scope);
    const selling = await seedSelling(db, scope, catalogue, customers);
    const orders = await seedOrders(db, scope, catalogue, customers, selling);
    await seedExtras(db, scope, catalogue, orders);
    console.log("Done.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
