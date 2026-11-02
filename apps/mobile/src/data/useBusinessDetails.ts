import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  businessDetailsResponse,
  type BusinessDetailsBody,
  type BusinessSocialBody,
} from "@contracts/mobile/business";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";
import { ME_QUERY_KEY } from "@/data/useMe";

const key = (standId: string | null) => ["business-details", standId] as const;

export function useBusinessDetails(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: key(standId),
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(
        `/business?${new URLSearchParams({ standId: standId ?? "" }).toString()}`,
        { token, schema: businessDetailsResponse },
      ),
  });
}

export function useSaveBusinessDetails() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BusinessDetailsBody) =>
      apiFetch("/business", {
        method: "PUT",
        token,
        body,
        schema: businessDetailsResponse,
      }),
    onSuccess: async (data) => {
      queryClient.setQueryData(key(data.id), data);
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useSaveBusinessSocial() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BusinessSocialBody) =>
      apiFetch("/business/social", {
        method: "PUT",
        token,
        body,
        schema: businessDetailsResponse,
      }),
    onSuccess: (data) => queryClient.setQueryData(key(data.id), data),
  });
}
