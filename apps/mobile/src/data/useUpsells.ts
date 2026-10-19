import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mobileOk } from "@contracts/mobile/common";
import {
  upsellDetail,
  upsellFormOptions,
  upsellSaveResponse,
  upsellsResponse,
  type UpsellInputValues,
  type UpsellsResponse,
} from "@contracts/mobile/upsells";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const path = (id: string) => `/upsells/${encodeURIComponent(id)}`;
const standQuery = (standId: string | null) =>
  `standId=${encodeURIComponent(standId ?? "")}`;

export function useUpsells(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["upsells", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(`/upsells?${standQuery(standId)}`, {
        token,
        schema: upsellsResponse,
      }),
  });
}

export function useUpsell(upsellId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["upsell", upsellId],
    enabled: Boolean(token && upsellId),
    queryFn: () =>
      apiFetch(path(upsellId ?? ""), { token, schema: upsellDetail }),
  });
}

/** Products and categories the form can pick from. */
export function useUpsellOptions(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["upsell-options", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(`/upsells/options?${standQuery(standId)}`, {
        token,
        schema: upsellFormOptions,
      }),
  });
}

/** Creates when there's no id yet (needs the business), otherwise updates. */
export function useSaveUpsell(upsellId: string | null, standId: string | null) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsellInputValues) =>
      upsellId
        ? apiFetch(path(upsellId), {
            method: "PUT",
            token,
            body: { input },
            schema: upsellSaveResponse,
          })
        : apiFetch("/upsells", {
            method: "POST",
            token,
            body: { standId, input },
            schema: upsellSaveResponse,
          }),
    onSuccess: ({ id }) => {
      void queryClient.invalidateQueries({ queryKey: ["upsells"] });
      void queryClient.invalidateQueries({ queryKey: ["upsell", id] });
    },
  });
}

/** Flips the switch straight away, then refetches whatever the server says. */
export function useSetUpsellActive() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch(path(id), {
        method: "PATCH",
        token,
        body: { isActive },
        schema: mobileOk,
      }),
    onMutate: ({ id, isActive }) => {
      queryClient.setQueriesData<UpsellsResponse>(
        { queryKey: ["upsells"] },
        (data) =>
          data
            ? {
                ...data,
                upsells: data.upsells.map((u) =>
                  u.id === id ? { ...u, isActive } : u,
                ),
              }
            : data,
      );
    },
    onSettled: (_result, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["upsells"] });
      void queryClient.invalidateQueries({ queryKey: ["upsell", id] });
    },
  });
}

export function useDeleteUpsell() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(path(id), { method: "DELETE", token, schema: mobileOk }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["upsells"] }),
  });
}
