import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useReview } from "@/data/useReviews";
import { formatDateTime } from "@/lib/format";
import { openProduct } from "@/lib/navigation";
import { REVIEW_STATUS_LABEL, reviewSubject } from "@/lib/review-labels";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import Stars from "@/components/Stars";
import ReviewActions from "@/components/ReviewActions";
import ReviewReplyCard from "@/components/ReviewReplyCard";
import ReviewEmailCard from "@/components/ReviewEmailCard";
import ErrorMessage from "@/components/ErrorMessage";

export default function ReviewDetailScreen() {
  const { reviewId } = useLocalSearchParams<{ reviewId: string }>();
  const review = useReview(reviewId);
  const r = review.data;

  if (review.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  if (!r) {
    return (
      <View style={styles.center}>
        <ErrorMessage error={review.error} />
      </View>
    );
  }

  const customerId = r.customerId;
  const productId = r.productId;
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <View style={styles.header}>
            <Stars rating={r.rating} />
            <Text style={styles.status}>{REVIEW_STATUS_LABEL[r.status]}</Text>
          </View>
          {r.title ? <Text style={styles.title}>{r.title}</Text> : null}
          <Text style={styles.body}>{r.body}</Text>
          <Text style={styles.meta}>
            {r.authorName} {reviewSubject(r)} · {formatDateTime(r.createdAt)}
          </Text>
          {r.verified ? <Text style={styles.verified}>✓ Verified buyer</Text> : null}
          <View style={styles.links}>
            {customerId ? (
              <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: "/customers/[customerId]", params: { customerId } })}>
                <Text style={styles.link}>View customer</Text>
              </Pressable>
            ) : null}
            {productId ? (
              <Pressable accessibilityRole="link" onPress={() => openProduct(productId)}>
                <Text style={styles.link}>View product</Text>
              </Pressable>
            ) : null}
          </View>
        </Card>
        <ReviewActions review={r} />
        <ReviewReplyCard key={r.sellerReply ?? ""} review={r} />
        <ReviewEmailCard review={r} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  screen: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.lg * 2 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  status: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  title: { color: colors.text, fontSize: 17, fontWeight: "700" },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  meta: { color: colors.muted, fontSize: 13 },
  verified: { color: colors.brand, fontSize: 13, fontWeight: "700" },
  links: { flexDirection: "row", gap: spacing.md },
  link: { color: colors.brand, fontWeight: "600" },
});
