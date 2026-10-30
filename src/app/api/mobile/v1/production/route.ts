import { productionQuery, recordBatchBody, type ProductionMessage } from "@/contracts/mobile/production";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadProductionResponse } from "@/lib/mobile/production-dto";
import { recordOwnerBatch } from "@/lib/production/record-batch";
import { mobileError, mobileJson, mobileServerError, readMobileBody, readMobileQuery } from "@/lib/mobile/http";

const day = (value: string | null) => (value ? new Date(`${value}T12:00:00Z`) : null);

/** Recipes, products, low materials and recent batches for one business. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, productionQuery);
  if (!query.ok) return query.response;
  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, query.data.standId);
  if (!stand.ok) return stand.response;
  try {
    return mobileJson(await loadProductionResponse(owner.id, stand.value));
  } catch (error) {
    return mobileServerError("Mobile production failed", error);
  }
}

/** Records a batch, same as "Record batch" on the web Batches page. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, recordBatchBody);
  if (!body.ok) return body.response;
  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, body.data.standId);
  if (!stand.ok) return stand.response;
  try {
    const { madeOn, bestBefore, batchCode, notes, ...rest } = body.data;
    const result = await recordOwnerBatch(owner.id, stand.value.id, {
      ...rest,
      batchCode: batchCode || null,
      notes: notes || null,
      madeAt: day(madeOn),
      bestBefore: day(bestBefore),
    });
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<ProductionMessage>({ message: result.message ?? "Batch recorded." });
  } catch (error) {
    return mobileServerError("Mobile record batch failed", error);
  }
}
