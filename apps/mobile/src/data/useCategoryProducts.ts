import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  categoryDetailResponse,
  type CategoryDetailResponse,
} from "@contracts/mobile/categories";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";
import { useStoreCategory } from "@/data/useCategories";

const productsPath = (id: string) =>
  `/categories/${encodeURIComponent(id)}/products`;

export function useSetCategoryProducts(categoryId: string) {
  const token = useToken();
  const store = useStoreCategory(categoryId);
  return useMutation({
    mutationFn: (productIds: string[]) =>
      apiFetch(productsPath(categoryId), {
        method: "PUT",
        token,
        body: { productIds },
        schema: categoryDetailResponse,
      }),
    onSuccess: store,
  });
}

/** Shows the new order straight away; the server's copy replaces it when it answers. */
export function useSaveCategoryProductOrder(categoryId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  const store = useStoreCategory(categoryId);
  return useMutation({
    mutationFn: (detail: CategoryDetailResponse) =>
      apiFetch(productsPath(categoryId), {
        method: "PATCH",
        token,
        body: { order: detail.products.map((p) => p.id) },
        schema: categoryDetailResponse,
      }),
    onMutate: (detail) =>
      queryClient.setQueryData(["category", categoryId], detail),
    onSuccess: store,
    onError: () =>
      queryClient.invalidateQueries({ queryKey: ["category", categoryId] }),
  });
}
