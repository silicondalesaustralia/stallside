/**
 * Live smoke test for Astra website planning.
 * Usage:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/test-website-ai-astra.ts
 * Or with Vercel preview env:
 *   vercel env pull /tmp/vendl-preview.env --environment=preview --yes
 *   set -a && source /tmp/vendl-preview.env && set +a
 *   npx tsx scripts/test-website-ai-astra.ts
 */
import { planSiteWithOpenAI } from "../src/lib/website-ai/openai-planner";
import {
  aiSitePlanSchema,
  formatPlanSchemaError,
  normalizeAiPlanRaw,
} from "../src/lib/website-ai/plan-schema";
import type { WebsiteBusinessContext } from "../src/lib/website-ai/types";
import { openaiApiKey, openaiApiKeyLooksInvalid, websiteAiModel } from "../src/lib/website-ai/config";

const ctx: WebsiteBusinessContext = {
  ownerId: "test",
  businessMode: "BOTH",
  businessName: "Green Valley Farm",
  headline: "Green Valley Farm",
  subheadline: "Farm stand and weekly menus",
  about: null,
  regionLabel: "Adelaide Hills",
  hasFarmStand: true,
  hasMenus: true,
  hasDelivery: true,
  hasPickup: true,
  productCount: 5,
  categoryCount: 2,
  reviewCount: 0,
  categories: [{ id: "1", title: "Eggs", slug: "eggs" }],
  featuredProducts: [{ id: "1", title: "Eggs" }],
  productPhotoCount: 1,
  logoUrl: null,
  heroImageUrl: null,
  existingTemplateId: null,
  hasExistingStudio: false,
};

async function main() {
  const key = openaiApiKey();
  if (!key || openaiApiKeyLooksInvalid(key)) {
    console.error("FAIL: OPENAI_API_KEY missing or placeholder");
    process.exit(1);
  }
  console.log("model=", websiteAiModel());
  console.log("key=sk-…(len " + key.length + ")");

  const result = await planSiteWithOpenAI({
    businessContext: ctx,
    intent: {
      primaryGoal: "farm-stand",
      stylePreference: "warm-local",
      selectedPages: ["HOME", "ABOUT", "CONTACT", "FAQ", "SHOP"],
      selectedCapabilities: [
        "SHOP",
        "MENUS_PREORDERS",
        "SUBSCRIPTIONS",
        "CUSTOM_ORDER_FORMS",
        "PICKUP",
        "DELIVERY",
        "EVENTS",
        "NEWSLETTER",
      ],
    },
  });

  if (!result.ok) {
    console.error("FAIL:", result.error);
    process.exit(1);
  }

  const recheck = aiSitePlanSchema.safeParse(normalizeAiPlanRaw(result.plan));
  if (!recheck.success) {
    console.error("FAIL recheck:", formatPlanSchemaError(recheck.error));
    process.exit(1);
  }

  console.log("PASS provider=", result.provider, "model=", result.model);
  console.log(
    "pages=",
    result.plan.pages.map((p) => `${p.pageType}:${p.sections.length}`).join(", "),
  );
  console.log("summary=", (result.plan.changeSummary ?? "").slice(0, 160));
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
