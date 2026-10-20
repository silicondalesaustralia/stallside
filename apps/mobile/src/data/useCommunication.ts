import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  audienceCountResponse,
  campaignDetailResponse,
  campaignSendResponse,
  communicationResponse,
  composeOptionsResponse,
  listMembersResponse,
  type CommunicationAudience,
  type CommunicationInput,
} from "@contracts/mobile/communication";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useCommunication() {
  const token = useToken();
  return useQuery({
    queryKey: ["communication"],
    enabled: Boolean(token),
    queryFn: () =>
      apiFetch("/communication", { token, schema: communicationResponse }),
  });
}

/** Refreshes every 10 seconds while the message is still sending. */
export function useCampaign(campaignId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["campaign", campaignId],
    enabled: Boolean(token && campaignId),
    queryFn: () =>
      apiFetch(`/communication/${encodeURIComponent(campaignId)}`, {
        token,
        schema: campaignDetailResponse,
      }),
    refetchInterval: (query) =>
      query.state.data?.campaign.status === "SENDING" ? 10_000 : false,
  });
}

export function useComposeOptions() {
  const token = useToken();
  return useQuery({
    queryKey: ["compose-options"],
    enabled: Boolean(token),
    queryFn: () =>
      apiFetch("/communication/options", {
        token,
        schema: composeOptionsResponse,
      }),
  });
}

export function useListMembers(listId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["list-members", listId],
    enabled: Boolean(token && listId),
    queryFn: () =>
      apiFetch(
        `/communication/lists/${encodeURIComponent(listId ?? "")}/members`,
        {
          token,
          schema: listMembersResponse,
        },
      ),
  });
}

export function useAudienceCount() {
  const token = useToken();
  return useMutation({
    mutationFn: (audience: CommunicationAudience) =>
      apiFetch("/communication/audience", {
        method: "POST",
        token,
        body: audience,
        schema: audienceCountResponse,
      }),
  });
}

export function useSendCommunication() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CommunicationInput) =>
      apiFetch("/communication", {
        method: "POST",
        token,
        body: input,
        schema: campaignSendResponse,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["communication"] }),
  });
}
