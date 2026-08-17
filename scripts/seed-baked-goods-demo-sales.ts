/**
 * Seed ~7 days of mock sales for Green Valley Baked Goods (promo video).
 *
 * Targets (USD): $350 total · $200 subscription · $100 pre-order · $50 stall.
 * Order numbers look like live FS-* ids (no DEMO markers).
 *
 * Usage: npx tsx scripts/seed-baked-goods-demo-sales.ts
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import {
  CollectionStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentTiming,
  PrismaClient,
  ReceiptChannel,
  ShopperSubStatus,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const STAND_SLUG = "green-valley-baked-goods";

/** Stable ids so re-runs replace the same promo set. */
const SEED_ORDER_NUMBERS = [
  "FS-MSV7A1K2",
  "FS-MSV7B3M4",
  "FS-MSV7C5N6",
  "FS-MSV7D7P8",
  "FS-MSV8E9Q1",
  "FS-MSV8F2R3",
  "FS-MSV8G4S5",
  "FS-MSV8H6T7",
  "FS-MSV9J8U9",
  "FS-MSV9K1V2",
  "FS-MSV9L3W4",
  "FS-MSV9M5X6",
  "FS-MSW0N7Y8",
  "FS-MSW0P9Z1",
  "FS-MSW0Q2A3",
  "FS-MSW0R4B5",
] as const;

const PRODUCTS = {
  rye: {
    id: "cmsmo71hq0001m6s3e54e2tkz",
    name: "1 x Loaf Rye - Pre Order",
    priceCents: 250,
  },
  cookiesStall: {
    id: "cmsmonfx50004m6s3x63yfc0a",
    name: "6 Choc Chip Cookies",
    priceCents: 500,
  },
  bagCookies: {
    id: "cmsmq9fwb00014cs3c5nhi6wu",
    name: "Bag 6 x Choc Chip Cookies",
    priceCents: 500,
  },
} as const;

type Line = {
  productId: string;
  productNameSnapshot: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

type DraftOrder = {
  orderNumber: string;
  channel: "stall" | "preorder" | "subscription";
  daysAgo: number;
  hour: number;
  minute: number;
  customerName: string;
  receiptEmail: string;
  paymentMethod: PaymentMethod;
  lines: Line[];
  subIndex?: number;
};

function line(
  product: (typeof PRODUCTS)[keyof typeof PRODUCTS],
  quantity: number,
): Line {
  return {
    productId: product.id,
    productNameSnapshot: product.name,
    quantity,
    unitPriceCents: product.priceCents,
    lineTotalCents: product.priceCents * quantity,
  };
}

function totalOf(lines: Line[]) {
  return lines.reduce((s, l) => s + l.lineTotalCents, 0);
}

function atLocalDaysAgo(daysAgo: number, hour: number, minute: number) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function buildDrafts(): DraftOrder[] {
  const n = SEED_ORDER_NUMBERS;
  return [
    {
      orderNumber: n[0],
      channel: "stall",
      daysAgo: 6,
      hour: 9,
      minute: 12,
      customerName: "Priya Nair",
      receiptEmail: "priya.nair@example.com",
      paymentMethod: PaymentMethod.CASH,
      lines: [line(PRODUCTS.cookiesStall, 2)],
    },
    {
      orderNumber: n[1],
      channel: "stall",
      daysAgo: 4,
      hour: 14,
      minute: 40,
      customerName: "Marcus Webb",
      receiptEmail: "marcus.webb@example.com",
      paymentMethod: PaymentMethod.LOCAL_TRANSFER,
      lines: [line(PRODUCTS.cookiesStall, 3)],
    },
    {
      orderNumber: n[2],
      channel: "stall",
      daysAgo: 2,
      hour: 11,
      minute: 5,
      customerName: "Elena Soto",
      receiptEmail: "elena.soto@example.com",
      paymentMethod: PaymentMethod.CASH,
      lines: [line(PRODUCTS.cookiesStall, 3)],
    },
    {
      orderNumber: n[3],
      channel: "stall",
      daysAgo: 0,
      hour: 8,
      minute: 55,
      customerName: "Tom Harkin",
      receiptEmail: "tom.harkin@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.cookiesStall, 2)],
    },
    {
      orderNumber: n[4],
      channel: "preorder",
      daysAgo: 6,
      hour: 16,
      minute: 20,
      customerName: "Hannah Cole",
      receiptEmail: "hannah.cole@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.rye, 6), line(PRODUCTS.bagCookies, 2)],
    },
    {
      orderNumber: n[5],
      channel: "preorder",
      daysAgo: 5,
      hour: 10,
      minute: 8,
      customerName: "Owen Blake",
      receiptEmail: "owen.blake@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.bagCookies, 3)],
    },
    {
      orderNumber: n[6],
      channel: "preorder",
      daysAgo: 3,
      hour: 19,
      minute: 30,
      customerName: "Sofia Mendes",
      receiptEmail: "sofia.mendes@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.rye, 8), line(PRODUCTS.bagCookies, 2)],
    },
    {
      orderNumber: n[7],
      channel: "preorder",
      daysAgo: 1,
      hour: 13,
      minute: 15,
      customerName: "Callum Reid",
      receiptEmail: "callum.reid@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.rye, 4), line(PRODUCTS.bagCookies, 2)],
    },
    {
      orderNumber: n[8],
      channel: "preorder",
      daysAgo: 0,
      hour: 17,
      minute: 45,
      customerName: "Amira Khan",
      receiptEmail: "amira.khan@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.bagCookies, 2)],
    },
    {
      orderNumber: n[9],
      channel: "subscription",
      daysAgo: 6,
      hour: 7,
      minute: 30,
      customerName: "Bethany Rowe",
      receiptEmail: "bethany.rowe@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.rye, 10)],
      subIndex: 0,
    },
    {
      orderNumber: n[10],
      channel: "subscription",
      daysAgo: 5,
      hour: 7,
      minute: 45,
      customerName: "Diego Alvarez",
      receiptEmail: "diego.alvarez@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.rye, 8), line(PRODUCTS.bagCookies, 2)],
      subIndex: 1,
    },
    {
      orderNumber: n[11],
      channel: "subscription",
      daysAgo: 4,
      hour: 8,
      minute: 10,
      customerName: "Grace Lin",
      receiptEmail: "grace.lin@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.rye, 12)],
      subIndex: 2,
    },
    {
      orderNumber: n[12],
      channel: "subscription",
      daysAgo: 3,
      hour: 7,
      minute: 20,
      customerName: "Noah Patel",
      receiptEmail: "noah.patel@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.rye, 6), line(PRODUCTS.bagCookies, 3)],
      subIndex: 3,
    },
    {
      orderNumber: n[13],
      channel: "subscription",
      daysAgo: 2,
      hour: 8,
      minute: 0,
      customerName: "Isla Brennan",
      receiptEmail: "isla.brennan@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.rye, 10), line(PRODUCTS.bagCookies, 1)],
      subIndex: 4,
    },
    {
      orderNumber: n[14],
      channel: "subscription",
      daysAgo: 1,
      hour: 7,
      minute: 50,
      customerName: "Felix Orth",
      receiptEmail: "felix.orth@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.rye, 8), line(PRODUCTS.bagCookies, 2)],
      subIndex: 5,
    },
    {
      orderNumber: n[15],
      channel: "subscription",
      daysAgo: 0,
      hour: 7,
      minute: 15,
      customerName: "Maya Chen",
      receiptEmail: "maya.chen@example.com",
      paymentMethod: PaymentMethod.CARD,
      lines: [line(PRODUCTS.rye, 10)],
      subIndex: 6,
    },
  ];
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL missing");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const stand = await prisma.stand.findFirst({
      where: { slug: STAND_SLUG },
      select: { id: true, name: true, ownerId: true, currency: true },
    });
    if (!stand) throw new Error(`Stand not found: ${STAND_SLUG}`);

    const offer = await prisma.subscriptionOffer.findFirst({
      where: { standId: stand.id },
      select: { id: true },
    });
    if (!offer) throw new Error("No subscription offer on stand");

    const drafts = buildDrafts();
    const seedEmails = drafts.map((d) => d.receiptEmail);

    const deleted = await prisma.order.deleteMany({
      where: {
        standId: stand.id,
        OR: [
          { orderNumber: { startsWith: "FS-DEMO-" } },
          { orderNumber: { in: [...SEED_ORDER_NUMBERS] } },
          { receiptEmail: { in: seedEmails } },
          { receiptEmail: { endsWith: ".demo@example.com" } },
        ],
      },
    });
    console.log(`Removed ${deleted.count} prior promo orders`);

    await prisma.shopperSubscription.deleteMany({
      where: {
        standId: stand.id,
        OR: [
          { customerEmail: { in: seedEmails } },
          { customerEmail: { endsWith: ".demo@example.com" } },
          { manageToken: { startsWith: "demo_" } },
        ],
      },
    });

    const subDrafts = drafts.filter((d) => d.channel === "subscription");
    const subIds: string[] = [];
    for (const d of subDrafts) {
      const created = await prisma.shopperSubscription.create({
        data: {
          offerId: offer.id,
          standId: stand.id,
          ownerId: stand.ownerId,
          status: ShopperSubStatus.ACTIVE,
          customerName: d.customerName,
          customerEmail: d.receiptEmail,
          manageToken: randomBytes(16).toString("hex"),
          nextCollectionAt: atLocalDaysAgo(d.daysAgo - 7, 10, 0),
        },
      });
      subIds.push(created.id);
    }

    for (const d of drafts) {
      const createdAt = atLocalDaysAgo(d.daysAgo, d.hour, d.minute);
      const totalCents = totalOf(d.lines);
      const isPreOrder = d.channel !== "stall";
      const shopperSubscriptionId =
        d.channel === "subscription" && d.subIndex != null
          ? subIds[d.subIndex]
          : null;

      await prisma.order.create({
        data: {
          standId: stand.id,
          ownerId: stand.ownerId,
          orderNumber: d.orderNumber,
          paymentMethod: d.paymentMethod,
          paymentStatus:
            d.paymentMethod === PaymentMethod.CASH ||
            d.paymentMethod === PaymentMethod.LOCAL_TRANSFER
              ? PaymentStatus.CUSTOMER_CONFIRMED
              : PaymentStatus.PAID,
          localTransferMethodId:
            d.paymentMethod === PaymentMethod.LOCAL_TRANSFER ? "payid" : null,
          subtotalCents: totalCents,
          totalCents,
          currency: stand.currency || "USD",
          receiptEmail: d.receiptEmail,
          receiptChannel: ReceiptChannel.EMAIL,
          isPreOrder,
          collectionAt: isPreOrder
            ? atLocalDaysAgo(Math.max(0, d.daysAgo - 2), 10, 0)
            : null,
          customerName: d.customerName,
          collectionStatus: isPreOrder ? CollectionStatus.ORDERED : null,
          paymentTiming: isPreOrder
            ? PaymentTiming.PAY_UPFRONT
            : PaymentTiming.PAY_NOW,
          shopperSubscriptionId,
          createdAt,
          updatedAt: createdAt,
          items: { create: d.lines },
        },
      });
    }

    const stallCents = drafts
      .filter((d) => d.channel === "stall")
      .reduce((s, d) => s + totalOf(d.lines), 0);
    const preCents = drafts
      .filter((d) => d.channel === "preorder")
      .reduce((s, d) => s + totalOf(d.lines), 0);
    const subCents = drafts
      .filter((d) => d.channel === "subscription")
      .reduce((s, d) => s + totalOf(d.lines), 0);

    console.log(
      `Seeded ${drafts.length} orders for ${stand.name} (stall $${stallCents / 100}, pre-order $${preCents / 100}, subscription $${subCents / 100}, total $${(stallCents + preCents + subCents) / 100})`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
