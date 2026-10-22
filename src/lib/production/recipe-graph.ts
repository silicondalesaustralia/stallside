import type { CostContext } from "./batch-costing";

/** True when adding `componentId` as a line of `recipeId` would create a loop. */
export function wouldCreateLoop(recipeId: string, componentId: string, ctx: CostContext): boolean {
  const stack = [componentId];
  const seen = new Set<string>();
  for (let id = stack.pop(); id !== undefined; id = stack.pop()) {
    if (id === recipeId) return true;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const line of ctx.recipes.get(id)?.lines ?? []) {
      if (line.componentRecipeId) stack.push(line.componentRecipeId);
    }
  }
  return false;
}
