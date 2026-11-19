/** Pure costing helpers for /sell demos.
 *
 * Candle assertion (blueprint §8 / §23):
 *   unitCost(68, 12, 0.8) === 6.47
 *   contribution(18, 6.47) === 11.53
 */

export type CostResult = {
  unitCost: number;
  contribution: number | null;
  contributionRate: number | null;
};

export function validateYield(saleableYield: number): string | null {
  if (!Number.isFinite(saleableYield) || saleableYield <= 0) {
    return "Saleable yield must be greater than zero.";
  }
  return null;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function unitCost(
  batchCost: number,
  saleableYield: number,
  packagingPerUnit: number,
): number {
  const err = validateYield(saleableYield);
  if (err) throw new Error(err);
  return roundMoney(batchCost / saleableYield + packagingPerUnit);
}

export function contribution(price: number, unitCostValue: number): number {
  return roundMoney(price - unitCostValue);
}

export function contributionRate(price: number, contrib: number): number | null {
  if (!Number.isFinite(price) || price <= 0) return null;
  return Math.round((contrib / price) * 1000) / 10;
}

export function batchCostFromInputs(values: number[]): number {
  return values.reduce((sum, v) => sum + (Number.isFinite(v) ? v : 0), 0);
}

export function sumScopedInputs(
  inputs: Array<{ value: number; scope: "batch" | "unit" }>,
  scope: "batch" | "unit",
): number {
  return batchCostFromInputs(
    inputs.filter((i) => i.scope === scope).map((i) => i.value),
  );
}

export function calculateCosts(opts: {
  batchCost: number;
  saleableYield: number;
  packagingPerUnit: number;
  price?: number;
}): CostResult {
  const cost = unitCost(
    opts.batchCost,
    opts.saleableYield,
    opts.packagingPerUnit,
  );
  if (opts.price == null || !Number.isFinite(opts.price)) {
    return { unitCost: cost, contribution: null, contributionRate: null };
  }
  const contrib = contribution(opts.price, cost);
  return {
    unitCost: cost,
    contribution: contrib,
    contributionRate: contributionRate(opts.price, contrib),
  };
}
