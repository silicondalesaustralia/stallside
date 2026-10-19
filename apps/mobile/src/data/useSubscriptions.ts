import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mobileOk } from "@contracts/mobile/common";
import {
  offerDetailResponse,
  offersResponse,
  type OfferDetailResponse,
  type OffersResponse,
} from "@contracts/mobile/subscriptions";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const path = (id: string) => `/subscriptions/${encodeURIComponent(id)}`;

export function useSubscriptionOffers(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["subscriptions", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(`/subscriptions?standId=${encodeURIComponent(standId ?? "")}`, { token, schema: offersResponse }),
  });
}

export function useSubscriptionOffer(offerId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["subscription", offerId],
    enabled: Boolean(token && offerId),
    queryFn: () => apiFetch(path(offerId), { token, schema: offerDetailResponse }),
  });
}

/** Flips the switch straight away, then refetches whatever the server says. */
export function useSetOfferActive() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch(path(id), { method: "PATCH", token, body: { isActive }, schema: mobileOk }),
    onMutate: ({ id, isActive }) => {
      queryClient.setQueriesData<OffersResponse>({ queryKey: ["subscriptions"] }, (data) =>
        data ? { offers: data.offers.map((o) => (o.id === id ? { ...o, isActive } : o)) } : data,
      );
      queryClient.setQueryData<OfferDetailResponse>(["subscription", id], (data) =>
        data ? { ...data, offer: { ...data.offer, isActive } } : data,
      );
    },
    onSettled: (_result, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      void queryClient.invalidateQueries({ queryKey: ["subscription", id] });
    },
  });
}

export function useDeleteOffer() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(path(id), { method: "DELETE", token, schema: mobileOk }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}
