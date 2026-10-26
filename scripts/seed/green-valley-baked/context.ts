import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../src/generated/prisma/client";

export const STAND_SLUG = "green-valley-baked-goods";
export const OWNER_EMAIL = "jono@silicondales.com";
/** Every seeded row carries one of these markers so `reset` can find it. */
export const MARK = "[mock-seed]";
export const ORDER_PREFIX = "FS-MOCK-";
export const BATCH_PREFIX = "MOCK-";
export const SKU_PREFIX = "MOCK-";
export const EMAIL_SUFFIX = ".mock@example.com";
export const CUSTOMER_SOURCE = "mock-seed";

export const COOKIE_PRODUCT_NAME = "6 Choc Chip Cookies";
export const CATEGORY_SLUGS = ["breads", "cookies-sweet-treats"];
export const PREORDER_SLUGS = ["friday-focaccia-bake", "labor-day-long-weekend-bake"];
export const OFFER_SLUGS = ["weekly-focaccia", "green-valley-bakery-club"];
export const PROMO_CODES = ["FIRST10", "FOCACCIA2", "WINTER15", "VIP5"];
export const TAG_NAMES = ["Friday regular", "Bakery Club"];
export const LIST_NAME = "Friday regulars";
export const CAMPAIGN_NAME = "This Friday's bake";
export const UPSELL_NAME = "Add cookies to your focaccia";
export const QR_NAMES = ["Focaccia poster", "Friday bake poster"];
export const PICKUP_NAME = "Green Valley bakery door";
export const SUPPLIER_EMAIL = `hills.honey${EMAIL_SUFFIX}`;

export type Db = PrismaClient;

export function connect(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL missing");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export type Scope = { ownerId: string; standId: string; currency: string };

export async function loadScope(db: PrismaClient): Promise<Scope> {
  const stand = await db.stand.findFirst({
    where: { slug: STAND_SLUG, owner: { user: { email: OWNER_EMAIL } } },
    select: { id: true, ownerId: true, currency: true },
  });
  if (!stand) throw new Error(`${STAND_SLUG} not found for ${OWNER_EMAIL}`);
  return { ownerId: stand.ownerId, standId: stand.id, currency: stand.currency };
}

const DAY = 24 * 60 * 60 * 1000;

/** Monday 00:00 local of the week `weeksAgo` before the current one. */
export function weekStart(weeksAgo: number, now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const sinceMonday = (d.getDay() + 6) % 7;
  return new Date(d.getTime() - (sinceMonday + weeksAgo * 7) * DAY);
}

/** `days` after `base`, at hour:minute local time. */
export function at(base: Date, days: number, hour: number, minute = 0): Date {
  const d = new Date(base.getTime() + days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** Deterministic pseudo-random so re-runs produce the same history. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function pick<T>(rand: () => number, list: readonly T[]): T {
  return list[Math.floor(rand() * list.length)];
}
