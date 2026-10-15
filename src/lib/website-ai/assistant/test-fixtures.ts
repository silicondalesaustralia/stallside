import type { AssistantContext } from "./context/types";
import { emptyBrief, type BriefData } from "./brief/schema";
import { searchProfileFacts } from "./context/search-profile";

/** Synthetic seller data for tests only. */
export function fixtureContext(overrides: Partial<AssistantContext> = {}): AssistantContext {
  return {
    ownerId: "owner_test",
    storefrontId: "sf_test",
    storefrontSlug: "test-farm",
    businessMode: "FARM_STAND",
    businessName: "Hillside Test Farm",
    existing: {
      headline: "Hillside Test Farm",
      subheadline: null,
      about: null,
      regionLabel: "Testville",
      logoUrl: null,
      heroImageUrl: null,
      accentColor: null,
      secondaryColor: null,
      fontPairId: null,
      templateId: null,
      hasLayout: false,
      isPublished: false,
    },
    catalogue: {
      productCount: 2,
      products: [
        { id: "p1", title: "Free-range eggs", slug: "eggs", imageUrl: null, categorySlug: null },
        { id: "p2", title: "Seasonal veg box", slug: "veg-box", imageUrl: null, categorySlug: null },
      ],
      categories: [],
      productPhotoCount: 0,
    },
    features: {
      menus: [],
      preOrders: [],
      subscriptions: [],
      pickup: true,
      delivery: false,
      pickupLabels: ["Farm gate"],
      deliveryLabels: [],
      paymentBrands: ["cash"],
      cardPayments: false,
    },
    reviews: { count: 0, samples: [] },
    stand: { name: "Hillside stand", locality: "Testville" },
    searchProfile: searchProfileFacts({}),
    ...overrides,
  };
}

export function fixtureBrief(patch: (b: BriefData) => void = () => {}): BriefData {
  const brief = emptyBrief();
  brief.business.name = "Hillside Test Farm";
  brief.business.description = "A small family farm selling eggs and seasonal vegetables from our farm gate.";
  brief.business.offering = "Free-range eggs and seasonal vegetable boxes.";
  brief.business.primaryGoal = "local_visits";
  brief.business.story = "We started with six hens and a vegetable patch, and now supply our neighbours every week.";
  brief.pages.selected = ["HOME", "ABOUT", "CONTACT", "FAQ", "SHOP", "VISIT"];
  patch(brief);
  return brief;
}
