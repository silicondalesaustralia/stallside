/**
 * Read-only audit of every Order: what the admin dashboard used to count
 * (fee-bearing only) vs every counted sale, plus orders stuck unconfirmed.
 *
 * Usage (production):
 *   vercel env pull .env.production.local --environment=production
 *   set -a && source .env.production.local && set +a
 *   npx tsx scripts/audit-sales-records.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const COUNTED = [
  "PAID",
  "CUSTOMER_CONFIRMED",
  "DEPOSIT_PAID",
  "BALANCE_DUE",
  "BALANCE_FAILED",
];

type Row = {
  method: string;
  status: string;
  currency: string;
  hasFee: boolean;
  lifetime: boolean;
  count: number;
  cents: bigint;
};

function clean(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/^["']|["']$/g, "");
}

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

async function main() {
  const databaseUrl = clean(process.env.DATABASE_URL);
  if (!databaseUrl) throw new Error("DATABASE_URL missing");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT o."paymentMethod"::text AS method,
             o."paymentStatus"::text AS status,
             o.currency AS currency,
             (o."platformFeeCents" > 0) AS "hasFee",
             ow."lifetimeAccess" AS lifetime,
             COUNT(*)::int AS count,
             COALESCE(SUM(o."totalCents"), 0)::bigint AS cents
      FROM "Order" o
      JOIN "Owner" ow ON ow.id = o."ownerId"
      GROUP BY 1, 2, 3, 4, 5
      ORDER BY 1, 2, 3
    `;

    console.table(
      rows.map(({ cents, ...r }) => ({ ...r, total: dollars(Number(cents)) })),
    );

    const summary = new Map<string, { count: number; cents: number }>();
    const add = (key: string, r: Row) => {
      const cur = summary.get(key) ?? { count: 0, cents: 0 };
      cur.count += r.count;
      cur.cents += Number(r.cents);
      summary.set(key, cur);
    };

    for (const r of rows) {
      const counted = COUNTED.includes(r.status);
      const key = `${r.currency}`;
      if (!counted) {
        add(`${key} · not counted (${r.status}, ${r.method})`, r);
        continue;
      }
      add(`${key} · all counted sales (now shown)`, r);
      if (r.hasFee) add(`${key} · fee-bearing (old admin view)`, r);
      else add(`${key} · no-fee sales (previously hidden)`, r);
      if (!r.hasFee && r.lifetime) add(`${key} ·   of which Free for Life`, r);
      if (!r.hasFee && r.method === "CASH") add(`${key} ·   of which cash`, r);
      if (!r.hasFee && r.method === "LOCAL_TRANSFER") {
        add(`${key} ·   of which PayID / transfer`, r);
      }
    }

    console.log("\nSummary (native currency):");
    for (const [key, v] of [...summary.entries()].sort()) {
      console.log(`${key.padEnd(58)} ${String(v.count).padStart(6)}  ${dollars(v.cents)}`);
    }
    console.log(
      "\nStuck PENDING / EXPIRED card orders can be recovered with scripts/backfill-unconfirmed-card-sales.ts",
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
