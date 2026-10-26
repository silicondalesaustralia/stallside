import { randomBytes } from "node:crypto";
import {
  CAMPAIGN_NAME, LIST_NAME, MARK, PICKUP_NAME, SKU_PREFIX, SUPPLIER_EMAIL, at, weekStart, type Db, type Scope,
} from "./context";
import type { Catalogue } from "./catalogue";
import type { SeededOrder } from "./orders";

const REVIEWS: [number, string, string, "PENDING" | "APPROVED" | "REJECTED", string | null][] = [
  [5, "Best focaccia in the valley", "Crispy edges, soft middle, loads of rosemary. Gone by lunchtime.", "APPROVED", "Thank you! The corner pieces go first here too."],
  [5, "Friday ritual", "We pre-order every week now. Never had a bad loaf.", "APPROVED", null],
  [4, "Great cookies", "Chewy and rich. Would love a bigger bag option.", "APPROVED", "Noted! A bag of 12 is coming soon."],
  [5, "So easy to pick up", "Ordered Tuesday, collected Friday, still warm.", "APPROVED", null],
  [4, "Lovely bread", "A little salty for my kids but I loved it.", "PENDING", null],
  [5, "Worth the drive", "The olive oil flavour is amazing.", "PENDING", null],
  [3, "Sold out", "Came Saturday afternoon and the focaccia had gone.", "PENDING", null],
  [1, "Spam link", "Check out my site for cheap watches!!!", "REJECTED", null],
];

export async function seedExtras(db: Db, scope: Scope, cat: Catalogue, orders: SeededOrder[]): Promise<void> {
  const { ownerId, standId, currency } = scope;

  const reviewable = orders.filter((o) => o.draft.customer && o.draft.status === "COLLECTED");
  for (const [i, [rating, title, body, status, reply]] of REVIEWS.entries()) {
    const o = reviewable[Math.floor((i * reviewable.length) / REVIEWS.length)];
    const line = o.draft.lines[0];
    const created = new Date(o.draft.createdAt.getTime() + 2 * 86400000);
    await db.review.create({
      data: {
        ownerId, customerId: o.draft.customer?.id, orderId: o.id, productId: line.product.id, rating, title, body, status,
        authorName: o.draft.customer?.name, authorEmail: o.draft.customer?.email, verified: true,
        sellerReply: reply, repliedAt: reply ? new Date(created.getTime() + 86400000) : null, createdAt: created,
      },
    });
  }

  const member = await db.standMember.create({
    data: { standId, ownerId, email: SUPPLIER_EMAIL, name: "Hills Honey Co", status: "ACTIVE", inviteToken: randomBytes(16).toString("hex") },
  });
  const honey = await db.product.create({
    data: {
      ownerId, standId, currency, memberId: member.id, name: "Wildflower Honey 500g", slug: "wildflower-honey-500g",
      description: "Raw wildflower honey from Hills Honey Co.", priceCents: 900, supplierUnitCents: 600,
      sku: `${SKU_PREFIX}HONEY`, stockQuantity: 12, lowStockThreshold: 3,
    },
  });
  await db.productChannel.create({ data: { productId: honey.id, channelType: "STAND", standId, isEnabled: true } });

  const list = await db.customerSegment.findFirst({ where: { ownerId, name: LIST_NAME }, select: { id: true } });
  await db.campaign.create({
    data: {
      ownerId, name: CAMPAIGN_NAME, status: "DRAFT", subject: "Focaccia's on this Friday",
      previewText: "Order by Wednesday 6pm", heading: "Friday Focaccia Bake",
      body: "Rosemary & sea salt focaccia and choc chip cookies, baked Friday morning. Order by Wednesday 6pm and collect from the bakery door.",
      ctaLabel: "Pre-order now", audienceType: "list", audienceRefId: list?.id ?? null, segmentId: list?.id ?? null,
    },
  });

  const location = await db.pickupLocation.create({
    data: {
      ownerId, standId, type: "FARM_STAND", name: PICKUP_NAME, publicLabel: "Bakery door, Green Valley Rd",
      addressLine1: "18 Green Valley Rd", suburb: "Green Valley", publicInstructions: "Ring the bell; orders are on the left shelf.",
    },
  });
  await db.pickupWindow.create({
    data: {
      ownerId, pickupLocationId: location.id, label: "Friday pick up", recurrence: "WEEKLY",
      weekday: 5, startTimeMin: 540, endTimeMin: 720, orderCloseWeekday: 3, orderCloseTimeMin: 1080, maxOrders: 40,
    },
  });

  const counted = at(weekStart(1), 6, 17);
  for (const p of [cat.focaccia, cat.cookies]) {
    const row = await db.product.findUniqueOrThrow({ where: { id: p.id }, select: { stockQuantity: true } });
    const change = p.id === cat.focaccia.id ? -2 : -1;
    const next = row.stockQuantity + change;
    await db.product.update({ where: { id: p.id }, data: { stockQuantity: next } });
    await db.inventoryAdjustment.create({
      data: {
        productId: p.id, ownerId, standId, changeQuantity: change, previousQuantity: row.stockQuantity, newQuantity: next,
        reason: `Stock count ${MARK}`, source: "RECONCILIATION", createdAt: counted,
      },
    });
  }
  console.log("Extras: 8 reviews, supplier + honey, draft campaign, pickup point, stock count");
}
