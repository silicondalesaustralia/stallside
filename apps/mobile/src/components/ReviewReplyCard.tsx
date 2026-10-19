import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { REVIEW_REPLY_MAX, type MobileReview } from "@contracts/mobile/reviews";
import { useSaveReviewReply } from "@/data/useReviews";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";

/** Public reply under the review on the website; clearing it and saving removes it. */
export default function ReviewReplyCard({ review }: { review: MobileReview }) {
  const [reply, setReply] = useState(review.sellerReply ?? "");
  const save = useSaveReviewReply(review.id);
  const unchanged = reply.trim() === (review.sellerReply ?? "");

  function submit() {
    save.mutate(reply, {
      onSuccess: (saved) =>
        Alert.alert(saved.sellerReply ? "Reply saved" : "Reply removed", saved.sellerReply ? "It shows under the review once it's published." : undefined),
      onError: (error) => Alert.alert("Couldn't save reply", error.message),
    });
  }

  return (
    <Card title={review.sellerReply ? "Your public reply" : "Reply publicly"}>
      <TextInput
        style={styles.input}
        value={reply}
        onChangeText={setReply}
        placeholder="Thanks so much for…"
        multiline
        maxLength={REVIEW_REPLY_MAX}
        textAlignVertical="top"
      />
      <Text style={styles.hint}>Shows under the review on your website once it&apos;s published.</Text>
      <PrimaryButton label="Save reply" loading={save.isPending} disabled={unchanged} onPress={submit} />
    </Card>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  hint: { color: colors.muted, fontSize: 13 },
});
