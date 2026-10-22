import { prisma } from "@/lib/prisma";

/** Next free code for today, e.g. B261022-03. */
export async function nextBatchCode(ownerId: string, now = new Date()): Promise<string> {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const prefix = `B${yy}${mm}${dd}-`;
  const used = await prisma.productionBatch.count({
    where: { ownerId, batchCode: { startsWith: prefix } },
  });
  return `${prefix}${String(used + 1).padStart(2, "0")}`;
}
