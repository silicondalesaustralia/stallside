import type { AssistantContext } from "../context/types";
import type { BriefData } from "../brief/schema";

const GOAL_LABELS: Record<string, string> = {
  sell_online: "Sell online",
  local_visits: "Bring customers to visit or collect locally",
  pre_orders: "Take pre-orders",
  subscriptions: "Promote subscriptions or memberships",
  enquiries: "Collect enquiries",
  information: "Provide information",
};

/** The only facts the model may rely on. Seller wording, confirmed imports and real Vendl data. */
export function factsForPrompt(ctx: AssistantContext, brief: BriefData) {
  const b = brief.business;
  return {
    locale: "Australian English",
    business: {
      name: b.name || ctx.businessName,
      description: b.description,
      whatTheySell: b.offering,
      primaryGoal: b.primaryGoal ? GOAL_LABELS[b.primaryGoal] : null,
      secondaryGoals: b.secondaryGoals.map((g) => GOAL_LABELS[g]),
      audience: b.audience,
      story: b.story,
      differentiators: b.differentiators,
      serviceArea: b.serviceArea || ctx.existing.regionLabel,
      extraInstructions: b.instructions,
    },
    sellerPastedText: brief.sources.pastedText.slice(0, 3000),
    confirmedImportedFacts: brief.sources.imports.flatMap((s) =>
      s.facts.filter((f) => f.accepted).map((f) => ({ field: f.field, value: f.value })),
    ),
    followUpAnswers: brief.followUps.filter((f) => f.answer.trim()).map((f) => ({ q: f.question, a: f.answer })),
    vendlData: {
      businessMode: ctx.businessMode,
      productCount: ctx.catalogue.productCount,
      exampleProducts: ctx.catalogue.products.slice(0, 12).map((p) => p.title),
      categories: ctx.catalogue.categories.map((c) => c.title),
      activeMenus: ctx.features.menus.map((m) => m.title),
      activePreOrders: ctx.features.preOrders.map((m) => m.title),
      activeSubscriptions: ctx.features.subscriptions.map((m) => m.title),
      pickupOptions: ctx.features.pickupLabels,
      deliveryOptions: ctx.features.deliveryLabels,
      paymentMethods: ctx.features.paymentBrands,
      approvedReviewCount: ctx.reviews.count,
      locality: ctx.existing.regionLabel,
    },
    searchProfile: searchProfileForPrompt(ctx),
  };
}

/** Seller-confirmed Google & search profile facts (hours, location, awards…). */
function searchProfileForPrompt(ctx: AssistantContext) {
  const p = ctx.searchProfile;
  return {
    businessType: p.businessType,
    location: p.location,
    areaServed: p.areaServed,
    openingHours: p.hours,
    knownFor: p.knownFor,
    awards: p.awards,
    certifications: p.certifications,
    memberOf: p.memberOf,
    founded: p.founded,
    paymentAccepted: p.paymentAccepted,
    returns: p.returns,
    profileDescription: p.description,
  };
}

export type PromptFacts = ReturnType<typeof factsForPrompt>;
