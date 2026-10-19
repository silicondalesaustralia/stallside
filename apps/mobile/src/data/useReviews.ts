import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mobileOk } from "@contracts/mobile/common";
import {
  mobileReview,
  reviewsResponse,
  type MobileReview,
  type MobileReviewStatus,
  type ReviewEmailBody,
} from "@contracts/mobile/reviews";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const path = (id: string) => `/reviews/${encodeURIComponent(id)}`;

export function useReviews(status: MobileReviewStatus | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["reviews", status],
    enabled: Boolean(token),
    queryFn: () => apiFetch(status ? `/reviews?status=${status}` : "/reviews", { token, schema: reviewsResponse }),
  });
}

export function useReview(reviewId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["review", reviewId],
    enabled: Boolean(token && reviewId),
    queryFn: () => apiFetch(path(reviewId), { token, schema: mobileReview }),
  });
}

function useStoreReview(reviewId: string) {
  const queryClient = useQueryClient();
  return (review: MobileReview) => {
    queryClient.setQueryData(["review", reviewId], review);
    void queryClient.invalidateQueries({ queryKey: ["reviews"] });
  };
}

export function useSetReviewStatus(reviewId: string) {
  const token = useToken();
  const store = useStoreReview(reviewId);
  return useMutation({
    mutationFn: (status: MobileReviewStatus) =>
      apiFetch(path(reviewId), { method: "PATCH", token, body: { status }, schema: mobileReview }),
    onSuccess: store,
  });
}

export function useSaveReviewReply(reviewId: string) {
  const token = useToken();
  const store = useStoreReview(reviewId);
  return useMutation({
    mutationFn: (reply: string) =>
      apiFetch(`${path(reviewId)}/reply`, { method: "PUT", token, body: { reply }, schema: mobileReview }),
    onSuccess: store,
  });
}

export function useEmailReviewer(reviewId: string) {
  const token = useToken();
  return useMutation({
    mutationFn: (body: ReviewEmailBody) =>
      apiFetch(`${path(reviewId)}/email`, { method: "POST", token, body, schema: mobileOk }),
  });
}

export function useDeleteReview() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => apiFetch(path(reviewId), { method: "DELETE", token, schema: mobileOk }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}
