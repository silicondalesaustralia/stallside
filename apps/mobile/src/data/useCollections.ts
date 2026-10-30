import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  advanceCollectionResponse,
  collectionEmailResponse,
  collectionsResponse,
  type CollectionEmailBody,
} from "@contracts/mobile/collections";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const POLL_MS = 60_000;

export function useCollections(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["collections", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(
        `/collections?${new URLSearchParams({ standId: standId ?? "" }).toString()}`,
        {
          token,
          schema: collectionsResponse,
        },
      ),
    refetchInterval: POLL_MS,
  });
}

export function useEmailPickupGroup() {
  const token = useToken();
  return useMutation({
    mutationFn: (body: CollectionEmailBody) =>
      apiFetch("/collections/email", {
        method: "POST",
        token,
        body,
        schema: collectionEmailResponse,
      }),
  });
}

export function useAdvanceCollection() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      apiFetch(`/collections/${encodeURIComponent(orderId)}/advance`, {
        method: "POST",
        token,
        schema: advanceCollectionResponse,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["collections"] }),
  });
}
