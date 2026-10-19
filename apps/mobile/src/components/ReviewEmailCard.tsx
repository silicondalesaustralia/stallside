import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import type { MobileReview } from "@contracts/mobile/reviews";
import { useEmailReviewer } from "@/data/useReviews";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";

/** Private email to the reviewer, same as the web; their reply goes to the owner's inbox. */
export default function ReviewEmailCard({ review }: { review: MobileReview }) {
  const [subject, setSubject] = useState("Thanks for your review");
  const [message, setMessage] = useState("");
  const send = useEmailReviewer(review.id);
  if (!review.authorEmail) return null;

  function submit() {
    send.mutate(
      { subject, message },
      {
        onSuccess: () => {
          setMessage("");
          Alert.alert("Email sent", "Their reply will come to your inbox.");
        },
        onError: (error) => Alert.alert("Couldn't send", error.message),
      },
    );
  }

  return (
    <Card title={`Email ${review.authorName}`}>
      <TextInput style={styles.input} value={subject} onChangeText={setSubject} maxLength={150} />
      <TextInput
        style={[styles.input, styles.message]}
        value={message}
        onChangeText={setMessage}
        placeholder={`Hi ${review.authorName},`}
        multiline
        maxLength={5000}
        textAlignVertical="top"
      />
      <Text style={styles.hint}>Sent privately to {review.authorEmail}.</Text>
      <PrimaryButton
        label="Send email"
        loading={send.isPending}
        disabled={!subject.trim() || !message.trim()}
        onPress={submit}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  message: { minHeight: 110, paddingTop: spacing.sm },
  hint: { color: colors.muted, fontSize: 13 },
});
