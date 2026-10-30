import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useBusiness } from "@/business/useBusiness";
import { useEmailPickupGroup } from "@/data/useCollections";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PrimaryButton from "@/components/PrimaryButton";

/** Same as "Email customers" on a web pick-up page: one message to every customer on the group. */
export default function PickupEmailScreen() {
  const { groupKey, title } = useLocalSearchParams<{
    groupKey: string;
    title?: string;
  }>();
  const { selected } = useBusiness();
  const send = useEmailPickupGroup();
  const [subject, setSubject] = useState(
    title ? `About your order: ${title}` : "",
  );
  const [message, setMessage] = useState("");
  const ready = Boolean(
    selected && groupKey && subject.trim() && message.trim(),
  );

  function confirm() {
    if (!selected || !groupKey) return;
    Alert.alert(
      "Send this email?",
      "Every customer on this pick-up with an email address gets it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () =>
            send.mutate(
              { standId: selected.id, groupKey, subject, message },
              {
                onSuccess: (result) => {
                  Alert.alert("Sending", result.summary);
                  router.back();
                },
                onError: (error) => Alert.alert("Couldn't send", error.message),
              },
            ),
        },
      ],
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Card>
          <FormField
            label="Subject"
            value={subject}
            onChangeText={setSubject}
          />
          <FormField
            label="Message"
            value={message}
            onChangeText={setMessage}
            multiline
            placeholder="e.g. Pickup moves to 10am this Saturday."
            hint="Customers' replies come back to you by email."
          />
        </Card>
        <PrimaryButton
          label="Send to customers"
          loading={send.isPending}
          disabled={!ready}
          onPress={confirm}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
});
