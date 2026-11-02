import { useMutation } from "@tanstack/react-query";
import {
  recipeMessage,
  type AddRecipeLineBody,
  type LinkRecipeProductBody,
  type RecipeSettings,
} from "@contracts/mobile/recipes";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";
import { useInvalidateRecipes } from "@/data/useRecipes";

type Method = "POST" | "PUT" | "DELETE";

/** One recipe's edits; every change refetches the recipe and its costs. */
function useRecipeCall<T>(
  recipeId: string,
  method: Method,
  path: (input: T) => string,
  body?: (input: T) => unknown,
) {
  const token = useToken();
  const invalidate = useInvalidateRecipes();
  return useMutation({
    mutationFn: (input: T) =>
      apiFetch(`/recipes/${encodeURIComponent(recipeId)}${path(input)}`, {
        method,
        token,
        body: body?.(input),
        schema: recipeMessage,
      }),
    onSuccess: invalidate,
  });
}

export function useSaveRecipe(recipeId: string) {
  return useRecipeCall<RecipeSettings>(
    recipeId,
    "PUT",
    () => "",
    (input) => input,
  );
}

export function useSetRecipeActive(recipeId: string) {
  return useRecipeCall<boolean>(
    recipeId,
    "POST",
    () => "/active",
    (isActive) => ({ isActive }),
  );
}

export function useAddRecipeLine(recipeId: string) {
  return useRecipeCall<AddRecipeLineBody>(
    recipeId,
    "POST",
    () => "/lines",
    (input) => input,
  );
}

export function useRemoveRecipeLine(recipeId: string) {
  return useRecipeCall<string>(
    recipeId,
    "DELETE",
    (lineId) => `/lines/${encodeURIComponent(lineId)}`,
  );
}

export function useLinkRecipeProduct(recipeId: string) {
  return useRecipeCall<LinkRecipeProductBody>(
    recipeId,
    "POST",
    () => "/products",
    (input) => input,
  );
}

export function useUnlinkRecipeProduct(recipeId: string) {
  return useRecipeCall<string>(
    recipeId,
    "DELETE",
    (productId) => `/products/${encodeURIComponent(productId)}`,
  );
}
