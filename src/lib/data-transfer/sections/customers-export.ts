import { prisma } from "@/lib/prisma";
import { toCsv, zonedDateTime } from "@/lib/order-export/csv";
import type { DataContext } from "../context";
import { yesNo } from "../values";

export const CUSTOMER_HEADERS = [
  "email",
  "name",
  "phone",
  "notes",
  "marketing_consent",
  "source",
  "created",
] as const;

export const CUSTOMER_TEMPLATE_ROW = [
  "sam@example.com",
  "Sam Smith",
  "0400 000 000",
  "Collects on Saturdays",
  "yes",
  "Farmers market",
  "",
];

export async function exportCustomers(ctx: DataContext): Promise<string> {
  const customers = await prisma.customer.findMany({
    where: { ownerId: ctx.ownerId },
    orderBy: { createdAt: "asc" },
  });
  const rows = customers.map((c) => [
    c.email,
    c.name,
    c.phone,
    c.notes,
    yesNo(c.marketingConsent),
    c.source,
    zonedDateTime(c.createdAt, ctx.stand.timeZone),
  ]);
  return toCsv(CUSTOMER_HEADERS, rows);
}
