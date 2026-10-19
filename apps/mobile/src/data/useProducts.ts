import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  productsResponse,
  stockUpdateResponse,
  type ProductTab,
  type ProductsResponse,
} from "@contracts/mobile/products";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useProducts(standId: string | null, tab: ProductTab, q: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["products", standId, tab, q],
    enabled: Boolean(token && standId),
    queryFn: () => {
      const params = new URLSearchParams({ standId: standId ?? "", tab });
      if (q) params.set("q", q);
      return apiFetch(`/products?${params.toString()}`, { token, schema: productsResponse });
    },
  });
}

export function useSetStock() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { productId: string; quantity: number }) =>
      apiFetch(`/products/${encodeURIComponent(input.productId)}/stock`, {
        method: "PUT",
        token,
        body: { quantity: input.quantity },
        schema: stockUpdateResponse,
      }),
    onSuccess: (result) => {
      queryClient.setQueriesData<ProductsResponse>({ queryKey: ["products"] }, (data) =>
        data
          ? {
              products: data.products.map((p) =>
                p.id === result.productId ? { ...p, stockQuantity: result.stockQuantity } : p,
              ),
            }
          : data,
      );
      void queryClient.invalidateQueries({ queryKey: ["home"] });
      void queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
