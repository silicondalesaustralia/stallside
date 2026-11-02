import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  recipeDetailResponse,
  recipeMessage,
  recipesResponse,
  type CreateRecipeBody,
} from "@contracts/mobile/recipes";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const standQuery = (standId: string | null) =>
  new URLSearchParams({ standId: standId ?? "" }).toString();

export function useRecipes(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["recipes", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(`/recipes?${standQuery(standId)}`, {
        token,
        schema: recipesResponse,
      }),
  });
}

export function useRecipeDetail(standId: string | null, recipeId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["recipe", standId, recipeId],
    enabled: Boolean(token && standId && recipeId),
    queryFn: () =>
      apiFetch(
        `/recipes/${encodeURIComponent(recipeId)}?${standQuery(standId)}`,
        { token, schema: recipeDetailResponse },
      ),
  });
}

/** Recipe edits change costs shown on recipes, batches and profit. */
export function useInvalidateRecipes() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      ["recipes", "recipe", "production", "profit"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      ),
    );
}

export function useCreateRecipe() {
  const token = useToken();
  const invalidate = useInvalidateRecipes();
  return useMutation({
    mutationFn: (body: CreateRecipeBody) =>
      apiFetch("/recipes", {
        method: "POST",
        token,
        body,
        schema: recipeMessage,
      }),
    onSuccess: invalidate,
  });
}
