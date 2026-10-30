import { prisma } from "@/lib/prisma";
import { toDateInputValue } from "@/lib/date-range";

/** The business's currency and today's date (YYYY-MM-DD) in its time zone. */
export async function loadStandLocale(stand: { id: string; timezone: string }) {
  const row = await prisma.stand.findUnique({ where: { id: stand.id }, select: { currency: true } });
  return { currency: row?.currency ?? "AUD", today: toDateInputValue(new Date(), stand.timezone) };
}
