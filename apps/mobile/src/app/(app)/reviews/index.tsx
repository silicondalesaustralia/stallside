import { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { MobileReviewStatus, ReviewsResponse } from "@contracts/mobile/reviews";
import { useReviews } from "@/data/useReviews";
import { openReview } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import ChipRow from "@/components/ChipRow";
import ReviewRow from "@/components/ReviewRow";
import ErrorMessage from "@/components/ErrorMessage";

type Tab = MobileReviewStatus | "ALL";

function tabs(counts: ReviewsResponse["counts"] | undefined) {
  const n = (value: number | undefined) => (value == null ? "" : ` (${value})`);
  const total = counts ? counts.PENDING + counts.APPROVED + counts.REJECTED : undefined;
  return [
    { value: "PENDING", label: `Waiting${n(counts?.PENDING)}` },
    { value: "APPROVED", label: `Published${n(counts?.APPROVED)}` },
    { value: "REJECTED", label: `Hidden${n(counts?.REJECTED)}` },
    { value: "ALL", label: `All${n(total)}` },
  ] as const satisfies readonly { value: Tab; label: string }[];
}

export default function ReviewsScreen() {
  const [chosen, setTab] = useState<Tab | null>(null);
  const all = useReviews(null);
  const tab: Tab = chosen ?? (all.data && all.data.counts.PENDING > 0 ? "PENDING" : "ALL");
  const reviews = useReviews(tab === "ALL" ? null : tab);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={reviews.data?.reviews ?? []}
      keyExtractor={(review) => review.id}
      renderItem={({ item }) => <ReviewRow review={item} onPress={openReview} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <ChipRow options={tabs(reviews.data?.counts)} value={tab} onChange={setTab} />
          <ErrorMessage error={reviews.error} />
        </View>
      }
      ListEmptyComponent={
        reviews.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>
            {tab === "PENDING" ? "Nothing waiting for approval." : "No reviews here yet."}
          </Text>
        )
      }
      refreshControl={
        <RefreshControl refreshing={reviews.isRefetching} onRefresh={() => void reviews.refetch()} tintColor={colors.brand} />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg * 2 },
  header: { gap: spacing.sm, marginBottom: spacing.xs },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
