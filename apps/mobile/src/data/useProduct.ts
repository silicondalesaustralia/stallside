import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  mobileProductDetail,
  type MobileProductDetail,
  type ProductPriceBody,
  type ProductStatusBody,
} from "@contracts/mobile/product-detail";
import { apiFetch } from "@/lib/api";
import type { PickedPhoto } from "@/lib/pick-photo";
import { useToken } from "@/auth/useAuth";

const productPath = (productId: string) =>
  `/products/${encodeURIComponent(productId)}`;

export function useProduct(productId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["product", productId],
    enabled: Boolean(token && productId),
    queryFn: () =>
      apiFetch(productPath(productId), { token, schema: mobileProductDetail }),
  });
}

function useStoreProduct(productId: string) {
  const queryClient = useQueryClient();
  return (product: MobileProductDetail) => {
    queryClient.setQueryData(["product", productId], product);
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["home"] });
    void queryClient.invalidateQueries({ queryKey: ["inventory"] });
  };
}

export function useSaveProductPrice(productId: string) {
  const token = useToken();
  const store = useStoreProduct(productId);
  return useMutation({
    mutationFn: (body: ProductPriceBody) =>
      apiFetch(productPath(productId), {
        method: "PATCH",
        token,
        body,
        schema: mobileProductDetail,
      }),
    onSuccess: store,
  });
}

export function useSetVariantStock(productId: string) {
  const token = useToken();
  const store = useStoreProduct(productId);
  return useMutation({
    mutationFn: (input: { variantId: string; quantity: number }) =>
      apiFetch(
        `${productPath(productId)}/variants/${encodeURIComponent(input.variantId)}/stock`,
        {
          method: "PUT",
          token,
          body: { quantity: input.quantity },
          schema: mobileProductDetail,
        },
      ),
    onSuccess: store,
  });
}

export function useAddProductPhoto(productId: string) {
  const token = useToken();
  const store = useStoreProduct(productId);
  return useMutation({
    mutationFn: (photo: PickedPhoto) => {
      const body = new FormData();
      body.append("image", photo);
      return apiFetch(`${productPath(productId)}/photos`, {
        method: "POST",
        token,
        body,
        schema: mobileProductDetail,
      });
    },
    onSuccess: store,
  });
}

export function useRemoveProductPhoto(productId: string) {
  const token = useToken();
  const store = useStoreProduct(productId);
  return useMutation({
    mutationFn: (url: string) =>
      apiFetch(
        `${productPath(productId)}/photos?url=${encodeURIComponent(url)}`,
        {
          method: "DELETE",
          token,
          schema: mobileProductDetail,
        },
      ),
    onSuccess: store,
  });
}

/** Saves a new order; the first photo becomes the main photo. */
export function useReorderProductPhotos(productId: string) {
  const token = useToken();
  const store = useStoreProduct(productId);
  return useMutation({
    mutationFn: (order: string[]) =>
      apiFetch(`${productPath(productId)}/photos`, {
        method: "PUT",
        token,
        body: { order },
        schema: mobileProductDetail,
      }),
    onSuccess: store,
  });
}

export function useSetProductStatus(productId: string) {
  const token = useToken();
  const store = useStoreProduct(productId);
  return useMutation({
    mutationFn: (body: ProductStatusBody) =>
      apiFetch(`${productPath(productId)}/status`, {
        method: "POST",
        token,
        body,
        schema: mobileProductDetail,
      }),
    onSuccess: store,
  });
}
