import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MobileReview } from "@contracts/mobile/reviews";
import { formatDateTime } from "@/lib/format";
import { REVIEW_STATUS_LABEL, reviewSubject } from "@/lib/review-labels";
import { colors, spacing } from "@/lib/theme";
import Stars from "@/components/Stars";

type Props = { review: MobileReview; onPress: (reviewId: string) => void };

export default function ReviewRow({ review, onPress }: Props) {
  const pending = review.status === "PENDING";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(review.id)}
      style={({ pressed }) => [styles.row, pending && styles.pending, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Stars rating={review.rating} />
        <Text style={[styles.status, pending && styles.statusPending]}>{REVIEW_STATUS_LABEL[review.status]}</Text>
      </View>
      <Text style={styles.meta}>
        {review.authorName} {reviewSubject(review)} · {formatDateTime(review.createdAt)}
      </Text>
      {review.title ? <Text style={styles.title}>{review.title}</Text> : null}
      <Text style={styles.body} numberOfLines={3}>
        {review.body}
      </Text>
      {review.sellerReply ? <Text style={styles.replied}>You replied</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pending: { borderColor: "#e0a526", borderWidth: 2 },
  pressed: { opacity: 0.7 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  status: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  statusPending: { color: "#78350f" },
  meta: { color: colors.muted, fontSize: 13 },
  title: { color: colors.text, fontSize: 15, fontWeight: "600" },
  body: { color: colors.text, fontSize: 14, lineHeight: 20 },
  replied: { color: colors.brand, fontSize: 13, fontWeight: "600" },
});
