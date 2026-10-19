import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mobileOk } from "@contracts/mobile/common";
import {
  categoriesResponse,
  categoryDetailResponse,
  categoryIdResponse,
  type CategoriesResponse,
  type CategoryDetailResponse,
  type UpdateCategoryBody,
} from "@contracts/mobile/categories";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const path = (id: string) => `/categories/${encodeURIComponent(id)}`;

export function useCategories() {
  const token = useToken();
  return useQuery({
    queryKey: ["categories"],
    enabled: Boolean(token),
    queryFn: () =>
      apiFetch("/categories", { token, schema: categoriesResponse }),
  });
}

export function useCategory(categoryId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["category", categoryId],
    enabled: Boolean(token && categoryId),
    queryFn: () =>
      apiFetch(path(categoryId), { token, schema: categoryDetailResponse }),
  });
}

export function useCreateCategory() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) =>
      apiFetch("/categories", {
        method: "POST",
        token,
        body: { title },
        schema: categoryIdResponse,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

/** Shows the new order straight away; the server's list replaces it when it answers. */
export function useSaveCategoryOrder() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoriesResponse) =>
      apiFetch("/categories", {
        method: "PUT",
        token,
        body: { order: data.categories.map((c) => c.id) },
        schema: categoriesResponse,
      }),
    onMutate: (data) => queryClient.setQueryData(["categories"], data),
    onSuccess: (data) => queryClient.setQueryData(["categories"], data),
    onError: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

/** Publish switch on the list: flips straight away, then refetches. */
export function useSetCategoryPublished() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch(path(id), {
        method: "PATCH",
        token,
        body: { isActive },
        schema: categoryDetailResponse,
      }),
    onMutate: ({ id, isActive }) =>
      queryClient.setQueryData<CategoriesResponse>(["categories"], (data) =>
        data
          ? {
              categories: data.categories.map((c) =>
                c.id === id ? { ...c, isActive } : c,
              ),
            }
          : data,
      ),
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      void queryClient.invalidateQueries({ queryKey: ["category", id] });
    },
  });
}

/** Puts the server's updated category in the cache and refreshes the list's counts. */
export function useStoreCategory(categoryId: string) {
  const queryClient = useQueryClient();
  return (detail: CategoryDetailResponse) => {
    queryClient.setQueryData(["category", categoryId], detail);
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
  };
}

export function useUpdateCategory(categoryId: string) {
  const token = useToken();
  const store = useStoreCategory(categoryId);
  return useMutation({
    mutationFn: (body: UpdateCategoryBody) =>
      apiFetch(path(categoryId), {
        method: "PATCH",
        token,
        body,
        schema: categoryDetailResponse,
      }),
    onSuccess: store,
  });
}

export function useDeleteCategory() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) =>
      apiFetch(path(categoryId), { method: "DELETE", token, schema: mobileOk }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}
