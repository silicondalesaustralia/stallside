import { randomBytes } from "node:crypto";
import { QR_NAMES, UPSELL_NAME, at, weekStart, type Db, type Scope } from "./context";
import type { Catalogue } from "./catalogue";
import type { CustomerRef } from "./customers";

export type Selling = { fridayPageId: string; weeklyOfferId: string; clubOfferId: string; focaccia2Id: string };

const FRIDAY = 5;
const token = () => randomBytes(16).toString("hex");

/** Pre-order pages, the weekly focaccia subscription, the Bakery Club membership, upsell, discounts and QR posters. */
export async function seedSelling(db: Db, scope: Scope, cat: Catalogue, customers: CustomerRef[]): Promise<Selling> {
  const { ownerId, standId, currency } = scope;
  const thisWeek = weekStart(0);
  const nextFriday = at(thisWeek, 4, 12);

  const friday = await db.preOrderPage.create({
    data: {
      ownerId, standId, title: "Friday Focaccia Bake", slug: "friday-focaccia-bake",
      description: "Fresh focaccia and cookies, baked Friday morning. Order by Wednesday 6pm.",
      orderByAt: at(thisWeek, 2, 18), collectionAt: at(thisWeek, 4, 9),
      collectionNote: "Collect from the bakery door, 9am-12pm.", hideOnBusinessPage: false,
      items: { create: [{ productId: cat.focaccia.id, sortOrder: 0 }, { productId: cat.cookies.id, sortOrder: 1 }] },
    },
  });
  await db.preOrderPage.create({
    data: {
      ownerId, standId, title: "Labor Day Long Weekend Bake", slug: "labor-day-long-weekend-bake",
      description: "Extra focaccia for the long weekend.", isActive: false,
      orderByAt: at(weekStart(8), 2, 18), collectionAt: at(weekStart(8), 5, 9),
      items: { create: [{ productId: cat.focaccia.id, sortOrder: 0 }] },
    },
  });

  const weekly = await db.subscriptionOffer.create({
    data: {
      ownerId, standId, currency, kind: "BOX", title: "Weekly Focaccia", slug: "weekly-focaccia",
      description: "One rosemary focaccia every Friday, collected from the bakery door.",
      interval: "WEEKLY", collectionWeekday: FRIDAY, collectionNote: "Bakery door, 9am-12pm", priceCents: 1000,
      items: { create: [{ productId: cat.focaccia.id, quantity: 1 }] },
    },
  });
  const subscribers: [CustomerRef, "ACTIVE" | "PAUSED" | "CANCELLED"][] = [
    [customers[0], "ACTIVE"], [customers[1], "ACTIVE"], [customers[2], "ACTIVE"], [customers[3], "ACTIVE"],
    [customers[11], "PAUSED"], [customers[12], "CANCELLED"],
  ];
  for (const [c, status] of subscribers) {
    await db.shopperSubscription.create({
      data: {
        offerId: weekly.id, standId, ownerId, status, customerId: c.id, customerName: c.name, customerEmail: c.email,
        manageToken: token(), recurringPriceCents: 1000, createdAt: weekStart(6),
        nextCollectionAt: status === "ACTIVE" ? nextFriday : null,
        pausedAt: status === "PAUSED" ? weekStart(1) : null,
        currentPeriodEndsAt: status === "ACTIVE" ? nextFriday : null,
      },
    });
  }

  const club = await db.subscriptionOffer.create({
    data: {
      ownerId, standId, currency, kind: "MEMBERSHIP", title: "Green Valley Bakery Club", slug: "green-valley-bakery-club",
      description: "12 weeks of Friday focaccia, plus a bag of cookies every second week.",
      interval: "WEEKLY", collectionWeekday: FRIDAY, collectionNote: "Bakery door, 9am-12pm",
      priceCents: 950, termWeeks: 12, weeklyPriceCents: 950, monthlyPriceCents: 3900, upfrontPriceCents: 10800,
      upfrontBenefitsText: "Pay upfront and save $6, plus first pick of seasonal specials.",
      termsText: "12 Friday collections. Missed collections can't be carried over.",
      maxMembers: 20, fulfillmentProductId: cat.focaccia.id,
    },
  });
  const plans = ["UPFRONT", "WEEKLY", "MONTHLY"] as const;
  for (const [i, c] of customers.slice(8, 11).entries()) {
    const started = weekStart(5 - i);
    await db.shopperSubscription.create({
      data: {
        offerId: club.id, standId, ownerId, status: "ACTIVE", billingPlan: plans[i], customerId: c.id,
        customerName: c.name, customerEmail: c.email, manageToken: token(), createdAt: started,
        recurringPriceCents: plans[i] === "UPFRONT" ? null : plans[i] === "WEEKLY" ? 950 : 3900,
        termEndsAt: new Date(started.getTime() + 12 * 7 * 86400000),
        collectionsRemaining: 7 + i,
        paidThroughAt: plans[i] === "UPFRONT" ? new Date(started.getTime() + 12 * 7 * 86400000) : nextFriday,
      },
    });
  }

  await db.upsell.create({
    data: { ownerId, standId, name: UPSELL_NAME, offerProductId: cat.cookies.id, priceCents: 1000, productIds: [cat.focaccia.id] },
  });

  const ago = (weeks: number) => weekStart(weeks);
  const [, focaccia2] = await Promise.all([
    db.promotion.create({ data: { ownerId, code: "FIRST10", name: "10% off your first order", type: "PERCENT_OFF", percentOff: 10, firstOrderOnly: true } }),
    db.promotion.create({ data: { ownerId, code: "FOCACCIA2", name: "$2 off focaccia", type: "FIXED_OFF", amountOffCents: 200, productIds: [cat.focaccia.id], perCustomerLimit: 3, usageCount: 3 } }),
    db.promotion.create({ data: { ownerId, code: "WINTER15", name: "Winter warmer 15%", type: "PERCENT_OFF", percentOff: 15, startsAt: ago(12), endsAt: ago(8) } }),
    db.promotion.create({ data: { ownerId, code: "VIP5", name: "$5 off for VIPs", type: "FIXED_OFF", amountOffCents: 500, usageLimit: 5, usageCount: 5 } }),
  ]);

  await db.qrCode.create({ data: { ownerId, standId, name: QR_NAMES[0], linkMode: "WEBSITE_HOME", targetKind: "product", targetId: cat.focaccia.id, atStall: true } });
  await db.qrCode.create({ data: { ownerId, standId, name: QR_NAMES[1], linkMode: "WEBSITE_HOME", targetKind: "preorder_page", targetId: friday.id } });

  console.log("Selling: 2 pre-order pages, subscription (6), membership (3), upsell, 4 codes, 2 QR");
  return { fridayPageId: friday.id, weeklyOfferId: weekly.id, clubOfferId: club.id, focaccia2Id: focaccia2.id };
}
