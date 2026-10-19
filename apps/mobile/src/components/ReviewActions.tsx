import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type { MobileReview, MobileReviewStatus } from "@contracts/mobile/reviews";
import { useDeleteReview, useSetReviewStatus } from "@/data/useReviews";
import { colors, spacing } from "@/lib/theme";
import PrimaryButton from "@/components/PrimaryButton";

/** Approve & publish, hide, delete: the same choices as the web Reviews page. */
export default function ReviewActions({ review }: { review: MobileReview }) {
  const setStatus = useSetReviewStatus(review.id);
  const remove = useDeleteReview();
  const busy = setStatus.isPending || remove.isPending;
  const failed = (error: Error) => Alert.alert("Couldn't update review", error.message);
  const move = (status: MobileReviewStatus) => setStatus.mutate(status, { onError: failed });

  function confirmDelete() {
    Alert.alert("Delete this review?", "It's removed from your website and can't be brought back.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => remove.mutate(review.id, { onSuccess: () => router.back(), onError: failed }),
      },
    ]);
  }

  return (
    <View style={styles.wrap}>
      {review.status !== "APPROVED" ? (
        <PrimaryButton label="Approve & publish" loading={setStatus.isPending} disabled={busy} onPress={() => move("APPROVED")} />
      ) : null}
      <View style={styles.row}>
        {review.status !== "REJECTED" ? (
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => move("REJECTED")} style={styles.button}>
            <Text style={styles.label}>Hide</Text>
          </Pressable>
        ) : (
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => move("PENDING")} style={styles.button}>
            <Text style={styles.label}>Move to waiting</Text>
          </Pressable>
        )}
        <Pressable accessibilityRole="button" disabled={busy} onPress={confirmDelete} style={styles.button}>
          <Text style={[styles.label, styles.danger]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: "row", gap: spacing.sm },
  button: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.surface,
  },
  label: { color: colors.text, fontWeight: "600", fontSize: 15 },
  danger: { color: colors.danger },
});
