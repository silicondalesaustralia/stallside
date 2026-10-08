/** Near-cost pass-through for AnalyzeExpense (USD per page). Override via env for billing. */
export const ANALYZE_EXPENSE_COST_USD_PER_PAGE = Number(
  process.env.TEXTRACT_ANALYZE_EXPENSE_COST_USD ?? '0.01',
)

export function textractCostUsdForPages(pages: number): number {
  const n = Math.max(1, Math.round(pages))
  return n * ANALYZE_EXPENSE_COST_USD_PER_PAGE
}
